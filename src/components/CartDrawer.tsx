import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ClipboardCheck, Truck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export function CartDrawer(props: CartDrawerProps) {
  if (!props.isOpen) return null;

  const totalNet = props.items.reduce((sum, item) => sum + item.price, 0);
  const totalVat = Math.round((totalNet * 0.21) * 100) / 100;
  const totalGross = Math.round((totalNet + totalVat) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={props.onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl relative flex flex-col h-full border-l border-slate-100 animate-slide-in">
          
          {/* Cart Header */}
          <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
              <span>Jouw Bestelmand ({props.items.length})</span>
            </h2>
            <button
              onClick={props.onClose}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Sluit winkelwagen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart item loop */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {props.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4 border border-slate-100">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-700">Je winkelwagen is leeg</h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Voeg drukwerk configuraties toe om een prijs te calculeren.</p>
                <button
                  onClick={props.onClose}
                  className="mt-5 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                >
                  Verder winkelen
                </button>
              </div>
            ) : (
              props.items.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-150 p-4 transition-all hover:bg-slate-55 bg-slate-50/40 relative">
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider mb-2 ${
                        item.productType === 'business_card' 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {item.productName}
                      </span>
                      <h4 className="text-xs font-black text-slate-800">
                        Oplage: {item.configurationLabels.quantity}
                      </h4>
                    </div>
                    
                    <button
                      id={`remove-cart-item-${item.id}`}
                      onClick={() => props.onRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-500 rounded p-1 transition-colors hover:bg-white cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Cart Item Config Meta labels */}
                  <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[10.5px] font-medium text-slate-500 border-t border-slate-100 pt-2.5">
                    <div>Formaat: <span className="font-semibold text-slate-700">{item.configurationLabels.size}</span></div>
                    <div>Papier: <span className="font-semibold text-slate-700">{item.configurationLabels.paperType}</span></div>
                    <div>Bedrukking: <span className="font-semibold text-slate-700">{item.configurationLabels.printing}</span></div>
                    <div>Afwerking: <span className="font-semibold text-slate-700">{item.configurationLabels.finishing}</span></div>
                  </div>

                  {/* Display uploaded print thumbnail or filename */}
                  {item.fileName && (
                    <div className="mt-3 flex items-center space-x-1.5 bg-white px-2 py-1.5 rounded border border-slate-150 text-[9.5px] font-semibold text-emerald-600">
                      <ClipboardCheck className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate max-w-[190px]">{item.fileName}</span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[9.5px] font-bold text-slate-400 flex items-center">
                        <Truck className="h-3 w-3 mr-1" />
                        Gegarandeerd op:
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-600">{item.deliveryDate}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-800">€ {item.price.toFixed(2)}</p>
                      <span className="text-[9px] text-slate-400">Excl. BTW</span>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Cart Pricing summary footer, sticking down */}
          {props.items.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-5 bg-slate-50/70">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Subtotaal</span>
                  <span>€ {totalNet.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Btw (21%)</span>
                  <span>€ {totalVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-800 border-t border-slate-100 pt-2.5">
                  <span>Totaal incl. BTW</span>
                  <span>€ {totalGross.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  id="cart-checkout-btn"
                  onClick={props.onCheckout}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-100 transition-colors cursor-pointer"
                >
                  <span>Bestelling Afronden</span>
                  <ArrowRight className="h-4.5 w-4.5 animate-pulse" />
                </button>
                <button
                  onClick={props.onClose}
                  className="w-full text-center py-2.5 text-xs font-bold text-slate-500 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Verder winkelen
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
