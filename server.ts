import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  PRODUCT_SPECIFICATIONS, 
  validateAndCorrectConfiguration, 
  calculateProductPrice 
} from './src/components/productData.ts';
import { ProductType, SelectedConfiguration } from './src/types';
import { db } from './src/db/index.ts';
import { requireAuth, AuthRequest, hashPassword, comparePassword, generateToken } from './src/middleware/auth.ts';
import { users, carts, orders } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import Stripe from 'stripe';
import { createMollieClient } from '@mollie/api-client';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser supporting raw verify for Stripe Webhook signature verification
  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));

  // Log simple requests for monitoring
  app.use((req, res, next) => {
    console.log(`[Express API] ${req.method} ${req.url}`);
    next();
  });

  // Lazy SDK instance initializers to prevent crashes if credentials are unset
  let stripe: Stripe | null = null;
  const getStripe = (): Stripe | null => {
    if (!stripe && process.env.STRIPE_SECRET_KEY) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-04-10' as any,
      });
    }
    return stripe;
  };

  let mollieClient: ReturnType<typeof createMollieClient> | null = null;
  const getMollie = () => {
    if (!mollieClient && process.env.MOLLIE_API_KEY) {
      mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
    }
    return mollieClient;
  };

  // Health probe
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy', version: '1.0.0', service: 'stuntdruk-api' });
  });

  // 1. Dynamic Configurator API Configuration Getter
  // Evaluates options with smart graying out/notices
  app.get('/api/configurator', (req: Request, res: Response) => {
    try {
      const { productType } = req.query;
      const validProductType = productType as ProductType;
      
      if (!productType || !PRODUCT_SPECIFICATIONS[validProductType]) {
        res.status(400).json({ error: 'Valid productType query parameter is required.' });
        return;
      }

      // Read current configuration inputs from query
      const currentConfig: SelectedConfiguration = {
        size: (req.query.size as string) || '',
        paperType: (req.query.paperType as string) || '',
        printing: (req.query.printing as string) || '',
        finishing: (req.query.finishing as string) || '',
        quantity: (req.query.quantity as string) || '',
        width: (req.query.width as string) || '1.0',
        height: (req.query.height as string) || '1.0'
      };

      const sourceSpecs = PRODUCT_SPECIFICATIONS[validProductType];

      // Validate inputs and get notice corrections
      const { corrected, notices } = validateAndCorrectConfiguration(
        validProductType, 
        currentConfig
      );

      // Enhance options with dynamic compatibilities
      // E.g. Add informative tags directly on options if disabled under current paperType
      const enhancedSizes = sourceSpecs.sizes.map(s => ({
        ...s,
        disabled: false,
        disabledReason: ''
      }));

      const enhancedPaperTypes = sourceSpecs.paperTypes.map(p => ({
        ...p,
        disabled: false,
        disabledReason: ''
      }));

      const enhancedPrintings = sourceSpecs.printings.map(pr => ({
        ...pr,
        disabled: false,
        disabledReason: ''
      }));

      const enhancedFinishings = sourceSpecs.finishings.map(f => {
        let disabled = false;
        let disabledReason = '';

        if (validProductType === 'business_card') {
          if (corrected.paperType !== 'mc_mat' && (f.id === 'matt_laminate' || f.id === 'gloss_laminate')) {
            disabled = true;
            disabledReason = 'Mat- en glanslaminaat zijn enkel mogelijk op 350g Silk Mat MC papier.';
          }
        } else if (validProductType === 'flyer') {
          if (corrected.paperType !== '250g_mat' && f.id === 'uv_gloss') {
            disabled = true;
            disabledReason = 'UV-lak hoogglans kan enkel op luxe 250g mat papier voorzien worden.';
          }
        }

        return {
          ...f,
          disabled,
          disabledReason
        };
      });

      const enhancedQuantities = sourceSpecs.quantities.map(q => ({
        ...q,
        disabled: false,
        disabledReason: ''
      }));

      res.json({
        valid: true,
        attributes: {
          size: enhancedSizes,
          paperType: enhancedPaperTypes,
          printing: enhancedPrintings,
          finishing: enhancedFinishings,
          quantity: enhancedQuantities
        },
        selected: corrected,
        notices
      });
    } catch (err) {
      console.error("Configurator Error:", err);
      res.status(500).json({ error: 'Internal configurator engine error occurred.' });
    }
  });

  // 2. Heavy-Duty Surcharge and Pricing API
  app.post('/api/pricing', (req: Request, res: Response) => {
    try {
      const { productType, configuration, isExpress } = req.body;
      const validProductType = productType as ProductType;

      if (!productType || !PRODUCT_SPECIFICATIONS[validProductType]) {
        res.status(400).json({ error: 'Valid productType is required.' });
        return;
      }

      if (!configuration) {
        res.status(400).json({ error: 'configuration parameters are required.' });
        return;
      }

      const currentDate = new Date().toISOString();
      const pricingResponse = calculateProductPrice(
        validProductType,
        configuration as SelectedConfiguration,
        !!isExpress,
        currentDate
      );

      res.json(pricingResponse);
    } catch (err) {
      console.error("Pricing Engine Error:", err);
      res.status(500).json({ error: 'Internal pricing engine math error occurred.' });
    }
  });

  // 3. PostgreSQL backend routes secure-guarded by Firebase or Custom Authentication
  // 3.01. Register Custom User (PostgreSQL password hashing)
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: "E-mail, wachtwoord en volledige naam zijn verplicht." });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: "Dit e-mailadres is al in gebruik." });
      }

      // Hash password securely in SQL database
      const passwordHash = hashPassword(password);
      const localUid = `local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const newUser = await db.insert(users)
        .values({
          uid: localUid,
          email: normalizedEmail,
          passwordHash,
          fullName,
        })
        .returning();

      res.status(201).json({
        success: true,
        user: {
          id: newUser[0].id,
          uid: newUser[0].uid,
          email: newUser[0].email,
          fullName: newUser[0].fullName,
        },
      });
    } catch (error) {
      console.error("Registratiefout:", error);
      res.status(500).json({ error: "Registratie is mislukt door een serverfout." });
    }
  });

  // 3.02. Login Custom User (PostgreSQL password matching)
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "E-mail en wachtwoord zijn verplichte velden." });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Find user
      const userList = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
      if (userList.length === 0) {
        return res.status(401).json({ error: "E-mailadres of wachtwoord is onjuist." });
      }

      const user = userList[0];
      if (!user.passwordHash) {
        return res.status(400).json({ error: "Dit account maakt gebruik van Google Sign-In. Log in via Google of registreer een nieuw e-mail-account." });
      }

      // Compare secure passwords
      const isMatch = comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "E-mailadres of wachtwoord is onjuist." });
      }

      // Sign custom JWT token
      const token = generateToken({ id: user.id, uid: user.uid, email: user.email });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          uid: user.uid,
          email: user.email,
          fullName: user.fullName || '',
          phone: user.phone || '',
          address: user.address || '',
          postalCode: user.postalCode || '',
          city: user.city || '',
          country: user.country || 'Nederland',
        }
      });
    } catch (error) {
      console.error("Inlogfout:", error);
      res.status(500).json({ error: "Inloggen is mislukt door een serverfout." });
    }
  });

  // 3.03. Get current customer profile info
  app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userList = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
      if (userList.length === 0) {
        return res.status(404).json({ error: "Gebruiker niet gevonden." });
      }

      const user = userList[0];
      res.json({
        id: user.id,
        uid: user.uid,
        email: user.email,
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        postalCode: user.postalCode || '',
        city: user.city || '',
        country: user.country || 'Nederland',
      });
    } catch (error) {
      console.error("Fout bij ophalen profiel:", error);
      res.status(500).json({ error: "Ophalen van profielgegevens is mislukt." });
    }
  });

  // 3.04. Update current customer profile info
  app.post('/api/auth/profile', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { fullName, phone, address, postalCode, city, country } = req.body;

      const updated = await db.update(users)
        .set({
          fullName: fullName || '',
          phone: phone || '',
          address: address || '',
          postalCode: postalCode || '',
          city: city || '',
          country: country || 'Nederland',
        })
        .where(eq(users.id, req.user!.id))
        .returning();

      res.json({
        success: true,
        user: {
          id: updated[0].id,
          uid: updated[0].uid,
          email: updated[0].email,
          fullName: updated[0].fullName || '',
          phone: updated[0].phone || '',
          address: updated[0].address || '',
          postalCode: updated[0].postalCode || '',
          city: updated[0].city || '',
          country: updated[0].country || 'Nederland',
        }
      });
    } catch (error) {
      console.error("Fout bij bijwerken profiel:", error);
      res.status(500).json({ error: "Bijwerken van profielgegevens is mislukt." });
    }
  });

  // 3.05. Retrieve all orders for the authenticated customer
  app.get('/api/orders', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userOrders = await db.select()
        .from(orders)
        .where(eq(orders.userId, req.user!.id))
        .orderBy(desc(orders.createdAt));

      res.json(userOrders);
    } catch (error) {
      console.error("Failed to load user orders list:", error);
      res.status(500).json({ error: "Failed to load orders from PostgreSQL" });
    }
  });

  app.get('/api/cart', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbCart = await db.select()
        .from(carts)
        .where(eq(carts.userId, req.user!.id))
        .limit(1);
      
      if (dbCart.length === 0) {
        return res.json({ items: [] });
      }
      res.json({ items: dbCart[0].items });
    } catch (error) {
      console.error("Failed to load cart from database:", error);
      res.status(500).json({ error: "Failed to load cart from PostgreSQL" });
    }
  });

  app.post('/api/cart', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Invalid cart items format" });
      }
      
      const result = await db.insert(carts)
        .values({
          userId: req.user!.id,
          items: items,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: carts.userId,
          set: {
            items: items,
            updatedAt: new Date(),
          },
        })
        .returning();

      res.json({ success: true, items: result[0].items });
    } catch (error) {
      console.error("Failed to save cart to database:", error);
      res.status(500).json({ error: "Failed to save cart to PostgreSQL" });
    }
  });

  app.post('/api/orders', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { order } = req.body;
      if (!order) {
        return res.status(400).json({ error: "Order content required" });
      }
      
      await db.transaction(async (tx) => {
        // Insert order record
        await tx.insert(orders).values({
          userId: req.user!.id,
          items: order.items,
          total: String(order.priceBreakdown?.gross || 0),
          status: 'completed',
          paymentMethod: order.paymentMethod || 'iDEAL',
          billingDetails: {
            name: order.billingDetails?.fullName || '',
            email: order.billingDetails?.email || '',
            phone: order.billingDetails?.phone || '',
            address: `${order.billingDetails?.address || ''}, ${order.billingDetails?.zipCode || ''} ${order.billingDetails?.city || ''}`,
          },
        });
        
        // Complete/clear cart on checkout
        await tx.insert(carts)
          .values({
            userId: req.user!.id,
            items: [],
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: carts.userId,
            set: {
              items: [],
              updatedAt: new Date(),
            }
          });
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to place order in database:", error);
      res.status(500).json({ error: "Failed to submit order to PostgreSQL" });
    }
  });

  // 3.5. Retrive latest placed invoice order for the authenticated customer
  app.get('/api/orders/latest', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userOrders = await db.select()
        .from(orders)
        .where(eq(orders.userId, req.user!.id))
        .orderBy(desc(orders.createdAt))
        .limit(1);

      if (userOrders.length === 0) {
        return res.status(404).json({ error: "No orders found for this user." });
      }

      res.json(userOrders[0]);
    } catch (error) {
      console.error("Failed to load latest order from database:", error);
      res.status(500).json({ error: "Failed to load order from PostgreSQL." });
    }
  });

  // 4. Secure Checkout Integration with Stripe and Mollie
  app.post('/api/checkout', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { paymentMethod, mollieMethod, items, billingDetails } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Cart items are required for checkout" });
      }
      if (!billingDetails) {
        return res.status(400).json({ error: "Billing details are required for checkout" });
      }

      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const totalNet = items.reduce((sum: number, item: any) => sum + item.price, 0);
      const totalVat = Math.round((totalNet * 0.21) * 100) / 100;
      const totalGross = Math.round((totalNet + totalVat) * 100) / 100;

      if (paymentMethod === 'stripe') {
        const stripeInstance = getStripe();
        if (stripeInstance) {
          // Real Stripe session creation!
          const lineItems = items.map((item: any) => {
            const unitCents = Math.round(item.price * 1.21 * 100);
            return {
              price_data: {
                currency: 'eur',
                product_data: {
                  name: `${item.productName || 'Print Product'}`,
                  description: `${item.configurationLabels?.size || ''} - ${item.configurationLabels?.paperType || ''} - ${item.configurationLabels?.quantity || ''}`,
                },
                unit_amount: unitCents,
              },
              quantity: 1,
            };
          });

          const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${appUrl}/?payment_success=true&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/?payment_cancel=true&provider=stripe`,
            customer_email: billingDetails.email,
            metadata: {
              userId: req.user!.uid,
              dbUserId: String(req.user!.id),
              items: JSON.stringify(items.map((i: any) => ({
                productName: i.productName,
                price: i.price,
                configurationLabels: i.configurationLabels
              }))),
              billingDetails: JSON.stringify(billingDetails)
            }
          });

          return res.json({ success: true, url: session.url, mode: 'live' });
        } else {
          // Fallback simulation mode - persist order beforehand!
          console.log("Stripe secret key missing. Simulating checkout transition by inserting order...");
          const orderId = `ST-MOCK-${Math.floor(100000 + Math.random() * 900000)}`;
          
          await db.transaction(async (tx) => {
            await tx.insert(orders).values({
              userId: req.user!.id,
              items: items,
              total: String(totalGross),
              status: 'completed',
              paymentMethod: 'Stripe Creditcard (Simulation)',
              billingDetails: {
                name: billingDetails.fullName || '',
                email: billingDetails.email || '',
                phone: billingDetails.phone || '',
                address: `${billingDetails.address || ''}, ${billingDetails.zipCode || ''} ${billingDetails.city || ''}`,
              },
            });

            // Clean active basket
            await tx.insert(carts)
              .values({
                userId: req.user!.id,
                items: [],
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: carts.userId,
                set: {
                  items: [],
                  updatedAt: new Date(),
                }
              });
          });

          return res.json({
            success: true,
            url: `${appUrl}/?payment_success=true&provider=stripe&order_id=${orderId}&mock=true`,
            mode: 'simulation'
          });
        }
      } else {
        // Mollie payment processing
        const mollieInstance = getMollie();
        const formattedTotal = totalGross.toFixed(2);

        if (mollieInstance) {
          // Real Mollie payment creation!
          const payment = await mollieInstance.payments.create({
            amount: {
              currency: 'EUR',
              value: formattedTotal,
            },
            description: `Stuntdruk Volgnummer ${Date.now()}`,
            redirectUrl: `${appUrl}/?payment_success=true&provider=mollie`,
            webhookUrl: `${appUrl}/api/webhooks/mollie`,
            metadata: {
              userId: req.user!.uid,
              dbUserId: req.user!.id,
              items: items,
              billingDetails: billingDetails
            },
            method: mollieMethod || undefined
          });

          return res.json({ success: true, url: payment.getCheckoutUrl(), mode: 'live' });
        } else {
          // Fallback simulation mode - persist order beforehand!
          console.log("Mollie API key missing. Simulating checkout transition by inserting order...");
          const orderId = `ML-MOCK-${Math.floor(100000 + Math.random() * 900000)}`;
          
          await db.transaction(async (tx) => {
            await tx.insert(orders).values({
              userId: req.user!.id,
              items: items,
              total: String(totalGross),
              status: 'completed',
              paymentMethod: `Mollie ${mollieMethod || 'iDEAL'} (Simulation)`,
              billingDetails: {
                name: billingDetails.fullName || '',
                email: billingDetails.email || '',
                phone: billingDetails.phone || '',
                address: `${billingDetails.address || ''}, ${billingDetails.zipCode || ''} ${billingDetails.city || ''}`,
              },
            });

            // Clean active basket
            await tx.insert(carts)
              .values({
                userId: req.user!.id,
                items: [],
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: carts.userId,
                set: {
                  items: [],
                  updatedAt: new Date(),
                }
              });
          });

          return res.json({
            success: true,
            url: `${appUrl}/?payment_success=true&provider=mollie&order_id=${orderId}&mock=true`,
            mode: 'simulation'
          });
        }
      }
    } catch (error) {
      console.error("Checkout route error:", error);
      res.status(500).json({ error: "Betaling kon niet worden geïnitieerd." });
    }
  });

  // 5. Stripe Webhook handler
  app.post('/api/webhooks/stripe', async (req: Request, res: Response) => {
    const stripeInstance = getStripe();
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeInstance) {
      return res.status(500).json({ error: "Stripe helper omitted/not initialized" });
    }

    let event;
    const rawBody = (req as any).rawBody;

    try {
      if (webhookSecret && signature && rawBody) {
        event = stripeInstance.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      console.error(`Stripe Webhook signature failed:`, err.message);
      return res.status(400).send(`Stripe Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const metadata = session.metadata;

      if (metadata && metadata.dbUserId) {
        const dbUserId = parseInt(metadata.dbUserId);
        const orderItems = JSON.parse(metadata.items || '[]');
        const billing = JSON.parse(metadata.billingDetails || '{}');

        try {
          await db.transaction(async (tx) => {
            await tx.insert(orders).values({
              userId: dbUserId,
              items: orderItems,
              total: String(session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00'),
              status: 'completed',
              paymentMethod: 'Stripe Creditcard',
              billingDetails: {
                name: `${billing.firstName || ''} ${billing.lastName || ''}`.trim(),
                email: billing.email || session.customer_details?.email || '',
                phone: billing.phone || '',
                address: `${billing.street || ''} ${billing.houseNumber || ''}, ${billing.postalCode || ''} ${billing.city || ''}`,
              },
            });

            // Clean active basket
            await tx.insert(carts)
              .values({
                userId: dbUserId,
                items: [],
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: carts.userId,
                set: {
                  items: [],
                  updatedAt: new Date(),
                }
              });
          });
          console.log(`Verified and persisted Stripe paid order in database for user ${dbUserId}`);
        } catch (dbErr) {
          console.error("Database writing error during Stripe webhook transaction:", dbErr);
        }
      }
    }

    res.json({ received: true });
  });

  // 6. Mollie Webhook handler
  app.post('/api/webhooks/mollie', async (req: Request, res: Response) => {
    const mollieInstance = getMollie();
    const { id } = req.body;

    if (!id) {
      return res.status(400).send("Missing Mollie transaction reference ID.");
    }

    if (!mollieInstance) {
      console.log(`Mollie hook triggered for payment ${id} (Sandbox/simulation)`);
      return res.json({ received: true });
    }

    try {
      const payment: any = await mollieInstance.payments.get(id);
      if (payment.isPaid()) {
        const metadata = payment.metadata;
        
        if (metadata && metadata.dbUserId) {
          const dbUserId = parseInt(metadata.dbUserId);
          const orderItems = metadata.items || [];
          const billing = metadata.billingDetails || {};

          await db.transaction(async (tx) => {
            await tx.insert(orders).values({
              userId: dbUserId,
              items: orderItems,
              total: String(payment.amount.value),
              status: 'completed',
              paymentMethod: `Mollie ${payment.method || 'iDEAL'}`,
              billingDetails: {
                name: `${billing.firstName || ''} ${billing.lastName || ''}`.trim(),
                email: billing.email || '',
                phone: billing.phone || '',
                address: `${billing.street || ''} ${billing.houseNumber || ''}, ${billing.postalCode || ''} ${billing.city || ''}`,
              },
            });

            // Clean active basket
            await tx.insert(carts)
              .values({
                userId: dbUserId,
                items: [],
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: carts.userId,
                set: {
                  items: [],
                  updatedAt: new Date(),
                }
              });
          });
          console.log(`Verified and persisted Mollie paid order in database for user ${dbUserId}`);
        }
      }
    } catch (error) {
      console.error("Mollie webhook parsing failed:", error);
      return res.status(500).send("Mollie Webhook Error");
    }

    res.json({ received: true });
  });

  // Integrates Vite middleware in Development mode, otherwise serves compiled files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Stuntdruk Node Express] Server running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
