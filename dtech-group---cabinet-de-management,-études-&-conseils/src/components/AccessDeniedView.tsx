import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, LogIn } from 'lucide-react';
import { AuthUser, UserRole } from '../types';

interface AccessDeniedViewProps {
  requiredRole: UserRole | string;
  currentUser: AuthUser | null;
  onGoHome: () => void;
  onOpenLogin: () => void;
  onGoToOwnSpace?: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  requiredRole,
  currentUser,
  onGoHome,
  onOpenLogin,
  onGoToOwnSpace
}) => {
  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'admin': return 'Direction Générale (DG)';
      case 'study_director': return 'Directeur des Études (Pédagogie)';
      case 'secretary': return 'Secrétaire des Admissions';
      case 'trainer': return 'Formateur Agréé';
      case 'student': return 'Étudiant / Apprenant';
      default: return 'Utilisateur habilité';
    }
  };

  const getOwnPath = (role: string) => {
    switch (role) {
      case 'study_director': return '/study-director';
      case 'secretary': return '/secretary';
      case 'trainer': return '/trainer';
      case 'student': return '/student';
      case 'admin': return '/admin';
      default: return '/';
    }
  };

  return (
    <div className="py-16 bg-slate-100 min-h-[calc(100vh-140px)] flex items-center justify-center px-4">
      <div className="bg-white border-2 border-red-200 max-w-lg w-full p-8 shadow-xl text-center space-y-6 rounded-2xl">
        
        <div className="w-16 h-16 bg-red-100 border border-red-300 text-red-700 flex items-center justify-center mx-auto rounded-2xl">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 px-3 py-1 inline-block rounded-full">
            Sécurité • Accès Restreint 403
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            Accès Refusé — Autorisation Requise
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Cet espace privé est strictement réservé aux utilisateurs ayant le rôle <strong>{getRoleLabel(requiredRole)}</strong>.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 text-xs text-left text-slate-700 space-y-2 rounded-xl">
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="text-slate-500">Statut d'authentification :</span>
            <strong className={currentUser ? 'text-indigo-700' : 'text-amber-700'}>
              {currentUser ? `Connecté (${currentUser.email})` : 'Non connecté (Visiteur)'}
            </strong>
          </div>
          {currentUser && (
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">Votre rôle actuel :</span>
              <strong className="text-slate-900 uppercase font-mono">{currentUser.role}</strong>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Rôle exigé par le serveur :</span>
            <strong className="text-red-700 uppercase font-mono">{requiredRole}</strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {!currentUser ? (
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm rounded-xl"
            >
              <LogIn className="w-4 h-4" />
              <span>Se connecter</span>
            </button>
          ) : (
            onGoToOwnSpace && (
              <button
                type="button"
                onClick={onGoToOwnSpace}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm rounded-xl"
              >
                <Lock className="w-4 h-4" />
                <span>Aller à mon espace ({currentUser.role})</span>
              </button>
            )
          )}

          <button
            type="button"
            onClick={onGoHome}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au portail public</span>
          </button>
        </div>

      </div>
    </div>
  );
};
