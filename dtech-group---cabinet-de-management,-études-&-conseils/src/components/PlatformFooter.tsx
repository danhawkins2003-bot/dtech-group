import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Award, CheckCircle2, Lock, LogIn } from 'lucide-react';
import { AuthUser } from '../types';

interface PlatformFooterProps {
  currentUser: AuthUser | null;
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
}

export const PlatformFooter: React.FC<PlatformFooterProps> = ({
  currentUser,
  onNavigate,
  onOpenLogin
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1 : Identité */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-700 text-white font-bold flex items-center justify-center text-sm">
                DT
              </div>
              <span className="font-extrabold text-base text-white">DTECH GROUP TOGO</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cabinet de Management, d'Études Économiques, de Conseils Stratégiques et Plateforme de Formation Professionnelle Certifiante.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              Enregistré aux registres officiels de la République Togolaise.
            </div>
          </div>

          {/* Col 2 : Formations Clés */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Formations Certifiantes</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors cursor-pointer text-left">
                  • Infographie & Design Graphique
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors cursor-pointer text-left">
                  • Développement Web & Applications
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors cursor-pointer text-left">
                  • Comptabilité Sage 100 & SYSCOHADA
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors cursor-pointer text-left">
                  • Business Intelligence & Power BI
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors cursor-pointer text-left">
                  • Fiscalité Togolaise & Télédéclaration OTR
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 : Navigation & Espace Réservé */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Navigation & Accès</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/services')} className="hover:text-white transition-colors cursor-pointer text-left">
                  &rarr; Services de Conseil aux Entreprises
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/verify-cert')} className="hover:text-white transition-colors cursor-pointer text-left">
                  &rarr; Vérificateur Public de Certificats
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/verify-diploma')} className="hover:text-amber-400 text-amber-500/90 transition-colors cursor-pointer text-left font-medium">
                  &rarr; Vérification Officielle de Diplôme
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/news')} className="hover:text-white transition-colors cursor-pointer text-left">
                  &rarr; Actualités & Nouvelles Cohortes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/centres')} className="hover:text-white transition-colors cursor-pointer text-left">
                  &rarr; Centres Agréés de Lomé & Kara
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/faq')} className="hover:text-white transition-colors cursor-pointer text-left">
                  &rarr; Foire Aux Questions (FAQ)
                </button>
              </li>
              
              <li className="pt-2 border-t border-slate-800/80">
                {!currentUser ? (
                  <button 
                    onClick={onOpenLogin} 
                    className="text-blue-400 hover:text-blue-300 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Accès Réservé (Connexion)</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => onNavigate(`/${currentUser.role}`)} 
                    className="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Mon Espace ({currentUser.role})</span>
                  </button>
                )}
              </li>
            </ul>
          </div>

          {/* Col 4 : Centres Lomé & Kara */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Centres au Togo</h4>
            <div className="text-slate-300">
              <strong className="text-white block">Centre de Lomé (Siège National) :</strong>
              <p className="text-[11px] text-slate-400">Bd du 13 Janvier / Tokoin, Lomé</p>
              <p className="text-[11px] text-slate-400">Tél : +228 90 45 12 34</p>
            </div>
            <div className="text-slate-300 pt-2">
              <strong className="text-white block">Centre Régional de Kara :</strong>
              <p className="text-[11px] text-slate-400">Quartier Commercial, Kara</p>
              <p className="text-[11px] text-slate-400">Tél : +228 91 00 23 45</p>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} DTECH GROUP TOGO (Lomé & Kara). Tous droits réservés.
          </div>
          <div className="flex items-center gap-4">
            <span>Paiement sécurisé T-Money / Moov Flooz</span>
            <span>•</span>
            <span>Certifications conformes OHADA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
