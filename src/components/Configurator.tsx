import React from 'react';
import { HelpCircle, ChevronRight, Ban, Info, AlertTriangle, Layers, Maximize2, Coins, Palette } from 'lucide-react';
import { ProductAttributes, SelectedConfiguration } from '../types';

interface ConfiguratorProps {
  attributes: ProductAttributes;
  selected: SelectedConfiguration;
  notices: { type: 'info' | 'warning' | 'error'; message: string }[];
  onOptionSelect: (key: keyof SelectedConfiguration, id: string) => void;
}

export function Configurator(props: ConfiguratorProps) {
  const getIconForKey = (key: keyof SelectedConfiguration) => {
    switch (key) {
      case 'size': return <Maximize2 className="h-4.5 w-4.5 text-indigo-500" />;
      case 'paperType': return <Layers className="h-4.5 w-4.5 text-indigo-500" />;
      case 'printing': return <Palette className="h-4.5 w-4.5 text-indigo-500" />;
      case 'finishing': return <Layers className="h-4.5 w-4.5 text-orange-500" />;
      case 'quantity': return <Coins className="h-4.5 w-4.5 text-emerald-500" />;
      default: return <Maximize2 className="h-4.5 w-4.5 text-indigo-500" />;
    }
  };

  const getLabelForKey = (key: keyof SelectedConfiguration) => {
    switch (key) {
      case 'size': return '2. Kies je Formaat (Afmeting)';
      case 'paperType': return '3. Kies je Papiersoort (Grammage)';
      case 'printing': return '4. Kies je Bedrukking';
      case 'finishing': return '5. Kies je Luxe Veredeling';
      case 'quantity': return '6. Hoeveel stuks heb je nodig?';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Dynamic Compatibility warnings / corrections */}
      {props.notices && props.notices.length > 0 && (
        <div className="space-y-2">
          {props.notices.map((notice, idx) => (
            <div 
              key={idx} 
              className={`flex items-start space-x-3 rounded-lg p-3.5 border animate-fade-in ${
                notice.type === 'warning' 
                  ? 'bg-amber-50 border-amber-200 text-amber-800' 
                  : 'bg-indigo-50 border-indigo-100 text-indigo-800'
              }`}
            >
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11.5px] font-medium leading-relaxed">{notice.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Render configurator blocks */}
      {(['size', 'paperType', 'printing', 'finishing', 'quantity'] as const).map((attributeKey) => {
        const optionList = props.attributes[attributeKey];
        const selectedValue = props.selected[attributeKey];

        return (
          <div key={attributeKey} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="flex items-center space-x-2 text-sm font-bold text-slate-800">
                {getIconForKey(attributeKey)}
                <span>{getLabelForKey(attributeKey)}</span>
              </h4>
            </div>

            {/* Custom Interactive Grid Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {optionList?.map((option: any) => {
                const isSelected = option.id === selectedValue;
                const isDisabled = option.disabled;

                return (
                  <button
                    key={option.id}
                    id={`opt-${attributeKey}-${option.id}`}
                    disabled={isDisabled}
                    onClick={() => props.onOptionSelect(attributeKey, option.id)}
                    className={`group relative text-left p-3.5 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      isDisabled
                        ? 'border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-indigo-600 bg-indigo-50/10 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {option.name}
                      </p>
                      
                      {/* Check dot or Lock Icon */}
                      {isDisabled ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-150 text-slate-400">
                          <Ban className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-all ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-600 text-white' 
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}>
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white"></span>}
                        </span>
                      )}
                    </div>

                    {option.description && (
                      <p className="text-[10.5px] leading-relaxed text-slate-500 mt-1.5 font-medium">
                        {option.description}
                      </p>
                    )}

                    {/* Disable compatibility info helper */}
                    {isDisabled && option.disabledReason && (
                      <div className="mt-2.5 flex items-start space-x-1 border-t border-slate-100 pt-2 text-[9.5px] font-semibold text-slate-400">
                        <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>{option.disabledReason}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Sizing meter textboxes if Formaat custom ( maatwerk per m2 ) */}
            {attributeKey === 'size' && selectedValue === 'custom' && (
              <div className="mt-4 p-4 rounded-xl bg-indigo-50/20 border border-indigo-150 flex flex-col sm:flex-row gap-4 animate-fade-in text-xs">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Breedte (in meters) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={props.selected.width || '1.0'}
                      onChange={(e) => props.onOptionSelect('width', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500 outline-none pr-12 font-bold"
                    />
                    <span className="absolute right-3 top-2.5 text-[9px] text-slate-400 font-bold">meter</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Hoogte (in meters) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={props.selected.height || '1.0'}
                      onChange={(e) => props.onOptionSelect('height', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500 outline-none pr-12 font-bold"
                    />
                    <span className="absolute right-3 top-2.5 text-[9px] text-slate-400 font-bold">meter</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        );
      })}

    </div>
  );
}
