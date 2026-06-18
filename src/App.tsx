import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  WelcomePage 
} from './components/WelcomePage';
import { 
  UploadArea 
} from './components/UploadArea';
import { 
  Configurator 
} from './components/Configurator';
import { 
  PriceSummary 
} from './components/PriceSummary';
import { 
  CartDrawer 
} from './components/CartDrawer';
import { 
  CheckoutModal 
} from './components/CheckoutModal';
import { 
  ProductType, 
  SelectedConfiguration, 
  ConfiguratorStateResponse, 
  PricingResponse, 
  CartItem, 
  Order 
} from './types';
import { AuthModal } from './components/AuthModal';
import { CustomerPortalModal } from './components/CustomerPortalModal';
import { AdminPanel } from './components/AdminPanel';
import { PRODUCT_SPECIFICATIONS } from './components/productData';
import { 
  auth
} from './firebase';
import { 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  ShoppingBag, 
  CheckCircle, 
  Printer, 
  Download, 
  RefreshCw, 
  ArrowLeft,
  Truck
} from 'lucide-react';

export default function App() {
  // Account & Authentication State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Custom client-side portal controllers
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalTab, setPortalTab] = useState<'profile' | 'orders'>('profile');

  // Restore Custom E-mail/Password user session from localStorage
  useEffect(() => {
    const cached = localStorage.getItem('stuntdruk_custom_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        parsed.getIdToken = async () => parsed.token;
        setCurrentUser(parsed);
        
        // Quietly fetch current SQL state to keep details refreshed
        fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${parsed.token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            const updated = {
              ...parsed,
              ...data,
              getIdToken: async () => parsed.token
            };
            localStorage.setItem('stuntdruk_custom_user', JSON.stringify(updated));
            setCurrentUser(updated);
          }
        })
        .catch(err => console.log("Silent credential synchronization failed:", err));
      } catch (err) {
        console.error("Failed to restore cached custom details:", err);
      }
    }
  }, []);

  // Interface view & state selectors
  const [currentView, setCurrentView] = useState<'home' | 'configurator' | 'admin'>('home');
  const [activeCategory, setActiveCategory] = useState<ProductType>('business_card');
  const [isExpress, setIsExpress] = useState(false);
  
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null);

  // API Configurator Response State
  const [configuratorState, setConfiguratorState] = useState<ConfiguratorStateResponse | null>(null);
  const [pricingState, setPricingState] = useState<PricingResponse | null>(null);

  // Loading indicator gates
  const [configLoading, setConfigLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(false);

  // Cart Management States
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Wizard state gates
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Initialize Default Configuration State
  const [selectedConfig, setSelectedConfig] = useState<SelectedConfiguration>(() => {
    const specs = PRODUCT_SPECIFICATIONS['business_card'];
    return {
      size: specs?.sizes[0]?.id || 'standard',
      paperType: specs?.paperTypes[0]?.id || 'mc_mat',
      printing: specs?.printings[0]?.id || '4_4',
      finishing: specs?.finishings[0]?.id || 'none',
      quantity: specs?.quantities[0]?.id || '250',
      width: '1.0',
      height: '1.0'
    };
  });

  // Track Authentication Changes via Client Auth Handlers
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const dbData = await res.json();
            setCurrentUser({
              ...user,
              ...dbData,
              getIdToken: async (forceRefresh?: boolean) => user.getIdToken(forceRefresh)
            });
          } else {
            setCurrentUser(user);
          }
        } catch (err) {
          console.error("Fout bij laden database profiel:", err);
          setCurrentUser(user);
        }
      } else {
        const cached = localStorage.getItem('stuntdruk_custom_user');
        if (!cached) {
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Detect Stripe/Mollie checkout returns as a URL interceptor
  useEffect(() => {
    async function checkPaymentStatus() {
      const searchParams = new URLSearchParams(window.location.search);
      const isSuccess = searchParams.get('payment_success') === 'true';
      
      if (isSuccess && currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch('/api/orders/latest', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            const latestOrder = await res.json();
            
            // Format the database schema back to client-friendly Order type
            const formatted: Order = {
              id: latestOrder.id ? `Bestelling #${latestOrder.id}` : `BEST-MOCK-${Math.floor(Math.random() * 10000)}`,
              userId: currentUser.uid,
              items: latestOrder.items,
              shippingAddress: {
                firstName: latestOrder.billingDetails?.name?.split(' ')[0] || 'Klant',
                lastName: latestOrder.billingDetails?.name?.split(' ').slice(1).join(' ') || '',
                street: latestOrder.billingDetails?.address || '',
                houseNumber: '',
                postalCode: '',
                city: '',
                country: 'Nederland',
                email: latestOrder.billingDetails?.email || '',
                phone: latestOrder.billingDetails?.phone || ''
              },
              billingAddressSame: true,
              pricing: {
                net: Math.round((Number(latestOrder.total) / 1.21) * 100) / 100,
                vat: Math.round((Number(latestOrder.total) - (Number(latestOrder.total) / 1.21)) * 100) / 100,
                gross: Number(latestOrder.total)
              },
              paymentMethod: latestOrder.paymentMethod,
              status: latestOrder.status,
              createdAt: latestOrder.createdAt
            };

            // Erase cart items state and local storage copy
            setCartItems([]);
            localStorage.setItem('stuntdruk_local_cart', JSON.stringify([]));

            setCompletedOrder(formatted);
            
            // Clean browser address field gracefully
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          console.error("Failed to query returning order session:", err);
        }
      }
    }

    if (!authLoading) {
      checkPaymentStatus();
    }
  }, [currentUser, authLoading]);

  // Update starting defaults when category shifts
  useEffect(() => {
    const specs = PRODUCT_SPECIFICATIONS[activeCategory];
    setSelectedConfig({
      size: specs?.sizes[0]?.id || 'standard',
      paperType: specs?.paperTypes[0]?.id || 'mc_mat',
      printing: specs?.printings[0]?.id || '4_4',
      finishing: specs?.finishings[0]?.id || 'none',
      quantity: specs?.quantities[0]?.id || '250',
      width: '1.0',
      height: '1.0'
    });
    setUploadedFile(null);
  }, [activeCategory]);

  // Load and sync existing shopping carts from PostgreSQL if logged in
  useEffect(() => {
    async function loadCartData() {
      if (currentUser) {
        setPriceLoading(true);
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch('/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.items) {
              setCartItems(data.items);
              setPriceLoading(false);
              return;
            }
          }
        } catch (err) {
          console.log("No existing active cart found in cloud PostgreSQL. Starting fresh.");
        }
      }
      
      // Fallback local storage
      const localCart = localStorage.getItem('stuntdruk_local_cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
      setPriceLoading(false);
    }
    
    if (!authLoading) {
      loadCartData();
    }
  }, [currentUser, authLoading]);

  // Persist local state changes securely
  const saveCartToStore = async (newItems: CartItem[]) => {
    setCartItems(newItems);
    localStorage.setItem('stuntdruk_local_cart', JSON.stringify(newItems));

    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ items: newItems })
        });
      } catch (error) {
        console.error("Error saving cart to cloud PostgreSQL:", error);
      }
    }
  };

  // Synchronously fetch combinations and corrections from Express Dynamic API
  useEffect(() => {
    let active = true;
    async function fetchConfiguratorDetails() {
      try {
        setConfigLoading(true);
        const queryParams = new URLSearchParams({
          productType: activeCategory,
          size: selectedConfig.size,
          paperType: selectedConfig.paperType,
          printing: selectedConfig.printing,
          finishing: selectedConfig.finishing,
          quantity: selectedConfig.quantity,
          width: selectedConfig.width || '1.0',
          height: selectedConfig.height || '1.0'
        });

        const res = await fetch(`/api/configurator?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Configurator connection failed");
        
        const data: ConfiguratorStateResponse = await res.json();
        
        if (active && data) {
          setConfiguratorState(data);
          // If corrector auto-adjusted a selected parameter, apply to local select values:
          setSelectedConfig(data.selected);
          setConfigLoading(false);
        }
      } catch (err) {
        console.error("Config fetch error:", err);
        setConfigLoading(false);
      }
    }

    fetchConfiguratorDetails();
    return () => { active = false; };
  }, [activeCategory, selectedConfig.size, selectedConfig.paperType, selectedConfig.printing, selectedConfig.finishing, selectedConfig.quantity, selectedConfig.width, selectedConfig.height]);

  // Async query Pricing API to compute costs on options update
  useEffect(() => {
    let active = true;
    async function fetchPricingDetails() {
      if (configLoading) return;
      try {
        setPriceLoading(true);
        const res = await fetch('/api/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productType: activeCategory,
            configuration: selectedConfig,
            isExpress
          })
        });

        if (!res.ok) throw new Error("Pricing calculation engine failed");
        
        const data: PricingResponse = await res.json();
        if (active && data) {
          setPricingState(data);
          setPriceLoading(false);
        }
      } catch (err) {
        console.error("Pricing fetch error:", err);
        setPriceLoading(false);
      }
    }

    fetchPricingDetails();
    return () => { active = false; };
  }, [configLoading, activeCategory, selectedConfig, isExpress]);

  const handleOptionChange = (key: keyof SelectedConfiguration, valueId: string) => {
    setSelectedConfig(prev => ({
      ...prev,
      [key]: valueId
    }));
  };

  const handleFileUploadSuccess = (url: string, name: string) => {
    setUploadedFile({ url, name });
  };

  const handleFileRemoval = () => {
    setUploadedFile(null);
  };

  // Add Item to active Orderlines Cart
  const handleAddToCart = () => {
    if (!uploadedFile || !pricingState) return;

    // Helper to extract option labels for cart visual breakdown
    const getOptionLabel = (key: keyof SelectedConfiguration, id: string) => {
      const options = configuratorState?.attributes[key];
      const match = options?.find((o: any) => o.id === id);
      return match ? match.name : id;
    };

    const newItem: CartItem = {
      id: `line_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      productType: activeCategory,
      productName: PRODUCT_SPECIFICATIONS[activeCategory]?.name || 'Drukwerk op maat',
      configuration: selectedConfig,
      configurationLabels: {
        size: selectedConfig.size === 'custom' 
          ? `Op maat (${selectedConfig.width}m x ${selectedConfig.height}m)` 
          : getOptionLabel('size', selectedConfig.size),
        paperType: getOptionLabel('paperType', selectedConfig.paperType),
        printing: getOptionLabel('printing', selectedConfig.printing),
        finishing: getOptionLabel('finishing', selectedConfig.finishing),
        quantity: getOptionLabel('quantity', selectedConfig.quantity),
      },
      price: pricingState.prices.net,
      deliveryDate: pricingState.delivery.estimatedDate,
      isExpress: isExpress,
      fileUrl: uploadedFile.url,
      fileName: uploadedFile.name,
      addedAt: new Date().toISOString()
    };

    const updated = [...cartItems, newItem];
    saveCartToStore(updated);
    setCartOpen(true); // Automatically open sliding tray
  };

  const handleRemoveCartItem = (itemId: string) => {
    const updated = cartItems.filter(i => i.id !== itemId);
    saveCartToStore(updated);
  };

  // Submits and persists completed checkout details on PostgreSQL
  const handleOrderSubmitted = async (order: Order) => {
    try {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ order })
        });
        if (!res.ok) throw new Error("Order submission to PostgreSQL failure");
      }

      // Erase active shopping cart items completely
      setCartItems([]);
      localStorage.setItem('stuntdruk_local_cart', JSON.stringify([]));
      setCheckoutOpen(false);
      
      // Mount success confirmation screen
      setCompletedOrder(order);
    } catch (err) {
      console.error("Failed to submit order to PostgreSQL backend:", err);
    }
  };

  const handleReturnToShopping = () => {
    setCompletedOrder(null);
    setUploadedFile(null);
  };

  const hasLoadedDesign = !!uploadedFile;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-200">
      
      {/* Universal header containing navbar and account indicator */}
      <Header 
        onCartClick={() => setCartOpen(true)} 
        cartCount={cartItems.length}
        currentUser={currentUser}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLoginClick={() => setAuthModalOpen(true)}
        onProfileClick={() => { setPortalTab('profile'); setPortalOpen(true); }}
        onOrdersClick={() => { setPortalTab('orders'); setPortalOpen(true); }}
        onLogoutClick={() => { 
          setCurrentUser(null); 
          localStorage.removeItem('stuntdruk_custom_user');
          setCartItems([]);
          localStorage.setItem('stuntdruk_local_cart', JSON.stringify([]));
        }}
      />

      {completedOrder ? (
        /* STEP 3: Beautiful, High-Trust Invoice Confirmation Success Card */
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-150 bg-white p-8 md:p-12 shadow-xl text-center flex flex-col items-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6 border border-emerald-200">
              <CheckCircle className="h-10 w-10 shrink-0" />
            </div>

            <h2 className="text-xl font-black text-slate-800">Bedankt voor je bestelling!</h2>
            <p className="text-slate-500 text-xs mt-2 max-w-md font-medium leading-relaxed">
              Jouw drukwerkopdracht is succesvol ontvangen door de drukkerij. We voeren momenteel de definitieve preflight bestandscontrole uit.
            </p>

            {/* Reference credentials */}
            <div className="mt-8 rounded-2xl bg-slate-50 p-6 border border-slate-155 text-left w-full space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 text-xs">
                <span className="text-slate-400 font-bold">Bestelnummer:</span>
                <span className="font-extrabold text-slate-755">{completedOrder.id}</span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verzendadres:</p>
                <p className="text-xs font-semibold text-slate-700 leading-normal">
                  {completedOrder.shippingAddress.firstName} {completedOrder.shippingAddress.lastName} <br />
                  {completedOrder.shippingAddress.street} {completedOrder.shippingAddress.houseNumber} <br />
                  {completedOrder.shippingAddress.postalCode} {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.country}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-start space-x-2.5 text-xs text-slate-600 font-bold">
                <Truck className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span>Verwachte leverdatum:</span>
                  <p className="text-emerald-700 font-black text-sm mt-0.5">
                    {completedOrder.items[0]?.deliveryDate || 'Binnen enkele werkdagen'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full">
              <button
                onClick={handleReturnToShopping}
                className="flex-1 flex items-center justify-center space-x-2 py-3.5 px-4 font-bold text-xs border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Nieuwe configuratie starten</span>
              </button>
              <button
                id="invoice-download-btn"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center space-x-2 py-3.5 px-4 font-black text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Factuur downloaden (PDF)</span>
              </button>
            </div>
          </div>
        </main>
      ) : currentView === 'home' ? (
        /* STEP 1: Landing welcome information & category catalog page */
        <WelcomePage 
          onSelectProduct={(productType) => {
            setActiveCategory(productType);
            setCurrentView('configurator');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onStartConfiguring={() => {
            setCurrentView('configurator');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentView === 'admin' ? (
        <AdminPanel 
          currentUser={currentUser} 
          onBackToShopping={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        /* STEP 2: Storefront Configurator view block */
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50">
          
          {/* Responsive Hero Heading section */}
          <div className="mb-4 max-w-3xl animate-fade-in text-xs">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Printer className="h-6 w-6 text-indigo-600 shrink-0" />
              <span>
                {PRODUCT_SPECIFICATIONS[activeCategory]?.name || 'Drukwerk'} Configurator
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-2xl leading-normal">
              Pas je specificaties eenvoudig aan. Ons geautomatiseerde pers-instelsysteem berekent realtime de voordeligste productiekosten en combinatietarieven.
            </p>
          </div>

          {/* Quick-links category chips */}
          <div className="mb-6 flex flex-wrap gap-1.5 border-b border-slate-100 pb-4 animate-fade-in">
            {(Object.keys(PRODUCT_SPECIFICATIONS) as ProductType[]).map((pType) => {
              const spec = PRODUCT_SPECIFICATIONS[pType];
              const isSelected = pType === activeCategory;
              return (
                <button
                  key={pType}
                  onClick={() => setActiveCategory(pType)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {spec.name}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* Options Adjustments Column (Sizes, Stocks, Lamination) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Step 1: Upload box */}
              <UploadArea 
                onFileUploaded={handleFileUploadSuccess} 
                onFileCleared={handleFileRemoval}
                uploadedFileName={uploadedFile?.name}
              />

              {/* Dynamic steps render */}
              <Configurator 
                attributes={configuratorState?.attributes || { size: [], paperType: [], printing: [], finishing: [], quantity: [] }}
                selected={selectedConfig}
                notices={configuratorState?.notices || []}
                onOptionSelect={handleOptionChange}
              />
            </div>

            {/* Price Calculations and Summary widget */}
            <div className="lg:col-span-1">
              <PriceSummary 
                pricing={pricingState}
                isExpress={isExpress}
                onExpressToggle={(val) => setIsExpress(val)}
                onAddToCart={handleAddToCart}
                canAddToCart={hasLoadedDesign}
                isLoading={priceLoading}
              />
            </div>

          </div>
        </main>
      )}

      {/* Sliding Shopping cart tray overlay */}
      <CartDrawer 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Multi-step Checkout Address / Payment selection popup wizard */}
      <CheckoutModal 
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onOrderCompleted={handleOrderSubmitted}
      />

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(usr) => setCurrentUser(usr)}
      />

      <CustomerPortalModal 
        isOpen={portalOpen}
        onClose={() => setPortalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(usr) => setCurrentUser(usr)}
      />

    </div>
  );
}
