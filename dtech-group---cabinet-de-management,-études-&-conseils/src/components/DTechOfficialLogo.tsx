import React from 'react';

interface DTechOfficialLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'diploma';
  className?: string;
  showHat?: boolean;
}

export const DTechOfficialLogo: React.FC<DTechOfficialLogoProps> = ({
  variant = 'compact',
  className = '',
  showHat = true,
}) => {
  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/logo-dtech.png"
          alt="DTECH GROUP Togo"
          className="w-10 h-10 object-contain rounded-lg drop-shadow-sm"
          onError={(e) => {
            // Fallback SVG si le PNG n'est pas encore rechargé
            (e.currentTarget as HTMLImageElement).src = '/icon.svg';
          }}
        />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`relative inline-block ${className}`}>
        <div className="relative bg-white/95 border border-slate-200/90 rounded-2xl p-4 shadow-lg flex items-center gap-4 max-w-md">
          <img
            src="/logo-dtech.png"
            alt="DTECH GROUP Cabinet de Management Études & Conseils"
            className="w-20 h-20 object-contain shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/icon.svg';
            }}
          />
          <div className="text-left space-y-0.5">
            <div className="flex items-center gap-1 text-blue-600">
              <span className="text-xs">★★★★★</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Agrément État N° 003</span>
            </div>
            <h3 className="font-serif font-black text-xl text-blue-900 tracking-tight leading-none">
              DTECH GROUP
            </h3>
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">
              CABINET DE MANAGEMENT ETUDES &amp; CONSEILS
            </p>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">
              DIPLÔME AGRÉÉ PAR L'ÉTAT TOGOLAIS
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'diploma') {
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`}>
        <img
          src="/logo-dtech.png"
          alt="DTECH GROUP Diplôme Agréé"
          className="h-16 w-auto object-contain drop-shadow-sm"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/icon.svg';
          }}
        />
      </div>
    );
  }

  // Variant compact par défaut (idéal pour Header / Navbar)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative shrink-0 w-11 h-11 bg-white/95 rounded-xl p-1 shadow-md border border-slate-200 flex items-center justify-center overflow-hidden">
        <img
          src="/logo-dtech.png"
          alt="DTECH GROUP Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/icon.svg';
          }}
        />
      </div>
      <div className="text-left leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-base sm:text-lg text-white tracking-tight">
            DTECH GROUP
          </span>
          <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider">
            AGRÉÉ ÉTAT
          </span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 tracking-tight font-medium truncate max-w-[210px] sm:max-w-[280px]">
          Cabinet d'Études &bull; Formations Professionnelles Agréées
        </p>
      </div>
    </div>
  );
};
