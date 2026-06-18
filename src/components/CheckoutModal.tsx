import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, ChevronLeft, ChevronRight, FileCheck, Coins, Check, AlertCircle } from 'lucide-react';
import { CartItem, ShippingAddress, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderCompleted: (order: Order) => void;
  currentUser: any;
}

export function CheckoutModal(props: CheckoutModalProps) {
  if (!props.isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [shipping, setShipping] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    companyName: '',
    email: props.currentUser?.email || '',
    phone: '',
    street: '',
    houseNumber: '',
    houseAddition: '',
    postalCode: '',
    city: '',
    country: 'Nederland'
  });

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mollie'>('stripe');
  const [mollieMethod, setMollieMethod] = useState<'ideal' | 'bancontact'>('ideal');
  const [selectedBank, setSelectedBank] = useState<string>('rabobank');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Totals calculations
  const totalNet = props.cartItems.reduce((sum, item) => sum + item.price, 0);
  const totalVat = Math.round((totalNet * 0.21) * 100) / 100;
  const totalGross = Math.round((totalNet + totalVat) * 100) / 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const validateAddressStep = () => {
    const errors: string[] = [];
    if (!shipping.firstName.trim()) errors.push("Voornaam is verplicht.");
    if (!shipping.lastName.trim()) errors.push("Achternaam is verplicht.");
    if (!shipping.email.trim() || !shipping.email.includes('@')) errors.push("Vul een geldig e-mailadres in.");
    if (!shipping.phone.trim()) errors.push("Telefoonnummer is verplicht.");
    if (!shipping.street.trim()) errors.push("Straatnaam is verplicht.");
    if (!shipping.houseNumber.trim()) errors.push("Huisnummer is verplicht.");
    
    // Validate Dutch Postcode structure (e.g., 1234AB or Belgian 4 digits)
    const pc = shipping.postalCode.replace(/\s+/g, '').toUpperCase();
    if (shipping.country === 'Nederland') {
      const pcRegex = /^[1-9][0-9]{3}[A-Z]{2}$/;
      if (!pcRegex.test(pc)) {
        errors.push("Vul een geldige Nederlandse postcode in (bijv. 1234AB).");
      }
    } else if (shipping.country === 'België') {
      const pcRegex = /^[1-9][0-9]{3}$/;
      if (!pcRegex.test(pc)) {
        errors.push("Vul een geldige Belgische postcode in (4 cijfers).");
      }
    } else {
      if (!shipping.postalCode.trim()) errors.push("Postcode is verplicht.");
    }
    
    if (!shipping.city.trim()) errors.push("Plaatsnaam is verplicht.");

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateAddressStep()) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    setFormErrors([]);
    try {
      const token = await props.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Je moet ingelogd zijn om een betaling te starten.");
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod,
          mollieMethod: paymentMethod === 'mollie' ? mollieMethod : undefined,
          items: props.cartItems,
          billingDetails: {
            fullName: `${shipping.firstName} ${shipping.lastName}`.trim(),
            email: shipping.email,
            phone: shipping.phone,
            street: `${shipping.street} ${shipping.houseNumber} ${shipping.houseAddition || ''}`.trim(),
            zipCode: shipping.postalCode,
            city: shipping.city,
            country: shipping.country
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Betaalcheckout kon niet worden geactiveerd.");
      }

      const checkoutData = await res.json();
      if (checkoutData.success && checkoutData.url) {
        // Safe, seamless top-level URL redirect to Stripe or Mollie
        console.log(`Redirecting securely to payment gateway:`, checkoutData.url);
        window.location.href = checkoutData.url;
      } else {
        throw new Error("Ongeldige payment response ontvangen van de server.");
      }

    } catch (err: any) {
      console.error("Payment action error:", err);
      setFormErrors([err.message || "Er is een fout opgetreden bij het verwerken van de betaling."]);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 md:p-10">
      
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Checkout Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Veilig Afrekenen</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Voltooi je bestelling via een versleutelde verbinding</p>
          </div>
          <button
            onClick={props.onClose}
            className="rounded-full p-1.5 text-slate-450 hover:bg-slate-100 hover:text-slate-650 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step progress timeline bar */}
        <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-center space-x-6 md:space-x-12">
          {[
            { st: 1, label: 'Gegevens' },
            { st: 2, label: 'Betaling' },
            { st: 3, label: 'Overzicht' }
          ].map((item) => (
            <div key={item.st} className="flex items-center space-x-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= item.st 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step > item.st ? <Check className="h-3.5 w-3.5" /> : item.st}
              </span>
              <span className={`text-xs font-bold ${step >= item.st ? 'text-slate-800' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {formErrors.length > 0 && (
            <div className="mb-5 rounded-lg border border-rose-100 bg-rose-50 p-4 animate-fade-in space-y-1">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                <span>Herstel de volgende fouten:</span>
              </div>
              <ul className="list-disc pl-5 text-[11px] font-medium text-rose-700 space-y-0.5">
                {formErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* STEP 1: Address Details Form */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase mb-2">Leveringsadres &amp; Klantgegevens</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Voornaam *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={shipping.firstName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                    placeholder="bijv. Jan"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Achternaam *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={shipping.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                    placeholder="bijv. de Vries"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Bedrijfsnaam (Optioneel)</label>
                <input
                  type="text"
                  name="companyName"
                  value={shipping.companyName}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                  placeholder="bijv. Stuntdruk BV"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    value={shipping.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                    placeholder="email@adres.nl"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Telefoonnummer *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shipping.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                    placeholder="bv. 0612345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Straatnaam *</label>
                  <input
                    type="text"
                    name="street"
                    value={shipping.street}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                    placeholder="bv. Hoofdstraat"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Huisnummer *</label>
                  <input
                    type="text"
                    name="houseNumber"
                    value={shipping.houseNumber}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                    placeholder="bv. 12A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Postcode *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shipping.postalCode}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                    placeholder="bv. 1234AB"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Plaats *</label>
                  <input
                    type="text"
                    name="city"
                    value={shipping.city}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                    placeholder="bv. Amsterdam"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 mb-1">Land *</label>
                  <select
                    name="country"
                    value={shipping.country}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                  >
                    <option value="Nederland">Nederland</option>
                    <option value="België">België</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Selector Form */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase mb-2">Betaalmethode Selecteren</h4>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* STRIPE CHOICE */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'stripe' 
                      ? 'border-indigo-600 bg-indigo-50/10' 
                      : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="radio"
                      name="payment_method_group"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-indigo-600 shrink-0" />
                      Stripe Checkout (Visa/MC)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal pl-7">
                    Betaal veilig met Visa, Mastercard, Maestro, American Express of Apple Pay via Stripe.
                  </p>
                </button>

                {/* MOLLIE CHOICE */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mollie')}
                  className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'mollie' 
                      ? 'border-indigo-600 bg-indigo-50/10' 
                      : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="radio"
                      name="payment_method_group"
                      checked={paymentMethod === 'mollie'}
                      onChange={() => setPaymentMethod('mollie')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-indigo-600 shrink-0" />
                      Mollie Checkout (iDEAL)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal pl-7">
                    Betaal direct via je eigen bank met iDEAL (Nederland) of Bancontact (België).
                  </p>
                </button>
              </div>

              {/* Sub-form fields for Stripe */}
              {paymentMethod === 'stripe' && (
                <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100 animate-fade-in text-xs space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Beveiligde Stripe Checkout</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Je wordt na bevestiging automatisch doorgestuurd naar de officiële, beveiligde checkoutsessie van Stripe om je creditcard- of walletgegevens in te voeren.
                  </p>
                </div>
              )}

              {/* Sub-fields for Mollie */}
              {paymentMethod === 'mollie' && (
                <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100 animate-fade-in space-y-4 text-xs">
                  <div className="flex items-center space-x-2 text-indigo-800 font-bold">
                    <Coins className="h-4 w-4 text-indigo-600" />
                    <span>Mollie betaalmethode</span>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 font-bold text-slate-700 cursor-pointer text-[11px]">
                      <input
                        type="radio"
                        checked={mollieMethod === 'ideal'}
                        onChange={() => setMollieMethod('ideal')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>iDEAL (Nederland)</span>
                    </label>
                    <label className="flex items-center space-x-2 font-bold text-slate-700 cursor-pointer text-[11px]">
                      <input
                        type="radio"
                        checked={mollieMethod === 'bancontact'}
                        onChange={() => setMollieMethod('bancontact')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Bancontact (België)</span>
                    </label>
                  </div>

                  {mollieMethod === 'ideal' && (
                    <div className="p-3 bg-white rounded-lg border border-slate-150 animate-fade-in">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Kies je bank</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none font-bold text-slate-700"
                      >
                        <option value="rabobank">Rabobank</option>
                        <option value="ing">ING Bank</option>
                        <option value="abn">ABN AMRO</option>
                        <option value="sns">SNS Bank</option>
                        <option value="asn">ASN Bank</option>
                        <option value="regiobank">RegioBank</option>
                        <option value="bunq">Bunq</option>
                        <option value="triodos">Triodos Bank</option>
                      </select>
                    </div>
                  )}

                  {mollieMethod === 'bancontact' && (
                    <div className="p-3 bg-white rounded-lg border border-slate-150 animate-fade-in text-[11px] text-slate-600 font-medium leading-relaxed">
                      Betalingen via Bancontact worden direct verwerkt via Mollie met support voor alle grote Belgische banken en wallets.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Order Summary Check */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase mb-3">Gegevens Controle</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs">
                  <div>
                    <p className="font-bold text-slate-500">Bezorgadres:</p>
                    <p className="text-slate-800 font-extrabold mt-1">
                      {shipping.firstName} {shipping.lastName} <br />
                      {shipping.companyName && `${shipping.companyName}\n`}
                      {shipping.street} {shipping.houseNumber} {shipping.houseAddition} <br />
                      {shipping.postalCode} {shipping.city}, {shipping.country}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-500">Betaling via:</p>
                    <p className="text-slate-800 font-extrabold uppercase mt-1">
                      {paymentMethod === 'stripe' ? 'Stripe Creditcard' : `Mollie Checkout (${mollieMethod.toUpperCase()}${mollieMethod === 'ideal' ? ` - ${selectedBank}` : ''})`}
                    </p>
                    <p className="font-bold text-slate-500 mt-2">Klantcontact:</p>
                    <p className="text-slate-800 font-bold overflow-hidden truncate">
                      {shipping.email} • {shipping.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase mb-3">Bestelde Producten</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {props.cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs p-3 rounded-lg border border-slate-150 bg-white">
                      <div>
                        <p className="font-bold text-slate-800">{item.productName} • {item.configurationLabels.quantity}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          {item.configurationLabels.size}, {item.configurationLabels.paperType}, {item.configurationLabels.printing}
                        </p>
                      </div>
                      <p className="font-extrabold text-slate-800">€ {item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary Breakdown */}
              <div className="pt-4 border-t border-slate-100 flex flex-col items-end text-sm space-y-1">
                <div className="flex justify-between w-48 text-xs font-bold text-slate-500">
                  <span>Subtotaal:</span>
                  <span>€ {totalNet.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-xs font-bold text-slate-500">
                  <span>21% BTW:</span>
                  <span>€ {totalVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-base font-black text-slate-800 border-t border-slate-100 pt-2">
                  <span>Totaal incl. BTW:</span>
                  <span>€ {totalGross.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center space-x-1 py-2 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Vorige</span>
            </button>
          ) : (
            <div></div> // Placeholder space-holder
          )}

          {step < 3 ? (
            <button
              id="checkout-next-btn"
              onClick={handleNextStep}
              className="flex items-center space-x-1.5 py-2 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm cursor-pointer"
            >
              <span>Volgende stap</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              id="checkout-confirm-btn"
              disabled={submitting}
              onClick={handleSubmitOrder}
              className="flex items-center space-x-1.5 py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'Bestelling verwerken...' : 'Nu betalen / Bestellen'}</span>
              <FileCheck className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
