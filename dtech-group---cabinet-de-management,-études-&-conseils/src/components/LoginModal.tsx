import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Building2,
  GraduationCap,
  UserCheck,
  LayoutDashboard,
  FileBadge,
  Building,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { authService } from '../services/authService';
import { AuthUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onOpenRegister?: () => void;
  onNavigate?: (path: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegister,
  onNavigate
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const performLogin = async (loginEmail: string, loginPass: string) => {
    if (!loginEmail || !loginPass) {
      setErrorMsg('Veuillez saisir votre adresse email et votre mot de passe.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await authService.login(loginEmail, loginPass);
      onLoginSuccess(response.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    performLogin(demoEmail, demoPass);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 w-full max-w-lg shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 rounded-3xl">
        
        {/* Header Institutionnel */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors rounded-full"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 bg-indigo-600 text-white font-black flex items-center justify-center text-sm rounded-lg">
              DT
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                DTECH GROUP • Authentification Sécurisée
              </span>
            </div>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight">
            S'inscrire / Se connecter
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Accédez à votre espace ou démarrez votre inscription en ligne à l'une de nos formations diplômantes.
          </p>
        </div>

        {/* Corps du Formulaire */}
        <div className="p-6 space-y-5 text-slate-800 text-xs">

          {/* Option Inscription Nouveau Candidat */}
          {onOpenRegister && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900 text-xs">Nouveau candidat ?</p>
                <p className="text-[11px] text-slate-600">Inscrivez-vous en ligne en quelques étapes.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                S'inscrire en ligne
              </button>
            </div>
          )}
          
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
                Adresse Email Institutionnelle ou Personnelle
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nom@dtech.tg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  Mot de Passe Sécurisé
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Connexion en cours...</span>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sélecteur Rapide pour Démonstrations et Tests */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Connexion directe en 1 Clic (5 Rôles RBAC) :
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('etudiant@dtech.tg', 'etudiant2026')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-left transition-all flex items-center gap-2 text-emerald-950 shadow-xs hover:shadow-sm cursor-pointer group"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <p className="font-bold text-[11px] flex items-center gap-1">
                    <span>Espace Étudiant</span>
                    <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1 py-0.2 rounded font-normal">1 Clic</span>
                  </p>
                  <p className="text-[10px] text-emerald-800 font-mono truncate">etudiant@dtech.tg</p>
                  <p className="text-[9px] text-emerald-600 font-mono">mdp: etudiant2026</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('formateur@dtech.tg', 'formateur2026')}
                className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-left transition-all flex items-center gap-2 text-indigo-950 shadow-xs hover:shadow-sm cursor-pointer group"
              >
                <UserCheck className="w-4 h-4 text-indigo-600 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <p className="font-bold text-[11px] flex items-center gap-1">
                    <span>Espace Formateur</span>
                    <span className="text-[9px] bg-indigo-200 text-indigo-900 px-1 py-0.2 rounded font-normal">1 Clic</span>
                  </p>
                  <p className="text-[10px] text-indigo-800 font-mono truncate">formateur@dtech.tg</p>
                  <p className="text-[9px] text-indigo-600 font-mono">mdp: formateur2026</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('directeur.etudes@dtech.tg', 'directeur2026')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-left transition-all flex items-center gap-2 text-blue-950 shadow-xs hover:shadow-sm cursor-pointer group"
              >
                <Building className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <p className="font-bold text-[11px] flex items-center gap-1">
                    <span>Directeur des Études</span>
                    <span className="text-[9px] bg-blue-200 text-blue-900 px-1 py-0.2 rounded font-normal">1 Clic</span>
                  </p>
                  <p className="text-[10px] text-blue-800 font-mono truncate">directeur.etudes@dtech.tg</p>
                  <p className="text-[9px] text-blue-600 font-mono">mdp: directeur2026</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('secretaire@dtech.tg', 'secretaire2026')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-left transition-all flex items-center gap-2 text-amber-950 shadow-xs hover:shadow-sm cursor-pointer group"
              >
                <FileBadge className="w-4 h-4 text-amber-600 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <p className="font-bold text-[11px] flex items-center gap-1">
                    <span>Espace Secrétariat</span>
                    <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-normal">1 Clic</span>
                  </p>
                  <p className="text-[10px] text-amber-800 font-mono truncate">secretaire@dtech.tg</p>
                  <p className="text-[9px] text-amber-600 font-mono">mdp: secretaire2026</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@dtech.tg', 'admin2026')}
                className="sm:col-span-2 p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-left transition-all flex items-center gap-2 text-purple-950 shadow-xs hover:shadow-sm cursor-pointer group"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-600 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <p className="font-bold text-[11px] flex items-center gap-1">
                    <span>Direction Générale (DG — Tous Centres)</span>
                    <span className="text-[9px] bg-purple-200 text-purple-900 px-1 py-0.2 rounded font-normal">1 Clic</span>
                  </p>
                  <p className="text-[10px] text-purple-800 font-mono truncate">admin@dtech.tg</p>
                  <p className="text-[9px] text-purple-600 font-mono">mdp: admin2026</p>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
