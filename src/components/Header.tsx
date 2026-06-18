import React, { useState } from 'react';
import { ShoppingCart, LogIn, LogOut, User, Printer, Cpu, ChevronDown, FileText } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { ProductType } from '../types';

interface HeaderProps {
  onCartClick: () => void;
  cartCount: number;
  currentUser: any;
  activeCategory: ProductType;
  setActiveCategory: (cat: ProductType) => void;
  currentView: 'home' | 'configurator' | 'admin';
  setCurrentView: (view: 'home' | 'configurator' | 'admin') => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onLogoutClick: () => void;
}

export function Header(props: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [prodMenuOpen, setProdMenuOpen] = useState(false);

  const handleLogin = () => {
    props.onLoginClick();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      props.onLogoutClick();
      setDropdownOpen(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const productCategoriesList: { id: ProductType; name: string; group?: string }[] = [
    { id: 'business_card', name: 'Visitekaartjes', group: 'Promotie' },
    { id: 'flyer', name: 'Flyers & Folders', group: 'Promotie' },
    { id: 'poster', name: 'Posters', group: 'Promotie' },
    { id: 'backlit_poster', name: 'Lichtbak Posters', group: 'Promotie' },
    { id: 'rollup_banner', name: 'Roll-up Banners', group: 'Promotie' },
    { id: 'neon_poster', name: 'Neon Posters', group: 'Promotie' },
    { id: 'wallpaper_airtex', name: 'Fotobehang (Airtex)', group: 'Fotobehang' },
    { id: 'wall_circle_gekkotex', name: 'Muurcirkels (Gekkotex)', group: 'Fotobehang' },
    { id: 'spandoek', name: 'Spandoeken', group: 'Outdoor' },
    { id: 'dranghek_banner', name: 'Dranghek Doeken', group: 'Outdoor' },
    { id: 'hekwerk_banner', name: 'Bouwhek Doeken', group: 'Outdoor' },
    { id: 'brochures', name: 'Brochures / Magazines', group: 'Overig' },
    { id: 'folders', name: 'Gevouwen Folders', group: 'Overig' },
    { id: 'fleecedekens', name: 'Fleecedekens', group: 'Overig' },
    { id: 'foto_canvas', name: 'Foto op Canvas', group: 'Overig' },
    { id: 'handdoeken', name: 'Handdoeken', group: 'Overig' },
    { id: 'mokken', name: 'Mokken', group: 'Overig' },
    { id: 'vlaggen', name: 'Mast- & Gevelvlaggen', group: 'Overig' },
    { id: 'kleding', name: 'Bedrijfskleding', group: 'Overig' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo with CMYK print dots design */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3 cursor-pointer animate-fade-in" onClick={() => props.setCurrentView('home')}>
            {/* Authentic Magenta Stylized "Sd" Logo Icon */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg 
                width="45" 
                height="36" 
                viewBox="0 0 45 36" 
                fill="none" 
                xmlns="https://www.w3.org/2000/svg" 
                className="shrink-0 drop-shadow-sm"
              >
                <path 
                  d="M4 2C1.8 2 0 3.8 0 6V26C0 31.5 4.5 36 10 36H35C40.5 36 45 31.5 45 26V8C45 4.7 42.3 2 39 2H4Z" 
                  fill="#E20074" 
                />
                <text 
                  x="5" 
                  y="26" 
                  fill="white" 
                  fontSize="24" 
                  fontWeight="950" 
                  fontFamily="'Inter', 'Arial Black', sans-serif" 
                  letterSpacing="-2"
                >
                  S
                </text>
                <text 
                  x="20" 
                  y="26" 
                  fill="white" 
                  fontSize="24" 
                  fontWeight="900" 
                  fontFamily="'Inter', 'Segoe UI', sans-serif" 
                  fontStyle="italic"
                >
                  d
                </text>
              </svg>
            </div>
            {/* Exact Logo Text Styling with dynamic weight pairings */}
            <div className="flex flex-col select-none">
              <span className="text-xl font-black tracking-tight text-slate-800 leading-none">
                Stunt<span className="font-semibold text-slate-700">druk.nl</span>
              </span>
              <div className="flex items-center mt-1 space-x-1.5">
                <span className="text-[10px] font-medium tracking-normal text-slate-500 lowercase">
                  uw stuntdrukker online
                </span>
                {/* CMYK Accent Swatch block */}
                <span className="inline-flex h-3 w-4 rounded-xs overflow-hidden border border-slate-200/80 shrink-0">
                  <span className="h-full w-1/4 bg-cyan-400"></span>
                  <span className="h-full w-1/4" style={{ backgroundColor: '#E20074' }}></span>
                  <span className="h-full w-1/4" style={{ backgroundColor: '#FFCC00' }}></span>
                  <span className="h-full w-1/4 bg-black"></span>
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Products Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 relative">
            <button
              id="nav-home-btn"
              onClick={() => props.setCurrentView('home')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                props.currentView === 'home'
                  ? 'bg-indigo-650 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Home
            </button>
            <button
              id="nav-business-cards"
              onClick={() => {
                props.setActiveCategory('business_card');
                props.setCurrentView('configurator');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                props.currentView === 'configurator' && props.activeCategory === 'business_card'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Visitekaartjes
            </button>
            <button
              id="nav-flyers"
              onClick={() => {
                props.setActiveCategory('flyer');
                props.setCurrentView('configurator');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                props.currentView === 'configurator' && props.activeCategory === 'flyer'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Flyers
            </button>

            {/* Mega Dropdown for Assortment */}
            <div className="relative">
              <button
                id="megamenu-toggle-btn"
                onClick={() => setProdMenuOpen(!prodMenuOpen)}
                onBlur={() => setTimeout(() => setProdMenuOpen(false), 200)}
                className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                  prodMenuOpen 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>Compleet Assortiment</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-250 ${prodMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {prodMenuOpen && (
                <div className="absolute left-0 mt-2 w-[480px] origin-top-left rounded-xl border border-slate-150 bg-white p-4 shadow-xl z-50 animate-fade-in grid grid-cols-2 gap-4">
                  {['Promotie', 'Fotobehang', 'Outdoor', 'Overig'].map((grp) => (
                    <div key={grp} className="space-y-1.5 text-[11px]">
                      <p className="font-extrabold text-indigo-600 tracking-wider uppercase text-[9px] mb-1">{grp}</p>
                      <ul className="space-y-1">
                        {productCategoriesList
                          .filter(p => p.group === grp)
                          .map((p) => (
                            <li key={p.id}>
                              <button
                                onClick={() => {
                                  props.setActiveCategory(p.id);
                                  props.setCurrentView('configurator');
                                  setProdMenuOpen(false);
                                }}
                                className={`text-left w-full rounded-md px-2 py-1 transition-colors font-medium text-[10.5px] ${
                                  props.currentView === 'configurator' && props.activeCategory === p.id 
                                    ? 'bg-indigo-50 text-indigo-700 font-bold' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                {p.name}
                              </button>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Action Widgets and Authorization State Block */}
        <div className="flex items-center space-x-4">
          
          <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Prepress-controle: <strong>Ingeschakeld</strong></span>
          </div>

          {/* Dynamic Active Shopping Cart Trigger Button */}
          <button
            id="header-cart-btn"
            onClick={props.onCartClick}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-orange-500 transition-all duration-200"
            aria-label="Winkelwagen openen"
          >
            <ShoppingCart className="h-5 w-5" />
            {props.cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce-short">
                {props.cartCount}
              </span>
            )}
          </button>

          {/* Guest or Account Auth Indicator Dropdown Block */}
          <div className="relative">
            {props.currentUser ? (
              <div className="relative">
                <button
                  id="auth-avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex h-10 items-center space-x-2 rounded-full border border-slate-200 bg-slate-50 pl-2 pr-3 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {props.currentUser.photoURL ? (
                    <img
                      src={props.currentUser.photoURL}
                      alt={props.currentUser.displayName || 'Gebruiker'}
                      className="h-6 w-6 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <span className="max-w-[70px] truncate text-xs font-semibold text-slate-700 md:max-w-[100px]">
                    {props.currentUser.displayName?.split(' ')[0] || 'Klant'}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-slate-100 bg-white p-1 shadow-lg ring-1 ring-black/5 animate-fade-in z-50">
                    <div className="px-3 py-2 border-b border-slate-50">
                      <p className="text-xs text-slate-400">Ingelogd als</p>
                      <p className="truncate text-xs font-bold text-slate-700">{props.currentUser.email}</p>
                    </div>
                    
                    <button
                      onClick={() => { props.onProfileClick(); setDropdownOpen(false); }}
                      className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      <span>Mijn Profiel / Gegevens</span>
                    </button>

                    <button
                      onClick={() => { props.onOrdersClick(); setDropdownOpen(false); }}
                      className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span>Mijn Bestellingen</span>
                    </button>

                    {(props.currentUser?.role === 'admin' || props.currentUser?.email === 'bastiaanh79@gmail.com' || props.currentUser?.email === 'admin@stuntdruk.nl') && (
                      <button
                        onClick={() => { props.setCurrentView('admin'); setDropdownOpen(false); }}
                        className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <Cpu className="h-4 w-4 text-indigo-550" />
                        <span>🔒 Beheerderspaneel</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      id="auth-logout-btn"
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Uitloggen</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="auth-login-btn"
                onClick={handleLogin}
                className="flex items-center space-x-1.5 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Inloggen</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
