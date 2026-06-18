import React, { useState, useEffect } from 'react';
import { X, User, ShoppingBag, Eye, Save, Sparkles, CheckCircle, Clock, Truck, FileText, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface CustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onProfileUpdated: (updatedUser: any) => void;
}

export function CustomerPortalModal(props: CustomerPortalModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Nederland');

  const [savingProfile, setSavingProfile] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize profile inputs when user session is active
  useEffect(() => {
    if (props.currentUser) {
      setFullName(props.currentUser.fullName || props.currentUser.displayName || '');
      setPhone(props.currentUser.phone || '');
      setAddress(props.currentUser.address || '');
      setPostalCode(props.currentUser.postalCode || '');
      setCity(props.currentUser.city || '');
      setCountry(props.currentUser.country || 'Nederland');
      
      // Load customer orders from server
      fetchOrders();
    }
  }, [props.currentUser, props.isOpen]);

  const fetchOrders = async () => {
    if (!props.currentUser) return;
    setLoadingOrders(true);
    try {
      const token = await props.currentUser.getIdToken();
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch order history:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!props.isOpen || !props.currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const token = await props.currentUser.getIdToken();
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, phone, address, postalCode, city, country }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Profielgegevens konden niet worden bijgewerkt.");
      }

      setSuccessMsg("Je profielgegevens zijn succesvol opgeslagen in de SQL database.");
      
      // Update local storage representation if custom auth
      if (props.currentUser.isCustom) {
        const stored = localStorage.getItem('stuntdruk_custom_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = { ...parsed, ...data.user };
          localStorage.setItem('stuntdruk_custom_user', JSON.stringify(updated));
        }
      }

      const mergedUser = {
        ...props.currentUser,
        ...data.user,
        displayName: data.user.fullName,
      };

      props.onProfileUpdated(mergedUser);
    } catch (err: any) {
      setErrorMsg(err.message || "Er is een serverfout opgetreden.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Helper to determine active tracking steps based on status
  const getTrackingSteps = (status: string) => {
    const defaultSteps = [
      { label: 'Ontvangen', desc: 'Order is geregistreerd', done: true, current: false },
      { label: 'Prepress Check', desc: 'Drukbestanden handmatig goedgekeurd', done: true, current: false },
      { label: 'In Druk', desc: 'CMYK Persen gestart', done: false, current: false },
      { label: 'Afwerking', desc: 'Snijden en verpakken', done: false, current: false },
      { label: 'Onderweg', desc: 'Overhandigd aan PostNL', done: false, current: false },
    ];

    if (status === 'completed') {
      return defaultSteps.map(s => ({ ...s, done: true }));
    } else if (status === 'processing') {
      defaultSteps[2].current = true;
      defaultSteps[2].done = true;
      return defaultSteps;
    } else if (status === 'shipped') {
      defaultSteps[2].done = true;
      defaultSteps[3].done = true;
      defaultSteps[4].done = true;
      defaultSteps[4].current = true;
      return defaultSteps;
    }
    return defaultSteps;
  };

  return (
    <div id="customer-portal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs animate-fade-in">
      <div id="customer-portal-content" className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl border border-slate-150 bg-white shadow-2xl p-6 sm:p-8 flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header Title with Custom badges */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 shrink-0" />
              <span>Mijn Stuntdruk Klantenpaneel</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Beheer uw contactgegevens, leveradressen en volg uw printorders direct in onze PostgreSQL database.
            </p>
          </div>
          <button
            onClick={props.onClose}
            className="text-slate-400 hover:text-slate-600 rounded-full p-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Sluit dashboard"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div id="portal-tabs" className="flex border-b border-slate-100 mb-6 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 pb-3 px-1 text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Mijn Gegevens (SQL Profiel)</span>
          </button>
          <button
            onClick={() => { setActiveTab('orders'); fetchOrders(); }}
            className={`flex items-center space-x-2 pb-3 px-1 text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Bestelhistorie & Status {orders.length > 0 && `(${orders.length})`}</span>
          </button>
        </div>

        {/* Live Scrollable Pane */}
        <div className="flex-1 overflow-y-auto pr-1">
          
          {/* TAB 1: Profile Management */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in space-y-5">
              {successMsg && (
                <div className="flex items-start space-x-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-emerald-800 text-xs font-semibold animate-fade-in">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="flex items-start space-x-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-rose-800 text-xs font-semibold animate-fade-in">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Volledige Naam</label>
                    <input
                      type="text"
                      required
                      placeholder="Bv. Jan de Vries"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">E-mailadres (Gekoppeld account)</label>
                    <input
                      type="email"
                      disabled
                      value={props.currentUser.email}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none text-slate-400 font-bold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Telefoonnummer</label>
                    <input
                      type="tel"
                      placeholder="Bv. 0612345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Land</label>
                    <input
                      type="text"
                      required
                      placeholder="Nederland"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Bezorgadres & Facturatie</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Straat + Huisnummer</label>
                    <input
                      type="text"
                      placeholder="Keizersgracht 420"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Postcode</label>
                    <input
                      type="text"
                      placeholder="1016 EK"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">Woonplaats / Stad</label>
                    <input
                      type="text"
                      placeholder="Amsterdam"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center space-x-2 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{savingProfile ? "Bezig met opslaan..." : "Wijzigingen Opslaan"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Orders & Tracking */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in space-y-4">
              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-500">Bestellingen laden uit PostgreSQL...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6">
                  <ShoppingBag className="h-10 w-10 text-slate-350 mb-3" />
                  <p className="text-xs font-bold text-slate-700">Geen bestellingen gevonden</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal max-w-sm">
                    U heeft nog geen geplaatste printopdrachten in ons systeem. Start een configuratie om uw eerste opdracht te plaatsen!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, idx) => {
                    const steps = getTrackingSteps(order.status);
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <div key={order.id} className="border border-slate-150 rounded-xl overflow-hidden bg-white/70 hover:border-slate-300 transition-all">
                        
                        {/* Order Header Summary Row */}
                        <div 
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="flex flex-wrap items-center justify-between p-4 bg-slate-50/75 cursor-pointer hover:bg-slate-50 transition-colors select-none gap-3"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-indigo-600" />
                            </span>
                            <div>
                              <p className="text-xs font-extrabold text-slate-800">Bestelling #{order.id}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString('nl-NL', {
                                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs font-black text-slate-800">€{parseFloat(order.total).toFixed(2)}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Inclusief BTW</p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : order.status === 'processing'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : 'bg-slate-50 text-slate-600 border border-slate-150'
                            }`}>
                              {order.status === 'completed' ? 'Gereed' : 'In behandeling'}
                            </span>

                            <button className="text-slate-400 hover:text-slate-600 p-1">
                              <Eye className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Order Expanded Details and tracking */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 border-t border-slate-150 space-y-6 animate-fade-in bg-white">
                            
                            {/* Tracking visual progress bars */}
                            <div>
                              <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                                Interactive Production Tracker (PostgreSQL Live Status)
                              </h4>

                              {/* Progress Track Line */}
                              <div className="relative mt-2 mb-6">
                                <div className="absolute top-3.5 left-5 right-5 h-[3px] bg-slate-150 -z-10"></div>
                                <div className="grid grid-cols-5 text-center relative z-10">
                                  {steps.map((st, sidx) => (
                                    <div key={sidx} className="flex flex-col items-center">
                                      <div className={`h-7 w-7 rounded-full flex items-center justify-center border-2 text-[10px] font-black transition-all ${
                                        st.current 
                                          ? 'bg-slate-900 border-slate-900 text-white ring-4 ring-slate-100 scale-110' 
                                          : st.done
                                          ? 'bg-emerald-500 border-emerald-500 text-white'
                                          : 'bg-white border-slate-200 text-slate-400'
                                      }`}>
                                        {st.done ? '✓' : sidx + 1}
                                      </div>
                                      <p className={`text-[10px] font-bold mt-2 ${st.done || st.current ? 'text-slate-800' : 'text-slate-400'}`}>{st.label}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 rounded-xl p-4 border border-slate-100 text-xs">
                              
                              {/* Order contents */}
                              <div className="space-y-2">
                                <p className="font-extrabold text-slate-400 uppercase tracking-widest text-[9px]">Gekochte Producten</p>
                                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                  {Array.isArray(order.items) && (order.items as any[]).map((item, iidx) => (
                                    <div key={iidx} className="flex justify-between items-start bg-white p-2.5 rounded-lg border border-slate-150">
                                      <div>
                                        <p className="font-extrabold text-slate-800 text-[11px]">{item.productName || 'Drukwerk'}</p>
                                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                                          {item.configurationLabels?.size || 'Standaard'} • {item.configurationLabels?.paperType || 'MC Mat'} • {item.configurationLabels?.quantity || '250'} stuks
                                        </p>
                                      </div>
                                      <span className="font-black text-slate-800 text-[11px]">€{item.price?.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Customer address / method info */}
                              <div className="space-y-3.5">
                                <div className="space-y-1">
                                  <p className="font-extrabold text-slate-400 uppercase tracking-widest text-[9px]">Afleveradres & Factuurgegevens</p>
                                  <p className="font-bold text-slate-700">{order.billingDetails?.name || 'Klant'}</p>
                                  <p className="text-slate-500 font-medium">{order.billingDetails?.address || ''}</p>
                                  {order.billingDetails?.phone && <p className="text-slate-400 font-semibold font-mono">{order.billingDetails.phone}</p>}
                                  {order.billingDetails?.email && <p className="text-slate-400 font-semibold">{order.billingDetails.email}</p>}
                                </div>

                                <div className="space-y-1 pt-1.5 border-t border-slate-200">
                                  <p className="font-extrabold text-slate-400 uppercase tracking-widest text-[9px]">Betaalinformatie</p>
                                  <p className="font-bold text-slate-705">
                                    Methode: <strong className="text-slate-800">{order.paymentMethod}</strong>
                                  </p>
                                  <p className="font-bold text-slate-705">
                                    Status: <strong className={order.status === 'completed' ? 'text-emerald-600' : 'text-indigo-600'}>
                                      {order.status === 'completed' ? 'Betaald & Afgehandeld' : 'In behandeling'}
                                    </strong>
                                  </p>
                                </div>
                              </div>

                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
