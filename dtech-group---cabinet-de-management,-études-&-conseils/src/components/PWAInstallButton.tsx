import React, { useState } from 'react';
import { Download, Smartphone, Check, X, Share2, PlusSquare, ArrowDownToLine, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'hero' | 'banner' | 'floating';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Si l'application est déjà installée et ouverte en standalone, afficher un badge discret ou ne rien afficher
  if (isInstalled) {
    if (variant === 'banner') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/30 text-emerald-400 border border-emerald-700/50">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Application DTech Installée</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      // Si le prompt natif n'est pas prêt ou sous iOS, ouvrir le guide d'installation
      setShowModal(true);
    }
  };

  // Bouton pour la Navbar
  if (variant === 'navbar') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
            isInstallable
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30'
          } ${className}`}
          title="Installer DTECH GROUP sur votre téléphone ou ordinateur"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Télécharger l'App</span>
          <span className="sm:hidden">App</span>
        </button>

        {showModal && <InstallGuideModal isIOS={isIOS} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  // Bouton pour Hero ou Bannière principale
  if (variant === 'hero' || variant === 'banner') {
    return (
      <>
        <div className={`flex flex-col sm:flex-row items-center gap-3 ${className}`}>
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Télécharger l'application officielle</span>
          </button>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-slate-300" />
            <Monitor className="w-3.5 h-3.5 text-slate-300" />
            Android, iPhone & PC • Accès hors-ligne & instantané
          </span>
        </div>

        {showModal && <InstallGuideModal isIOS={isIOS} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Télécharger l'application</span>
      </button>

      {showModal && <InstallGuideModal isIOS={isIOS} onClose={() => setShowModal(false)} />}
    </>
  );
};

interface InstallGuideModalProps {
  isIOS: boolean;
  onClose: () => void;
}

const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isIOS, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-900">
        
        {/* En-tête du modal avec logo DTECH */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md shrink-0 flex items-center justify-center">
              <img src="/logo-dtech.png" alt="DTECH GROUP" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-white leading-tight">
                Installer DTECH GROUP
              </h3>
              <p className="text-xs text-blue-200">
                Application officielle certifiée par l'État togolais
              </p>
            </div>
          </div>
        </div>

        {/* Corps des instructions */}
        <div className="p-6 space-y-4">
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900">
            <strong>Pourquoi installer l'application ?</strong>
            <ul className="mt-1 space-y-1 list-disc list-inside text-blue-800">
              <li>Accès direct depuis votre écran d'accueil sans taper d'adresse</li>
              <li>Consultez vos cours, notes et diplômes même hors-connexion</li>
              <li>Recevez les convocations d'examens et alertes de bourses</li>
            </ul>
          </div>

          {isIOS ? (
            /* Guide Safari iOS */
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Installation sur iPhone & iPad (Safari)
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="p-1 rounded bg-blue-100 text-blue-700 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900">Étape 1 : Bouton Partager</strong>
                    Appuyez sur l'icône de partage située en bas de l'écran de votre Safari.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="p-1 rounded bg-emerald-100 text-emerald-700 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900">Étape 2 : Sur l'écran d'accueil</strong>
                    Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="p-1 rounded bg-amber-100 text-amber-700 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900">Étape 3 : Confirmer l'ajout</strong>
                    Appuyez sur <strong>« Ajouter »</strong> en haut à droite. L'icône DTech apparaîtra sur votre téléphone.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Guide Android / Chrome / PC */
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Installation sur Android, Windows ou Mac
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="p-1 rounded bg-blue-100 text-blue-700 shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900">Installation automatique</strong>
                    Cliquez sur l'icône d'installation dans la barre d'adresse de votre navigateur ou dans le menu (<strong>⋮</strong> &gt; <strong>« Installer l'application »</strong>).
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            J'ai compris
          </button>

        </div>

      </div>
    </div>
  );
};
