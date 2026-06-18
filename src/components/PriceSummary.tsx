import React from 'react';
import { Truck, Sparkles, CheckCircle2, ChevronRight, CornerDownRight, Tag } from 'lucide-react';
import { PricingResponse } from '../types';

interface PriceSummaryProps {
  pricing: PricingResponse | null;
  isExpress: boolean;
  onExpressToggle: (val: boolean) => void;
  onAddToCart: () => void;
  canAddToCart: boolean;
  isLoading: boolean;
}

export function PriceSummary(props: PriceSummaryProps) {
  if (props.isLoading || !props.pricing) {
    return (
      <div className="rounded-xl border border-slate-250 bg-white p-6 shadow-md animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-200 rounded mb-6"></div>
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
          <div className="h-4 bg-slate-100 rounded w-2/3"></div>
        </div>
        <div className="h-12 bg-slate-100 rounded-lg"></div>
      </div>
    );
  }

  const { prices, delivery, breakdown } = props.pricing;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 shadow-xl sticky top-24">
      <h3 className="text-base font-bold tracking-tight text-slate-100 flex items-center space-x-2">
        <Sparkles className="h-4.5 w-4.5 text-orange-400" />
        <span>Jouw Prijs &amp; Levering</span>
      </h3>

      {/* Dynamic Price Display Block */}
      <div className="mt-4 border-b border-white/10 pb-5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Totaal Excl. BTW</span>
          <span className="text-2xl font-black text-white">
            € {prices.net.toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-xs font-semibold text-slate-400">Inclusief 21% BTW (uiterste prijs)</span>
          <span className="text-sm font-bold text-slate-300">
            € {prices.gross.toFixed(2)}
          </span>
        </div>

        {prices.savings && prices.savings > 0 ? (
          <div className="mt-3.5 flex items-center space-x-2 rounded-lg bg-orange-500/15 border border-orange-500/30 px-3 py-2 text-xs font-bold text-orange-400">
            <Tag className="h-4 w-4 shrink-0" />
            <span>Volumekorting toegepast: Je bespaart € {prices.savings.toFixed(2)}!</span>
          </div>
        ) : null}
      </div>

      {/* Fast Express Speed toggle slider */}
      <div className="py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-100">Super Snel? Spoedlevering!</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Bespaar 2 dagen productietijd.</p>
          </div>
          <button
            id="express-delivery-toggle"
            onClick={() => props.onExpressToggle(!props.isExpress)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              props.isExpress ? 'bg-orange-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                props.isExpress ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Detailed cost breakdowns */}
      <div className="py-4 border-b border-white/10">
        <h4 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Specificatie opbouw</h4>
        <div className="space-y-1.5 max-h-36 overflow-y-auto">
          {breakdown.map((item, index) => (
            <div key={index} className="flex justify-between text-xs leading-normal font-medium">
              <span className="text-slate-400 flex items-center">
                <CornerDownRight className="h-3 w-3 mr-1 text-slate-600 shrink-0" />
                {item.label}
              </span>
              <span className={item.value < 0 ? 'text-orange-400 font-semibold' : 'text-slate-200'}>
                {item.value < 0 ? '-' : ''}€ {Math.abs(item.value).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Banner & Badging details */}
      <div className="py-4 flex items-start space-x-3 text-slate-200">
        <Truck className={`h-5 w-5 shrink-0 ${props.isExpress ? 'text-orange-400' : 'text-indigo-400'} mt-0.5`} />
        <div>
          <p className="text-xs font-extrabold text-white">Gegarandeerde bezorgdatum:</p>
          <p className={`text-sm font-black ${props.isExpress ? 'text-orange-400' : 'text-emerald-400'} mt-0.5`}>
            {delivery.estimatedDate}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{delivery.urgencyText}</p>
        </div>
      </div>

      {/* Add To Cart Button */}
      <button
        id="btn-add-to-cart"
        onClick={props.onAddToCart}
        className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer ${
          props.canAddToCart
            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-900/30'
            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
        }`}
      >
        <CheckCircle2 className="h-4.5 w-4.5" />
        <span>In Winkelwagen Leggen</span>
      </button>

      {!props.canAddToCart && (
        <p className="text-[10px] text-center text-rose-400 font-semibold mt-2.5">
          * Upload eerst je bestand hierboven om te bestellen.
        </p>
      )}
    </div>
  );
}
