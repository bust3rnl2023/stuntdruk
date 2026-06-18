import React from 'react';
import { 
  Printer, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ThumbsUp, 
  Sparkles, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { ProductType } from '../types';
import { PRODUCT_SPECIFICATIONS } from './productData';

interface WelcomePageProps {
  onSelectProduct: (productType: ProductType) => void;
  onStartConfiguring: () => void;
}

export function WelcomePage({ onSelectProduct, onStartConfiguring }: WelcomePageProps) {
  // Group specifications for elegant categorized dashboard display
  const productGroups = {
    'Promotie & Huisstijl': [
      { id: 'business_card', name: 'Visitekaartjes', desc: 'Professionele visitekaartjes met luxe lamineerafwerking.', img: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=400' },
      { id: 'flyer', name: 'Flyers', desc: 'Laat uw boodschap schitteren met hoogglans of mat papier.', img: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=400' },
      { id: 'poster', name: 'Posters (A0 - B2)', desc: 'Grootse impact binnenshuis of buiten in abri-displays.', img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=400' },
      { id: 'brochures', name: 'Brochures / Magazines', desc: 'Netjes gebrocheerd en geniet voor jaarverslagen en boekjes.', img: 'https://images.unsplash.com/photo-1532155294541-2e882ad366f7?auto=format&fit=crop&q=80&w=400' },
    ],
    'Grootformaat & Outdoor': [
      { id: 'spandoek', name: 'Spandoeken', desc: 'Hoogwaardige frontlit of winddoorlatende mesh banners.', img: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400' },
      { id: 'rollup_banner', name: 'Roll-up Banners', desc: 'Inclusief cassette en draagtas. Perfect voor beurzen.', img: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&q=80&w=400' },
      { id: 'hekwerk_banner', name: 'Bouwhek Banners', desc: 'Exact passend voor modulaire bouwhekken op werven.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400' },
      { id: 'vlaggen', name: 'Vlaggen', desc: 'Mast- en gevelvlaggen bedrukt met sterke doordruk.', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400' },
    ],
    'Foto & Decoratie': [
      { id: 'wallpaper_airtex', name: 'Airtex Fotobehang', desc: 'Naadloos, krasvast en waterafstotend op maat gesneden.', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400' },
      { id: 'wall_circle_gekkotex', name: 'Muurcirkels Gekkotex', desc: 'Herpositioneerbare, zelfklevende textiele cirkels.', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=400' },
      { id: 'foto_canvas', name: 'Foto op Canvas', desc: 'Haarscherpe print gemonteerd op 2cm dikke houten frames.', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=400' },
    ],
    'Merchandise & Gifts': [
      { id: 'mokken', name: 'Bedrukte Mokken', desc: 'Vaatwasbestendig en rondom haarscherp bedrukt.', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400' },
      { id: 'kleding', name: 'Bedrijfskleding', desc: 'Comfortabele T-shirts en sweaters met transferprints.', img: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=400' },
      { id: 'fleecedekens', name: 'Fleecedekens', desc: 'Polar fleece dekens, heerlijk zacht voor thuis of op het terras.', img: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=400' },
    ]
  };

  return (
    <div className="space-y-16 animate-fade-in pb-16">
      
      {/* SECTION 1: Grand Hero Banner Header */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mt-2 mx-4 sm:mx-6 lg:mx-8">
        {/* Subtle decorative color accents mimicking neon CMYK inks */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-cyan-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-1/3 h-72 w-72 bg-fuchsia-500/10 blur-3xl rounded-full"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 sm:p-12 lg:p-16 relative z-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase text-cyan-400">
              <Sparkles className="h-3 w-3 shrink-0 text-fuchsia-400" />
              <span>Uw gecertificeerde online stuntdrukker</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
              Groots in drukwerk,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-orange-400 to-cyan-400">
                stuntprijzen in elke categorie.
              </span>
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
              Van zakelijke visitekaartjes en glanzende flyers tot naadloos airtex fotobehang en robuuste buitendoeken. Stuntdruk.nl combineert geautomatiseerde prepress-controles met razendsnelle lokale productie.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onStartConfiguring}
                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-fuchsia-600 to-pink-650 hover:from-fuchsia-750 hover:to-pink-750 text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <span>Direct bestellen</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#assortiment"
                className="inline-flex items-center justify-center border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs px-6 py-3.5 rounded-xl transition-all"
              >
                Ontdek assortiment
              </a>
            </div>

            {/* Quick trust bullet widgets */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-[10px] text-slate-300 font-bold">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Gratis Prepress Controle</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>48u Express Spoed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ThumbsUp className="h-4 w-4 text-orange-400 shrink-0" />
                <span>Altijd de Beste Deal</span>
              </div>
            </div>
          </div>

          {/* Majestic mock collage of active printing plates */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800" 
                alt="Modern commercial CMYK offset printing press" 
                className="w-full h-full object-cover select-none scale-105 hover:scale-100 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent p-4 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <div className="bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-sm border border-white/10 flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[8px] font-bold tracking-wider uppercase text-slate-300">Offset Pers Actief</span>
                  </div>
                  <span className="text-[10px] text-fuchsia-400 font-black">Zwolle, NL</span>
                </div>
              </div>
            </div>
            
            {/* Hanging decor card with CMYK swatches */}
            <div className="absolute -bottom-6 -left-4 bg-white text-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 flex items-center space-x-2.5 animate-bounce-short">
              <span className="flex flex-col space-y-1">
                <span className="text-[8px] text-slate-400 font-bold tracking-wider uppercase">Preflight</span>
                <span className="text-[10px] font-black text-slate-700 leading-none">CMYK Gekalibreerd</span>
              </span>
              <span className="flex h-6 w-9 rounded-xs overflow-hidden border border-slate-200">
                <span className="h-full w-1/4 bg-cyan-400"></span>
                <span className="h-full w-1/4 bg-fuchsia-500"></span>
                <span className="h-full w-1/4 bg-yellow-400"></span>
                <span className="h-full w-1/4 bg-slate-900"></span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Interactive Grid Assortment Catalog */}
      <section id="assortiment" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Compleet Assortiment Drukwerk</h2>
          <p className="text-slate-500 text-xs font-medium">
            Kies hieronder een productcategorie om direct de specificaties, papiergewichten en oplages op maat te configureren.
          </p>
        </div>

        {/* Display each grouped section beautifully */}
        {Object.entries(productGroups).map(([groupTitle, products]) => (
          <div key={groupTitle} className="space-y-4">
            <h3 className="text-sm font-black text-indigo-700 uppercase tracking-widest border-b border-indigo-100/50 pb-2 flex items-center gap-1.5ClassName">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{groupTitle}</span>
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => onSelectProduct(p.id as ProductType)}
                  className="group bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs hover:shadow-md transition-all hover:border-indigo-400 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-350"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-[10px] font-black text-white flex items-center space-x-1">
                        <span>Configureer nu</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1">
                    <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* SECTION 3: Detailed trust USPs details */}
      <section className="bg-slate-100 border-y border-slate-200 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <FileCheck className="h-5 w-5" />
              </div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Altijd Prepress check</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Onze studio controleert uw PDF’s, marges, inslag en CMYK-kleurprofielen voordat we drukken. Zo krijgt u nooit onverwachte verrassingen.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Vandaag besteld, snel in huis</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Dankzij onze efficiënte machines leveren we reguliere bestellingen standaard snel. Voor spoedgevallen is er de Express spoedservice.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Pristine Kwaliteitsgarantie</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Wij drukken enkel op topkwaliteit materialen zoals zwaar MC papier, krasvast polyester en gecertificeerd zeildoek.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Milieu & Duurzaamheid</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Al ons papier is ISO-gecertificeerd en afkomstig uit duurzaam beheerde FSC-bossen. We drukken met plantaardige inkt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Studio Location, Company Info & Opening Hours */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* General Company stats and addresses info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Klantenservice & Drukkerij</h3>
              <p className="text-xs text-slate-500">
                Heeft u specifieke vragen over uw bestanden of zoekt u een afwijkend formaat behang? Onze vakkundige medewerkers in Zwolle staan klaar om u persoonlijk te adviseren.
              </p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Drukkerij Zwolle (Hoofdkantoor)</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Stuntdruk.nl B.V.<br />
                    Ampèrestraat 18<br />
                    8013 PV Zwolle, Nederland
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">Telefoon support</p>
                  <p className="text-slate-500 text-[11px]">+31 (0)38 420 1234</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">E-mailadres</p>
                  <p className="text-slate-500 text-[11px]">support@stuntdruk.nl</p>
                </div>
              </div>
            </div>
          </div>

          {/* Opening times schedule calendar visual */}
          <div className="bg-slate-50 border border-slate-155 rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-indigo-600" />
              <span>Openingstijden Zwolle</span>
            </h4>
            
            <div className="divide-y divide-slate-150 text-[11px] font-bold text-slate-600">
              <div className="flex justify-between py-2">
                <span>Maandag</span>
                <span className="text-slate-800">08:30 - 17:30</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Dinsdag</span>
                <span className="text-slate-800">08:30 - 17:30</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Woensdag</span>
                <span className="text-slate-800">08:30 - 17:30</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Donderdag</span>
                <span className="text-slate-800">08:30 - 17:30</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Vrijdag</span>
                <span className="text-slate-800">08:30 - 17:00</span>
              </div>
              <div className="flex justify-between py-2 text-rose-600">
                <span>Zaterdag &amp; Zondag</span>
                <span className="bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-sm text-[9px] font-black uppercase text-rose-700">Gesloten</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal pt-2 border-t border-slate-200">
              * Wij raden aan om vooraf uw drukwerkbestanden via deze applicatie te uploaden zodat we uw prepress direct kunnen inplannen.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
