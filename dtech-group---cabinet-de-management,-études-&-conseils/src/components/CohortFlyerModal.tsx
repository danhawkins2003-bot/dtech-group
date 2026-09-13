import React, { useState } from 'react';
import { PlatformCourse } from '../types';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  Sparkles,
  Layout,
  Smartphone,
  Flame,
  Check
} from 'lucide-react';
import { 
  DTECH_INSTITUTIONAL_DATA,
  togoStudentsPromoImg,
  togoGraduateSuccessImg
} from '../data/dtechPlatformData';

interface CohortFlyerModalProps {
  course: PlatformCourse;
  onClose: () => void;
  onEnroll: (course: PlatformCourse) => void;
}

export const CohortFlyerModal: React.FC<CohortFlyerModalProps> = ({
  course,
  onClose,
  onEnroll
}) => {
  // Mode de prévisualisation : 'panoramic' (bannière télécom arrondie moderne comme les images envoyées) ou 'a4' (dossier A4)
  const [displayFormat, setDisplayFormat] = useState<'panoramic' | 'a4'>('panoramic');

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `📢 *FORMATION DTECH GROUP TOGO & INSTITUT SUPÉRIEUR DELXIA*\n*AGRÉMENT N° 003 / METFP / CAB / SE-CPO*\n\n🎓 *${course.title}*\n⏳ Formule : 9 MOIS DE FORMATION + 3 MOIS DE STAGES EN ENTREPRISE GARANTIS\n🗓️ Rentrée Solennelle : 14 SEPTEMBRE 2026\n📍 7 Centres : Lomé Avédji, Avépozo, Kpalimé, Atakpamé, Sokodé, Kara, Dapaong\n💰 Tarif : ${course.priceFCFA.toLocaleString('fr-FR')} FCFA (Échelonné 60% / 40%)\n\nValidation T-Money (*145#) & Flooz (*155#) : (+228) 92 89 89 79`;
    navigator.clipboard?.writeText(text);
    alert('Informations de l\'affiche officielle copiées ! Vous pouvez les coller sur WhatsApp ou vos réseaux sociaux.');
  };

  const handleDownload = () => {
    alert(`Téléchargement de l'affiche officielle "${course.title}" au format ${displayFormat === 'panoramic' ? 'Bannière Panoramique' : 'A4 Imprimable'} généré avec succès !`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl text-slate-100 shadow-2xl flex flex-col my-auto max-h-[94vh] rounded-2xl overflow-hidden">
        
        {/* Barre d'actions supérieure */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
              AFFICHE OFFICIELLE • RENTRÉE 14 SEPTEMBRE 2026
            </span>
            <span className="text-slate-300 font-semibold hidden md:inline">• {course.title}</span>
          </div>

          {/* Sélecteur de forme d'affiche & actions */}
          <div className="flex items-center gap-2">
            
            {/* Toggle de Format */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setDisplayFormat('panoramic')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  displayFormat === 'panoramic' 
                    ? 'bg-amber-400 text-slate-950 shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Bannière Panoramique</span>
              </button>

              <button
                type="button"
                onClick={() => setDisplayFormat('a4')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  displayFormat === 'a4' 
                    ? 'bg-amber-400 text-slate-950 shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Format A4</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
              title="Partager sur WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
              title="Télécharger l'affiche"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Télécharger HD</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
              title="Imprimer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corps de la modale avec défilement */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center items-center">
          
          {/* =========================================================================
              FORMAT 1 : BANNIÈRE PANORAMIQUE ARRONDIE (EXACTEMENT LA FORME DEMANDÉE)
             ========================================================================= */}
          {displayFormat === 'panoramic' ? (
            <div className="w-full max-w-4xl">
              
              {/* Carte Bannière Publicitaire Panoramique avec coins très arrondis */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[2.2rem] bg-[#ffc700] text-slate-950 shadow-2xl border-2 sm:border-4 border-amber-300/80 flex items-stretch min-h-[190px] sm:min-h-[260px] md:min-h-[300px]">
                
                {/* Contenu textuel sur fond jaune solaire percutant (Occupe ~62% sur mobile) */}
                <div className="relative z-10 w-[63%] sm:w-[65%] lg:w-[60%] p-3.5 sm:p-5 md:p-6 flex flex-col justify-between">
                  
                  <div>
                    {/* Badge supérieur */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[8.5px] sm:text-[10px] md:text-xs font-black tracking-wide uppercase shadow-2xs">
                        <ShieldCheck className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{DTECH_INSTITUTIONAL_DATA.accreditationNumber}</span>
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-900 text-white text-[10px] font-bold">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        7 Centres Togo
                      </span>
                    </div>

                    {/* Titre percutant en bleu roi foncé */}
                    <h2 className="text-xs sm:text-base md:text-xl lg:text-2xl font-black text-[#003882] leading-tight tracking-tight line-clamp-2">
                      {course.title}
                    </h2>
                    
                    <p className="text-[9.5px] sm:text-xs md:text-sm font-bold text-slate-900 leading-tight mt-0.5 line-clamp-1 sm:line-clamp-2">
                      <span className="text-[#003882] font-black underline decoration-amber-500 underline-offset-1">
                        {course.durationWeeks || (course.id?.startsWith('c9-') ? '09 Mois + 3 Mois de Stage' : '03 Mois en Stage Pratique')}
                      </span>
                    </p>
                  </div>

                  {/* Capsule Blanche Arrondie (Style Pack Télécom / Forfait) */}
                  <div className="flex items-center gap-1.5 sm:gap-3 pt-1">
                    
                    <div className="bg-white text-slate-900 rounded-lg sm:rounded-xl p-1 sm:p-1.5 shadow-md flex items-center gap-1.5 sm:gap-2 border border-amber-200 shrink-0">
                      <div className="bg-[#003882] text-white font-extrabold text-[8px] sm:text-[9.5px] px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider text-center leading-none">
                        14 SEPT
                      </div>
                      <div className="pr-1">
                        <div className="text-[11px] sm:text-sm md:text-base font-black text-[#003882] leading-none">
                          {course.priceFCFA.toLocaleString('fr-FR')} <span className="text-[8px] sm:text-[10px]">F</span>
                        </div>
                        <div className="text-[7.5px] sm:text-[8.5px] font-extrabold text-emerald-700 mt-0.5 leading-none hidden xs:block">
                          60% / 40%
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEnroll(course);
                      }}
                      className="bg-[#003882] hover:bg-[#002b66] text-white font-black px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-xs transition-all transform active:scale-95 flex items-center gap-1 text-[10px] sm:text-xs cursor-pointer whitespace-nowrap"
                    >
                      <span>S'inscrire</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>

                  </div>

                </div>

                {/* Découpe courbe bleue nuit / cyan sur la droite avec la photo (~37% sur mobile) */}
                <div className="relative w-[37%] sm:w-[35%] lg:w-[40%] h-full bg-[#0047ba] overflow-hidden flex items-center justify-end rounded-l-[30px] sm:rounded-l-[80px]">
                  <img 
                    src={course.imageUrl || togoStudentsPromoImg} 
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transform scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0047ba]/60 via-transparent to-black/20"></div>

                  <div className="absolute bottom-1.5 right-2 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20 text-[8px] sm:text-[9px] font-black text-amber-400 uppercase tracking-wider">
                    DTECH GROUP
                  </div>
                </div>

              </div>

              {/* Note d'affichage pour l'utilisateur */}
              <p className="text-center text-[11px] text-slate-400 mt-2">
                ✦ Format paysage panoramique officiel DTECH & DELXIA • Partageable sur WhatsApp & Réseaux Sociaux.
              </p>

            </div>
          ) : (
            /* =========================================================================
                FORMAT 2 : AFFICHE A4 IMPRIMABLE CLASSIQUE (COMPACTE & COMPLÈTE)
               ========================================================================= */
            <div className="w-full max-w-xl bg-white text-slate-900 border-2 border-slate-900 shadow-xl p-3.5 sm:p-4 relative rounded-xl text-xs">
              
              {/* Ruban Header Institutionnel DTECH GROUP & DELXIA */}
              <div className="border-b-2 border-slate-900 pb-2 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 text-white flex flex-col items-center justify-center font-extrabold border-2 border-amber-400 shadow-xs shrink-0">
                    <span className="text-xs tracking-tighter leading-none">DTECH</span>
                    <span className="text-[5px] text-amber-400 tracking-widest uppercase">GROUP</span>
                  </div>
                  <div>
                    <h1 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      CABINET DTECH GROUP & {DTECH_INSTITUTIONAL_DATA.partner}
                    </h1>
                    <p className="text-[8.5px] font-bold text-blue-900 uppercase tracking-wider">
                      {DTECH_INSTITUTIONAL_DATA.accreditationNumber} • Diplômes d'État Reconnus
                    </p>
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-start sm:items-end justify-between">
                  <span className="inline-block bg-amber-400 text-slate-950 text-[8.5px] font-black px-2 py-0.5 uppercase tracking-wide">
                    RENTREE : 14 SEPTEMBRE 2026
                  </span>
                  <span className="text-[8.5px] font-bold text-blue-800 mt-0.5">
                    {course.durationWeeks}
                  </span>
                </div>
              </div>

              {/* Titre Principal, Photo & Tagline de l'Affiche */}
              <div className="bg-slate-900 text-white mb-2 border-l-4 border-amber-400 overflow-hidden relative rounded-lg">
                <div className="p-2.5 sm:p-3 relative z-10 bg-slate-900/95 flex items-center justify-between gap-2.5">
                  <div className="flex-1">
                    <div className="text-[8.5px] font-bold text-amber-400 uppercase tracking-widest mb-0.5">
                      {course.posterTagline || 'FILIÈRE PROFESSIONNELLE RECONNUE'}
                    </div>
                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white leading-tight">
                      {course.title}
                    </h2>
                    <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-2 leading-tight">
                      {course.description}
                    </p>
                  </div>
                  {course.imageUrl && (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 border border-slate-700 shadow-xs hidden xs:block">
                      <img 
                        src={course.imageUrl} 
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Outils & Technologies abordés (Stack) */}
              {course.toolsStack && course.toolsStack.length > 0 && (
                <div className="mb-2 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md flex flex-wrap items-center gap-1">
                  <span className="text-[8.5px] font-bold uppercase text-slate-700 mr-1">
                    Outils :
                  </span>
                  {course.toolsStack.map((tool, idx) => (
                    <span 
                      key={idx} 
                      className="bg-white border border-slate-300 text-slate-900 text-[9.5px] font-bold px-1.5 py-0.2 shadow-2xs rounded"
                    >
                      ✓ {tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Grille : Programme & Avantages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 text-xs">
                <div className="border border-slate-200 p-2 bg-slate-50/50 rounded-lg">
                  <h3 className="font-bold text-slate-900 uppercase text-[9.5px] mb-1 flex items-center gap-1 border-b border-slate-200 pb-0.5">
                    <CheckCircle2 className="w-3 h-3 text-blue-700" />
                    Programme Clé
                  </h3>
                  <ul className="space-y-0.5 text-[9.5px] text-slate-700">
                    {course.modules.slice(0, 3).map((mod, mIdx) => (
                      <li key={mIdx} className="leading-tight">
                        • <strong>{mod.title.split(':')[0]}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-slate-200 p-2 bg-slate-50/50 rounded-lg">
                  <h3 className="font-bold text-slate-900 uppercase text-[9.5px] mb-1 flex items-center gap-1 border-b border-slate-200 pb-0.5">
                    <Award className="w-3 h-3 text-amber-600" />
                    Diplôme & Insertion
                  </h3>
                  <ul className="space-y-0.5 text-[9.5px] text-slate-700">
                    <li>• <strong>Diplôme :</strong> {course.certificationTitle}</li>
                    <li>• <strong>Stage :</strong> Entreprises partenaires Togo</li>
                    <li>• <strong>Horaires :</strong> Jour & Soir</li>
                  </ul>
                </div>
              </div>

              {/* Bannière Logistique : 7 Centres Nationaux & Frais */}
              <div className="bg-slate-100 border border-slate-300 p-2 mb-2 rounded-lg">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
                  <div className="border-r border-slate-300 last:border-0 pr-1">
                    <div className="text-[8px] text-slate-500 uppercase font-semibold">Formule</div>
                    <div className="text-[10px] font-black text-slate-900 mt-0.5">{course.durationWeeks}</div>
                  </div>

                  <div className="border-r border-slate-300 last:border-0 pr-1">
                    <div className="text-[8px] text-slate-500 uppercase font-semibold">Rentrée</div>
                    <div className="text-[10px] font-bold text-slate-900 mt-0.5">14 Sept. 2026</div>
                  </div>

                  <div className="border-r border-slate-300 last:border-0 pr-1">
                    <div className="text-[8px] text-slate-500 uppercase font-semibold">Réseau</div>
                    <div className="text-[10px] font-bold text-blue-900 mt-0.5">7 Centres Togo</div>
                  </div>

                  <div>
                    <div className="text-[8px] text-slate-500 uppercase font-semibold">Tarif Formation</div>
                    <div className="text-[11px] font-black text-blue-950 mt-0.5">
                      {course.priceFCFA.toLocaleString('fr-FR')} <span className="text-[8px]">FCFA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pied de l'Affiche : 7 Centres & Infoline */}
              <div className="border-t border-slate-900 pt-1.5 flex flex-col sm:flex-row items-center justify-between gap-1.5">
                <div className="space-y-0.5 text-[8.5px] text-slate-700 flex-1">
                  <div className="font-bold text-slate-900 uppercase text-[8px]">
                    Infoline 7 Centres DTECH GROUP :
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px]">
                    <span>• <strong>Lomé Avédji :</strong> (+228) 92 89 89 79</span>
                    <span>• <strong>Avépozo :</strong> (+228) 98 82 82 16</span>
                    <span>• <strong>Kpalimé :</strong> (+228) 90 53 57 57</span>
                    <span>• <strong>Atakpamé :</strong> (+228) 70 16 01 01</span>
                    <span>• <strong>Sokodé :</strong> (+228) 93 49 85 85</span>
                    <span>• <strong>Kara :</strong> (+228) 90 18 40 78</span>
                    <span className="col-span-2">• <strong>Dapaong :</strong> (+228) 92 67 77 90</span>
                  </div>
                </div>

                {/* Sceau Officiel et QR Code */}
                <div className="shrink-0 flex items-center gap-1 bg-slate-50 border border-slate-300 p-1 rounded">
                  <div className="w-7 h-7 bg-white border border-slate-300 flex flex-col items-center justify-center p-0.5 text-center">
                    <QrCode className="w-5 h-5 text-slate-800" />
                  </div>
                  <div className="text-right text-[6.5px]">
                    <div className="font-extrabold text-blue-900 uppercase">
                      MINISTÈRE METFP
                    </div>
                    <div className="text-slate-500 uppercase">
                      AGRÉMENT OFFICIEL
                    </div>
                    <div className="font-serif italic text-slate-700">
                      Visa 2026
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Barre d'action inférieure de la modale */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Frais de session : <strong className="text-white text-sm">{course.priceFCFA.toLocaleString('fr-FR')} FCFA</strong> • Échelonnement : 60% à l'inscription, 40% au 5ème mois
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors text-center cursor-pointer"
            >
              Fermer l'affiche
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEnroll(course);
              }}
              className="w-1/2 sm:w-auto bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <span>S'inscrire à cette formation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
