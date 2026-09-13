import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  Calculator,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { DTECH_INFO } from '../data/dtechData';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenSimulator }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'a-propos', label: 'Le Cabinet' },
    { id: 'expertises', label: 'Nos Expertises' },
    { id: 'formations', label: 'Formations' },
    { id: 'simulateur', label: 'Devis & Simulateur' },
    { id: 'centres', label: 'Centres Lomé & Kara' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-200">
      {/* Top Banner Contact & Info */}
      <div id="top-bar" className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center flex-wrap gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Implantations au Togo : Lomé (Siège) & Kara
            </span>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <a 
              href={`mailto:${DTECH_INFO.email}`} 
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{DTECH_INFO.email}</span>
            </a>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{DTECH_INFO.mainPhone}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Cabinet Agréé de Management & Conseils
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Identity */}
          <button 
            id="brand-logo-btn"
            onClick={() => handleNavClick('accueil')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200 border border-blue-600/30">
              <div className="text-center font-black tracking-tighter leading-none">
                <span className="text-xl font-bold tracking-tight text-white">D</span>
                <span className="text-amber-400 text-base font-extrabold">TECH</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
                  DTECH GROUP
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  TOGO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Cabinet de Management, Études & Conseils
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'text-blue-700 bg-blue-50 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              id="header-cta-quote-btn"
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Simuler un projet</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drop down */}
      {isMobileMenuOpen && (
        <div id="mobile-nav-panel" className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              id="mobile-cta-simulator"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenSimulator();
              }}
              className="w-full py-3 rounded-lg bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow"
            >
              <Calculator className="w-4 h-4" />
              <span>Simuler un besoin / Devis Express</span>
            </button>
            <a
              href={`mailto:${DTECH_INFO.email}`}
              className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs text-center block"
            >
              Écrire au Cabinet : {DTECH_INFO.email}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
