import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  UserCheck, 
  LayoutDashboard, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  BookOpen, 
  Briefcase, 
  Newspaper,
  Menu,
  X,
  LogIn,
  LogOut,
  HelpCircle,
  FileBadge,
  Building,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AuthUser, AppNotification } from '../types';
import { NotificationDropdown } from './NotificationDropdown';
import { DTechOfficialLogo } from './DTechOfficialLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderNavbarProps {
  currentUser: AuthUser | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleAiAssistant?: () => void;
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentUser,
  currentPath,
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  searchQuery,
  setSearchQuery,
  onToggleAiAssistant,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDeleteNotification
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Direction Générale (DG)',
          icon: LayoutDashboard,
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          path: '/admin'
        };
      case 'study_director':
        return {
          label: 'Directeur des Études',
          icon: Building,
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          path: '/study-director'
        };
      case 'secretary':
        return {
          label: 'Secrétariat Admissions',
          icon: FileBadge,
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          path: '/secretary'
        };
      case 'trainer':
        return {
          label: 'Formateur Agréé',
          icon: UserCheck,
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          path: '/trainer'
        };
      case 'student':
      default:
        return {
          label: 'Espace Étudiant',
          icon: GraduationCap,
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          path: '/student'
        };
    }
  };

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-50">
      
      {/* Top Bar Institutionnelle */}
      <div className="bg-slate-950 px-3 sm:px-4 py-2 border-b border-slate-800/80 text-xs text-slate-300 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Réseau National : <strong>7 Centres Agréés au Togo</strong>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="inline-flex items-center gap-1 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              +228 92 89 89 79 / +228 90 18 40 78
            </span>
          </div>

          {/* Statut d'authentification en Top Bar (uniquement si connecté) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {currentUser && (
              <div className="flex items-center gap-2">
                {(() => {
                  const badge = getRoleBadge(currentUser.role);
                  const Icon = badge.icon;
                  return (
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border flex items-center gap-1 rounded-md ${badge.bg}`}>
                        <Icon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-xs text-slate-300 font-medium hidden sm:inline truncate max-w-[140px]">
                        {currentUser.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => onNavigate(badge.path)}
                        className={`text-xs px-3 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                          currentPath === badge.path
                            ? 'bg-amber-500 text-slate-950 font-extrabold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        Mon Espace
                      </button>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="text-xs text-slate-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Se déconnecter"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Barre Principale de Navigation (STRICTEMENT PUBLIQUE) */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Logo Institutionnel DTECH */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => onNavigate('/')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-slate-900 border border-indigo-500/40 rounded-xl flex items-center justify-center font-black text-white text-lg tracking-wider shadow-inner">
            DT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-white tracking-tight">DTECH GROUP</span>
              <span className="bg-indigo-900/80 border border-indigo-700 text-indigo-300 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                TOGO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
              Cabinet d'Études • Formations Métiers • Diplômes d’État
            </p>
          </div>
        </div>

        {/* Navigation Publique Épurée et Professionnelle */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => onNavigate('/')}
            className={`px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              currentPath === '/' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Formations</span>
          </button>
          
          <button
            onClick={() => onNavigate('/services')}
            className={`px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              currentPath === '/services' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Entreprises & Conseil</span>
          </button>

          <button
            onClick={() => onNavigate('/news')}
            className={`px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              currentPath === '/news' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Actualités & Rentrées</span>
          </button>

          <button
            onClick={() => onNavigate('/centres')}
            className={`px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              currentPath === '/centres' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Nos 7 Centres</span>
          </button>

          <button
            onClick={() => onNavigate('/verify-cert')}
            className={`px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              currentPath === '/verify-cert' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vérifier Diplôme</span>
          </button>

          <button
            onClick={() => onNavigate('/faq')}
            className={`px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              currentPath === '/faq' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ</span>
          </button>

          <button
            onClick={() => onNavigate('/contact')}
            className={`px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
              currentPath === '/contact' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact</span>
          </button>
        </nav>

        {/* Espace Connexion CTA & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          {!currentUser ? (
            <button
              onClick={onOpenLogin}
              className="hidden sm:inline-flex px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl border border-slate-700 transition-colors items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>S'inscrire / Se connecter</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate(getRoleBadge(currentUser.role).path)}
              className="hidden sm:inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors items-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Tableau de Bord</span>
            </button>
          )}

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-4 space-y-2 text-sm font-semibold">
          <button
            onClick={() => { onNavigate('/'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-200 hover:bg-slate-800"
          >
            Formations & Cursus
          </button>
          <button
            onClick={() => { onNavigate('/services'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-200 hover:bg-slate-800"
          >
            Services Entreprises
          </button>
          <button
            onClick={() => { onNavigate('/news'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-200 hover:bg-slate-800"
          >
            Actualités & Rentrées
          </button>
          <button
            onClick={() => { onNavigate('/centres'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-200 hover:bg-slate-800"
          >
            Nos 7 Centres au Togo
          </button>
          <button
            onClick={() => { onNavigate('/verify-cert'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-200 hover:bg-slate-800"
          >
            Vérifier un Diplôme / Certificat
          </button>
          <button
            onClick={() => { onNavigate('/faq'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-200 hover:bg-slate-800"
          >
            Foire Aux Questions (FAQ)
          </button>
          <button
            onClick={() => { onNavigate('/contact'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-200 hover:bg-slate-800"
          >
            Contact & Secrétariat
          </button>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {!currentUser ? (
              <button
                onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>S'inscrire / Se connecter</span>
              </button>
            ) : (
              <button
                onClick={() => { onNavigate(getRoleBadge(currentUser.role).path); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Accéder à mon espace ({currentUser.role})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
