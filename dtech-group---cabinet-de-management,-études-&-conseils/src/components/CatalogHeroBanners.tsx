import React, { useState, useEffect, useRef } from 'react';
import { PlatformCourse } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Sparkles,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { 
  heroTrainingImg, 
  graphicDesignImg, 
  webDevImg, 
  accountingPowerBiImg,
  togoStudentsPromoImg,
  togoGraduateSuccessImg,
  DTECH_INSTITUTIONAL_DATA
} from '../data/dtechPlatformData';

interface CatalogHeroBannersProps {
  courses: PlatformCourse[];
  onEnrollCourse: (course: PlatformCourse) => void;
  onOpenFlyer?: (course: PlatformCourse) => void;
}

interface BannerSlideItem {
  id: string;
  themeStyle: 'mixx-blue' | 'yas-yellow-cyan' | 'yas-yellow-blue' | 'tech-indigo';
  badgeTop: string;
  titleMain: string;
  titleHighlight: string;
  subtextMobile: string;
  subtextDesktop: string;
  capsuleTag: string;
  capsulePrice: string;
  capsuleDetail: string;
  modelImage: string;
  targetCourseId: string;
  brandTag: string;
}

export const CatalogHeroBanners: React.FC<CatalogHeroBannersProps> = ({
  courses,
  onEnrollCourse,
  onOpenFlyer
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // 4 Bannières officielles au format panoramique / paysage exact des affiches de référence (Yas & Mixx)
  const bannerSlides: BannerSlideItem[] = [
    {
      id: 'banner-mixx-blue',
      themeStyle: 'mixx-blue',
      badgeTop: 'AGRÉMENT N° 003 / METFP / CAB / SE-CPO',
      titleMain: 'Forme-toi et décroche instantanément',
      titleHighlight: 'un emploi garanti',
      subtextMobile: 'Secrétariat, Sage 100, Transit Douane, Délégué Médical & Infographie.',
      subtextDesktop: 'DTECH GROUP & DELXIA : 9 Mois de Pratique + 3 Mois de Stage en Entreprise Garanti avec Diplôme d\'État.',
      capsuleTag: 'RENTRÉE',
      capsulePrice: '14 Sept. 2026',
      capsuleDetail: '7 Centres Togo',
      modelImage: togoGraduateSuccessImg,
      targetCourseId: 'c9-secretariat-comptabilite-caisse',
      brandTag: 'Mixx Style • DTECH & DELXIA'
    },
    {
      id: 'banner-yas-yellow-cyan',
      themeStyle: 'yas-yellow-cyan',
      badgeTop: 'PÔLE GESTION & COMPTABILITÉ PRATIQUE',
      titleMain: 'Pack Carrière Pro pour performer,',
      titleHighlight: 'évoluer, réussir !',
      subtextMobile: 'SYSCOHADA Révisé, SAARI Comptabilité, Déclarations OTR & SAARI Paie.',
      subtextDesktop: 'Ateliers 100% pratiques sur ordinateurs individuels en salles climatisées avec experts comptables agréés.',
      capsuleTag: 'ÉCHELONNÉ',
      capsulePrice: 'Dès 42 000 F',
      capsuleDetail: 'T-Money & Flooz',
      modelImage: togoStudentsPromoImg,
      targetCourseId: 'c9-comptabilite-informatisee',
      brandTag: 'Kozooh Style • DTECH GROUP'
    },
    {
      id: 'banner-yas-yellow-blue',
      themeStyle: 'yas-yellow-blue',
      badgeTop: '7 CENTRES DTECH AU TOGO',
      titleMain: 'Les carrières les plus solides',
      titleHighlight: 'se bâtissent avec DTECH',
      subtextMobile: 'Lomé Avédji, Kara, Avépozo, Kpalimé, Atakpamé, Sokodé, Dapaong.',
      subtextDesktop: 'Inscriptions ouvertes pour les cours du jour (08h-12h30) et cours du soir (18h30-20h30). Cohortes limitées à 25.',
      capsuleTag: 'PLACES',
      capsulePrice: '25 / Salle',
      capsuleDetail: 'Jour & Soir',
      modelImage: heroTrainingImg,
      targetCourseId: 'c9-transit-douane',
      brandTag: 'Lema Style • DELXIA'
    },
    {
      id: 'banner-tech-indigo',
      themeStyle: 'tech-indigo',
      badgeTop: 'PÔLE CRÉATION & MULTIMÉDIA',
      titleMain: 'Infographie, Audiovisuel & Dév Web',
      titleHighlight: 'pour créer sans limite !',
      subtextMobile: 'Photoshop, Illustrator, Montage Vidéo, Développement Web & Mobile.',
      subtextDesktop: 'Constituez un portfolio percutant validé par un jury de directeurs artistiques et professionnels du secteur.',
      capsuleTag: 'DIPLÔME',
      capsulePrice: 'Dès 60 000 F',
      capsuleDetail: 'Stage Garanti',
      modelImage: graphicDesignImg,
      targetCourseId: 'c9-infographie',
      brandTag: 'Tech Lab • DTECH GROUP'
    }
  ];

  // Rotation automatique
  useEffect(() => {
    if (!isAutoPlaying) return;
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, bannerSlides.length]);

  const slide = bannerSlides[currentSlide];
  const targetCourse = courses.find((c) => c.id === slide.targetCourseId) || courses[0];

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  // Support du balayage (Swipe) sur smartphones
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 40) {
      handleNext();
    } else if (distance < -40) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div 
      className="mb-6 select-none"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* En-tête informatif du Carrousel avec sélecteur de diapositives */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Affiches Officielles de Campagne • Rentrée 14 Septembre</span>
          </span>
        </div>

        {/* Commandes tactiles / desktop */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
            aria-label="Affiche précédente"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] sm:text-xs font-bold font-mono text-slate-600">
            0{currentSlide + 1} / 0{bannerSlides.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
            aria-label="Affiche suivante"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          CONTENEUR STRICTEMENT PAYSAGE (ASPECT PAYSAGE COMPACT SUR SMARTPHONE & PC)
          Mobile: Ratio compact horizontal ~ 2.1:1 à 2.4:1 (hauteur maîtrisée ~160px-185px)
          Desktop: Ratio panoramique ~ 2.8:1 à 3.2:1
         ========================================================================= */}
      <div 
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[2rem] shadow-lg border border-slate-200/80 transition-all duration-300 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* ==================================================================
            MODÈLE 1 : STYLE BLEU ROI & OR (INSPIRATION MIXX BY YAS / TOGO)
           ================================================================== */}
        {slide.themeStyle === 'mixx-blue' && (
          <div className="w-full bg-[#053c8d] text-white relative overflow-hidden flex items-stretch h-[165px] sm:h-[195px] md:h-[235px] lg:h-[260px]">
            
            {/* Arrière-plan stylisé : Carte Togo schématique */}
            <div className="absolute left-1 sm:left-4 top-2 bottom-2 w-28 sm:w-44 opacity-20 sm:opacity-30 pointer-events-none z-0">
              <svg viewBox="0 0 200 300" className="w-full h-full text-blue-300 fill-current">
                <path d="M 80,10 L 120,15 L 140,40 L 135,110 L 120,160 L 110,210 L 95,270 L 75,285 L 65,240 L 70,180 L 60,110 L 65,50 Z" opacity="0.6"/>
                <circle cx="85" cy="275" r="7" fill="#FFC700" stroke="#FFFFFF" strokeWidth="2"/>
                <circle cx="95" cy="210" r="5" fill="#FFFFFF"/>
                <circle cx="105" cy="160" r="5" fill="#FFFFFF"/>
                <circle cx="115" cy="110" r="5" fill="#FFFFFF"/>
                <circle cx="120" cy="50" r="5" fill="#FFFFFF"/>
                <path d="M 85,275 Q 70,210 95,210 Q 80,160 105,160 Q 90,110 115,110 Q 100,50 120,50" fill="none" stroke="#FFC700" strokeWidth="1.5" strokeDasharray="3,3"/>
              </svg>
            </div>

            {/* CÔTÉ GAUCHE (TEXTE & CTA) : Occupe 60% sur mobile et 65% sur desktop */}
            <div className="relative z-10 w-[63%] sm:w-[65%] lg:w-[62%] p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between">
              
              {/* Badge supérieur officiel */}
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-900/90 border border-blue-400/40 text-[9px] sm:text-[10px] md:text-xs font-black text-amber-300 tracking-wider uppercase mb-1 sm:mb-1.5 backdrop-blur-xs">
                  <ShieldCheck className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{slide.badgeTop}</span>
                </div>

                {/* Titre percutant 1-2 lignes */}
                <h2 className="text-xs sm:text-base md:text-xl lg:text-2xl font-black text-amber-300 leading-tight tracking-tight line-clamp-2 sm:line-clamp-none">
                  {slide.titleMain} <span className="text-white underline decoration-amber-400 decoration-1 sm:decoration-2 underline-offset-2">{slide.titleHighlight}</span>
                </h2>

                {/* Sous-titre adapté selon l'écran */}
                <p className="text-[9.5px] sm:text-xs md:text-sm text-blue-100 font-medium leading-tight mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                  <span className="sm:hidden">{slide.subtextMobile}</span>
                  <span className="hidden sm:inline">{slide.subtextDesktop}</span>
                </p>
              </div>

              {/* Ligne inférieure : Capsule blanche (style pack télécom) & bouton d'action */}
              <div className="flex items-center gap-1.5 sm:gap-3 pt-1">
                
                {/* Capsule Blanche (Compacte et horizontale) */}
                <div className="bg-white text-slate-900 rounded-lg sm:rounded-xl p-1 sm:p-2 shadow-md flex items-center gap-1.5 sm:gap-2.5 border border-slate-100 shrink-0">
                  <div className="bg-[#053c8d] text-white font-extrabold text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-md uppercase tracking-wider text-center leading-none">
                    {slide.capsuleTag}
                  </div>
                  <div className="pr-1">
                    <div className="text-[11px] sm:text-sm md:text-base font-black text-[#053c8d] leading-none">
                      {slide.capsulePrice}
                    </div>
                    <div className="text-[7.5px] sm:text-[9.5px] font-bold text-slate-600 mt-0.5 leading-none hidden xs:block">
                      {slide.capsuleDetail}
                    </div>
                  </div>
                </div>

                {/* Bouton d'action direct */}
                <button
                  type="button"
                  onClick={() => onEnrollCourse(targetCourse)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 text-[11px] sm:text-xs md:text-sm cursor-pointer whitespace-nowrap"
                >
                  <span>S'inscrire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>

            </div>

            {/* CÔTÉ DROIT (DÉCOUPE PHOTO ARRONDIE) : Occupe 37% à 35% */}
            <div className="relative w-[37%] sm:w-[35%] lg:w-[38%] h-full overflow-hidden flex items-center justify-center">
              <img 
                src={slide.modelImage} 
                alt="Formation DTECH GROUP"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center sm:object-right transform scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#053c8d] via-[#053c8d]/30 to-transparent"></div>

              {/* Badge Marque en bas à droite */}
              <div className="absolute bottom-1.5 right-2 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20 text-[8px] sm:text-[10px] font-black text-amber-400 uppercase tracking-wider">
                DTECH • DELXIA
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================
            MODÈLE 2 : STYLE BICOLORE JAUNE SOLAIRE & CYAN (INSPIRATION YAS KOZOOH)
           =================================================================== */}
        {slide.themeStyle === 'yas-yellow-cyan' && (
          <div className="w-full bg-[#ffc700] text-slate-950 relative overflow-hidden flex items-stretch h-[165px] sm:h-[195px] md:h-[235px] lg:h-[260px]">
            
            {/* CÔTÉ GAUCHE : Texte sur Fond Jaune Solaire */}
            <div className="relative z-10 w-[63%] sm:w-[65%] lg:w-[62%] p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between">
              
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950 text-white text-[9px] sm:text-[10px] md:text-xs font-black tracking-wider uppercase mb-1 sm:mb-1.5 shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{slide.badgeTop}</span>
                </div>

                <h2 className="text-xs sm:text-base md:text-xl lg:text-2xl font-black text-[#003882] leading-tight tracking-tight line-clamp-2 sm:line-clamp-none">
                  {slide.titleMain} <span className="text-slate-950">{slide.titleHighlight}</span>
                </h2>

                <p className="text-[9.5px] sm:text-xs md:text-sm text-slate-800 font-bold leading-tight mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                  <span className="sm:hidden">{slide.subtextMobile}</span>
                  <span className="hidden sm:inline">{slide.subtextDesktop}</span>
                </p>
              </div>

              {/* Ligne inférieure : Capsule & Bouton */}
              <div className="flex items-center gap-1.5 sm:gap-3 pt-1">
                
                <div className="bg-white text-slate-900 rounded-lg sm:rounded-xl p-1 sm:p-2 shadow-md flex items-center gap-1.5 sm:gap-2.5 border border-amber-200 shrink-0">
                  <div className="bg-[#003882] text-white font-extrabold text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-md uppercase tracking-wider text-center leading-none">
                    {slide.capsuleTag}
                  </div>
                  <div className="pr-1">
                    <div className="text-[11px] sm:text-sm md:text-base font-black text-[#003882] leading-none">
                      {slide.capsulePrice}
                    </div>
                    <div className="text-[7.5px] sm:text-[9.5px] font-bold text-slate-600 mt-0.5 leading-none hidden xs:block">
                      {slide.capsuleDetail}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onEnrollCourse(targetCourse)}
                  className="bg-[#003882] hover:bg-[#00285e] text-white font-black px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 text-[11px] sm:text-xs md:text-sm cursor-pointer whitespace-nowrap"
                >
                  <span>Rejoindre</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>

            </div>

            {/* CÔTÉ DROIT : Découpe arrondie cyan avec apprenants */}
            <div className="relative w-[37%] sm:w-[35%] lg:w-[38%] h-full bg-[#0084c7] overflow-hidden flex items-center justify-center rounded-l-[30px] sm:rounded-l-[60px]">
              <img 
                src={slide.modelImage} 
                alt="Étudiants DTECH"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0084c7]/40 via-transparent to-black/20"></div>

              <div className="absolute bottom-1.5 right-2 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20 text-[8px] sm:text-[10px] font-black text-amber-400 uppercase tracking-wider">
                DTECH GROUP
              </div>
            </div>

          </div>
        )}

        {/* ==================================================================
            MODÈLE 3 : STYLE BICOLORE JAUNE & INDIGO (INSPIRATION YAS LEMA 1000+)
           ================================================================== */}
        {slide.themeStyle === 'yas-yellow-blue' && (
          <div className="w-full bg-[#ffc700] text-slate-950 relative overflow-hidden flex items-stretch h-[165px] sm:h-[195px] md:h-[235px] lg:h-[260px]">
            
            {/* CÔTÉ GAUCHE */}
            <div className="relative z-10 w-[63%] sm:w-[65%] lg:w-[62%] p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between">
              
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0a2558] text-amber-300 text-[9px] sm:text-[10px] md:text-xs font-black tracking-wider uppercase mb-1 sm:mb-1.5 shadow-2xs">
                  <MapPin className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{slide.badgeTop}</span>
                </div>

                <h2 className="text-xs sm:text-base md:text-xl lg:text-2xl font-black text-[#0a2558] leading-tight tracking-tight line-clamp-2 sm:line-clamp-none">
                  {slide.titleMain} <span className="text-slate-950 underline decoration-[#0a2558] decoration-1 sm:decoration-2 underline-offset-2">{slide.titleHighlight}</span>
                </h2>

                <p className="text-[9.5px] sm:text-xs md:text-sm text-slate-800 font-extrabold leading-tight mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                  <span className="sm:hidden">{slide.subtextMobile}</span>
                  <span className="hidden sm:inline">{slide.subtextDesktop}</span>
                </p>
              </div>

              {/* Ligne inférieure */}
              <div className="flex items-center gap-1.5 sm:gap-3 pt-1">
                
                <div className="bg-white text-slate-900 rounded-lg sm:rounded-xl p-1 sm:p-2 shadow-md flex items-center gap-1.5 sm:gap-2.5 border border-amber-200 shrink-0">
                  <div className="bg-[#0a2558] text-amber-400 font-extrabold text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-md uppercase tracking-wider text-center leading-none">
                    {slide.capsuleTag}
                  </div>
                  <div className="pr-1">
                    <div className="text-[11px] sm:text-sm md:text-base font-black text-[#0a2558] leading-none">
                      {slide.capsulePrice}
                    </div>
                    <div className="text-[7.5px] sm:text-[9.5px] font-bold text-slate-600 mt-0.5 leading-none hidden xs:block">
                      {slide.capsuleDetail}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onEnrollCourse(targetCourse)}
                  className="bg-[#0a2558] hover:bg-[#06183b] text-white font-black px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 text-[11px] sm:text-xs md:text-sm cursor-pointer whitespace-nowrap"
                >
                  <span>Réserver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>

            </div>

            {/* CÔTÉ DROIT : Découpe arrondie indigo */}
            <div className="relative w-[37%] sm:w-[35%] lg:w-[38%] h-full bg-[#0a2558] overflow-hidden flex items-center justify-center rounded-l-[30px] sm:rounded-l-[60px]">
              <img 
                src={slide.modelImage} 
                alt="Campus DTECH"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform scale-105 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a2558]/60 via-transparent to-black/20"></div>

              <div className="absolute bottom-1.5 right-2 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20 text-[8px] sm:text-[10px] font-black text-amber-400 uppercase tracking-wider">
                7 CENTRES TOGO
              </div>
            </div>

          </div>
        )}

        {/* ==========================================================
            MODÈLE 4 : STYLE CRÉATIF TECH / INDIGO & AMBRE
           ========================================================== */}
        {slide.themeStyle === 'tech-indigo' && (
          <div className="w-full bg-[#181145] text-white relative overflow-hidden flex items-stretch h-[165px] sm:h-[195px] md:h-[235px] lg:h-[260px]">
            
            {/* CÔTÉ GAUCHE */}
            <div className="relative z-10 w-[63%] sm:w-[65%] lg:w-[62%] p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between">
              
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/90 border border-purple-400/40 text-[9px] sm:text-[10px] md:text-xs font-black text-amber-300 tracking-wider uppercase mb-1 sm:mb-1.5 backdrop-blur-xs">
                  <Laptop className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{slide.badgeTop}</span>
                </div>

                <h2 className="text-xs sm:text-base md:text-xl lg:text-2xl font-black text-amber-300 leading-tight tracking-tight line-clamp-2 sm:line-clamp-none">
                  {slide.titleMain} <span className="text-white">{slide.titleHighlight}</span>
                </h2>

                <p className="text-[9.5px] sm:text-xs md:text-sm text-purple-100 font-medium leading-tight mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                  <span className="sm:hidden">{slide.subtextMobile}</span>
                  <span className="hidden sm:inline">{slide.subtextDesktop}</span>
                </p>
              </div>

              {/* Ligne inférieure */}
              <div className="flex items-center gap-1.5 sm:gap-3 pt-1">
                
                <div className="bg-white text-slate-900 rounded-lg sm:rounded-xl p-1 sm:p-2 shadow-md flex items-center gap-1.5 sm:gap-2.5 border border-slate-100 shrink-0">
                  <div className="bg-[#181145] text-amber-400 font-extrabold text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-md uppercase tracking-wider text-center leading-none">
                    {slide.capsuleTag}
                  </div>
                  <div className="pr-1">
                    <div className="text-[11px] sm:text-sm md:text-base font-black text-[#181145] leading-none">
                      {slide.capsulePrice}
                    </div>
                    <div className="text-[7.5px] sm:text-[9.5px] font-bold text-slate-600 mt-0.5 leading-none hidden xs:block">
                      {slide.capsuleDetail}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onEnrollCourse(targetCourse)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 text-[11px] sm:text-xs md:text-sm cursor-pointer whitespace-nowrap"
                >
                  <span>S'inscrire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>

            </div>

            {/* CÔTÉ DROIT */}
            <div className="relative w-[37%] sm:w-[35%] lg:w-[38%] h-full overflow-hidden flex items-center justify-center">
              <img 
                src={slide.modelImage} 
                alt="Studio Infographie DTECH"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#181145] via-[#181145]/40 to-transparent"></div>

              <div className="absolute bottom-1.5 right-2 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20 text-[8px] sm:text-[10px] font-black text-amber-400 uppercase tracking-wider">
                DIGITAL LAB
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Puces de navigation discrètes et interactives */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {bannerSlides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentSlide(idx);
            }}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === idx 
                ? 'w-6 sm:w-8 bg-amber-500 shadow-2xs' 
                : 'w-1.5 sm:w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Afficher la diapositive ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
};
