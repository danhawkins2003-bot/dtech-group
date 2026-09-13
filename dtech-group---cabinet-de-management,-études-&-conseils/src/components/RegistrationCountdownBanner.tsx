import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Flame, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  PhoneCall, 
  Sparkles,
  Users
} from 'lucide-react';
import { PlatformCourse } from '../types';
import { DTECH_INSTITUTIONAL_DATA } from '../data/dtechPlatformData';

interface RegistrationCountdownBannerProps {
  onEnrollCourse?: (course: PlatformCourse) => void;
  courses?: PlatformCourse[];
  onOpenOrientation?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const RegistrationCountdownBanner: React.FC<RegistrationCountdownBannerProps> = ({
  onEnrollCourse,
  courses = [],
  onOpenOrientation
}) => {
  // Date cible de la rentrée solennelle : 14 Septembre 2026 à 08:00:00 UTC/GMT (heure de Lomé)
  const targetDate = new Date('2026-09-14T08:00:00Z').getTime();

  const calculateTimeRemaining = (): TimeRemaining => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
  };

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTimeRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleQuickRegister = () => {
    if (courses.length > 0 && onEnrollCourse) {
      onEnrollCourse(courses[0]);
    } else {
      const el = document.getElementById('catalogue-formations');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Format number with leading zero
  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  return (
    <section 
      id="rentree-countdown-section" 
      aria-label="Compte à rebours de la rentrée officielle"
      className="mb-5 overflow-hidden rounded-xl sm:rounded-2xl border border-amber-400/30 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white shadow-md relative"
    >
      {/* Halo lumineux discret */}
      <div className="absolute right-0 top-0 w-64 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Mini bandeau d'alerte en 1 ligne */}
      <div className="bg-amber-500 text-slate-950 px-3 py-1 text-[11px] sm:text-xs font-black flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <Flame className="w-3.5 h-3.5 text-slate-950 shrink-0" />
          <span className="uppercase tracking-wider truncate">
            Rentrée Nationale : 14 Septembre 2026 • 7 Centres au Togo
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-black shrink-0">
          <span className="bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded">
            {DTECH_INSTITUTIONAL_DATA.accreditationNumber}
          </span>
          <span className="text-slate-900 font-bold">Cohortes limitées à 25</span>
        </div>
      </div>

      {/* Corps compact et horizontal (Adapté smartphone et desktop) */}
      <div className="p-2.5 sm:p-4 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-4">
        
        {/* Partie 1 : Compteur compact avec chiffres nets */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden xs:flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase shrink-0">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Lancement :</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 w-full xs:w-auto">
            {/* Jours */}
            <div className="bg-slate-900/90 border border-slate-700/70 rounded-md sm:rounded-lg px-2 py-1 flex flex-col items-center justify-center min-w-[52px] sm:min-w-[58px]">
              <span className="text-sm sm:text-lg font-black text-white leading-none tabular-nums">
                {formatNumber(timeLeft.days)}
              </span>
              <span className="text-[8px] sm:text-[9.5px] font-bold uppercase text-slate-400 mt-0.5 leading-none">
                Jours
              </span>
            </div>

            {/* Heures */}
            <div className="bg-slate-900/90 border border-slate-700/70 rounded-md sm:rounded-lg px-2 py-1 flex flex-col items-center justify-center min-w-[52px] sm:min-w-[58px]">
              <span className="text-sm sm:text-lg font-black text-white leading-none tabular-nums">
                {formatNumber(timeLeft.hours)}
              </span>
              <span className="text-[8px] sm:text-[9.5px] font-bold uppercase text-slate-400 mt-0.5 leading-none">
                Heures
              </span>
            </div>

            {/* Minutes */}
            <div className="bg-slate-900/90 border border-slate-700/70 rounded-md sm:rounded-lg px-2 py-1 flex flex-col items-center justify-center min-w-[52px] sm:min-w-[58px]">
              <span className="text-sm sm:text-lg font-black text-white leading-none tabular-nums">
                {formatNumber(timeLeft.minutes)}
              </span>
              <span className="text-[8px] sm:text-[9.5px] font-bold uppercase text-slate-400 mt-0.5 leading-none">
                Mins
              </span>
            </div>

            {/* Secondes */}
            <div className="bg-slate-900/90 border border-slate-700/70 rounded-md sm:rounded-lg px-2 py-1 flex flex-col items-center justify-center min-w-[52px] sm:min-w-[58px]">
              <span className="text-sm sm:text-lg font-black text-amber-400 leading-none tabular-nums animate-pulse">
                {formatNumber(timeLeft.seconds)}
              </span>
              <span className="text-[8px] sm:text-[9.5px] font-bold uppercase text-amber-300 mt-0.5 leading-none">
                Secs
              </span>
            </div>
          </div>
        </div>

        {/* Partie 2 : Disponibilité rapide des places (1 ligne sobre) */}
        <div className="flex items-center justify-between sm:justify-start gap-2 text-[10.5px] sm:text-xs text-slate-300 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
          <div className="flex items-center gap-1 text-slate-300 truncate">
            <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">
              <strong className="text-white font-bold">88%</strong> réservé • <span className="text-amber-300 font-semibold">Places limitées</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-emerald-400">
              60% Inscription / 40% 5e mois
            </span>
          </div>
        </div>

        {/* Partie 3 : Boutons d'actions compacts en ligne */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-countdown-register"
            type="button"
            onClick={handleQuickRegister}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-xs transition-transform active:scale-95 text-xs sm:text-xs cursor-pointer whitespace-nowrap"
          >
            <span>Réserver (14 Sept)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <a
            id="btn-countdown-call"
            href="tel:+22892898979"
            className="inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold px-2.5 py-1.5 sm:py-2 rounded-lg border border-slate-700 text-xs transition-colors"
            title="Appeler Admissions (+228) 92 89 89 79"
          >
            <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">(+228) 92 89 89 79</span>
          </a>
        </div>

      </div>
    </section>
  );
};
