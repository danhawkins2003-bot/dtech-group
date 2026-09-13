import React, { useState } from 'react';
import { PlatformCourse } from '../types';
import { 
  BookOpen, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Award, 
  CheckCircle2, 
  Filter, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  LayoutGrid, 
  QrCode,
  Tag,
  Layers,
  Bot
} from 'lucide-react';
import { CatalogHeroBanners } from './CatalogHeroBanners';
import { RegistrationCountdownBanner } from './RegistrationCountdownBanner';

interface CourseCatalogSectionProps {
  courses: PlatformCourse[];
  onSelectCourseForDetail: (course: PlatformCourse) => void;
  onEnrollCourse: (course: PlatformCourse) => void;
  searchQuery: string;
}

export const is9MonthsCourse = (c: PlatformCourse) => {
  if (c.id && c.id.startsWith('c9-')) return true;
  const pt = (c.programType || '').toLowerCase();
  const dw = (c.durationWeeks || '').toLowerCase();
  if (pt.includes('9') || dw.includes('9')) return true;
  if (pt.includes('diplôme') || pt.includes('diplome') || pt.includes('etat') || pt.includes('état')) return true;
  return false;
};

export const is3MonthsCourse = (c: PlatformCourse) => {
  if (c.id && c.id.startsWith('c3-')) return true;
  if (is9MonthsCourse(c)) return false;
  const pt = (c.programType || '').toLowerCase();
  const dw = (c.durationWeeks || '').toLowerCase();
  return pt.includes('3') || dw.includes('3') || pt.includes('pratique') || dw.includes('pratique');
};

export const CourseCatalogSection: React.FC<CourseCatalogSectionProps> = ({
  courses,
  onSelectCourseForDetail,
  onEnrollCourse,
  searchQuery
}) => {
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const durationOptions = [
    { id: 'all', label: 'Toutes les formules', count: courses.length },
    { id: '9-months', label: '09 Mois + 3 Mois de Stage (Diplôme d’État)', count: courses.filter(is9MonthsCourse).length },
    { id: '3-months', label: '03 Mois en Stage Pratique (100% Pratique)', count: courses.filter(is3MonthsCourse).length }
  ];

  const categories = [
    { id: 'all', label: 'Toutes les filières' },
    { id: 'Informatique & Web', label: 'Informatique & Dev' },
    { id: 'Réseaux & Maintenance', label: 'Maintenance & Réseaux' },
    { id: 'Design & Infographie', label: 'Design & Infographie' },
    { id: 'Gestion & Comptabilité', label: 'Comptabilité & Caisse' },
    { id: 'Santé & Médical', label: 'Santé & Médical' },
    { id: 'Petite Enfance & Éducation', label: 'Petite Enfance' },
    { id: 'Commerce & Transit', label: 'Transit & Stocks' },
    { id: 'Marketing & Digital', label: 'Marketing & Digital' },
    { id: 'Management & Projets', label: 'Management & Projets' },
    { id: 'Ressources Humaines', label: 'RH & Paie' },
    { id: 'Banque & Microfinance', label: 'Banque & Microfinance' },
    { id: 'Langues & Communication', label: 'Anglais & Langues' },
    { id: 'Administration & Collectivités', label: 'Administration' }
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesDuration = 
      selectedDuration === 'all' || 
      (selectedDuration === '9-months' && is9MonthsCourse(c)) ||
      (selectedDuration === '3-months' && is3MonthsCourse(c)) ||
      (selectedDuration === '09 mois + 3 mois de stage' && is9MonthsCourse(c)) ||
      (selectedDuration === '03 mois en stage de formation pratique' && is3MonthsCourse(c)) ||
      c.programType === selectedDuration;
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDuration && matchesCategory && matchesSearch;
  });

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Carrousel & Bannières Officielles de Campagne DTECH GROUP */}
        <CatalogHeroBanners
          courses={courses}
          onEnrollCourse={onEnrollCourse}
        />

        {/* Compte à rebours visuel d'urgence pour la rentrée solennelle du 14 Septembre 2026 */}
        <RegistrationCountdownBanner
          courses={courses}
          onEnrollCourse={onEnrollCourse}
        />

        {/* Barre de Contrôles : Formule (9 Mois vs 3 Mois), Filtres par filière & Sélecteur de Mode d'Affichage */}
        <div className="bg-white border border-slate-200 p-4 mb-6 flex flex-col gap-4 shadow-2xs">
          
          {/* Onglets des Formules Officielles DTECH */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider mr-1">
                Formule :
              </span>
              {durationOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDuration(opt.id)}
                  className={`px-3 py-1.5 text-xs font-bold transition-all rounded-none border ${
                    selectedDuration === opt.id
                      ? 'bg-blue-900 border-blue-900 text-white shadow-xs ring-2 ring-blue-900/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Filtres de catégorie / filière */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filière :</span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-700 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* CONTENU : Si aucune formation ne correspond */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white border border-slate-200 p-10 text-center text-slate-500 shadow-2xs">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Aucune formation ne correspond à vos critères</h3>
            <p className="text-xs text-slate-500 mt-1">Modifiez vos mots-clés ou réinitialisez le filtre de filière.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedDuration('all');
                setSelectedCategory('all');
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 transition-colors shadow-xs"
            >
              Afficher toutes les formations
            </button>
          </div>
        ) : (
          
          /* MODE : VUE CARTES ULTRA-COMPACTES & ÉLÉGANTES */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const is9M = is9MonthsCourse(course);
              const totalRemainingSeats = course.sessions.reduce((acc, s) => acc + s.availableSeats, 0);

              return (
                <div 
                  key={course.id}
                  className="bg-white border border-slate-200 flex flex-col justify-between hover:border-blue-600 transition-all shadow-xs hover:shadow-md relative group overflow-hidden"
                >
                  {/* Bannière Photo Réduite (~100px-110px de haut pour compacité maximale) */}
                  <div className="relative h-28 sm:h-32 overflow-hidden bg-slate-950 border-b border-slate-200">
                    {course.imageUrl && (
                      <img 
                        src={course.imageUrl} 
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                    
                    {/* Badge Filière */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                      <span className="text-[10px] font-bold text-white bg-blue-900/90 backdrop-blur-xs px-2 py-0.5 uppercase tracking-wider shadow-xs">
                        {course.category}
                      </span>
                    </div>

                    {/* Tagline en bas de la photo */}
                    <div className="absolute bottom-1.5 left-2 right-2 z-10">
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-wide line-clamp-1 drop-shadow-xs">
                        {course.posterTagline || "FORMATION PROFESSIONNELLE DTECH"}
                      </span>
                    </div>
                  </div>

                  {/* Corps de la carte compact */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between border-b border-slate-100">
                    <div>
                      {/* Badge unique de Formule */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 border ${
                          is9M
                            ? 'bg-blue-50 text-blue-900 border-blue-200'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        }`}>
                          {is9M ? '09 Mois + 3 Mois Stage' : '03 Mois Stage Pratique'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Rentrée 14 Sept.
                        </span>
                      </div>

                      {/* Titre */}
                      <h3 
                        className="font-black text-slate-900 text-sm sm:text-[15px] leading-snug mb-1.5 hover:text-blue-700 cursor-pointer line-clamp-1"
                        onClick={() => onSelectCourseForDetail(course)}
                        title={course.title}
                      >
                        {course.title}
                      </h3>

                      {/* Description condensée (2 lignes max) */}
                      <p className="text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed mb-2">
                        {course.description}
                      </p>
                    </div>

                    {/* Grille Logistique Compacte 2x2 */}
                    <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 border border-slate-200 text-[10.5px] text-slate-700 rounded-none mb-1">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-blue-700 shrink-0" />
                        <span className="truncate font-semibold">7 Centres TG</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate font-semibold">Jour & Soir</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <Users className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate font-bold text-emerald-700">{totalRemainingSeats} places</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <Award className="w-3 h-3 text-purple-700 shrink-0" />
                        <span className="truncate font-semibold">{is9M ? "Diplôme d'État" : "Certificat Pro"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pied de Carte : Prix & Boutons compacts et bien calibrés */}
                  <div className="p-3 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-500 uppercase font-semibold block leading-tight truncate">
                        Scolarité : <strong className="text-slate-800 font-bold">{course.priceFCFA.toLocaleString('fr-FR')} F</strong>
                      </span>
                      <span className="text-xs sm:text-sm font-black text-blue-900 leading-tight block mt-0.5 whitespace-nowrap">
                        Inscription : 5 000 <span className="text-[9px] font-bold text-slate-500">FCFA</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectCourseForDetail(course)}
                        className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold py-1.5 px-2 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Programme
                      </button>

                      <button
                        type="button"
                        onClick={() => onEnrollCourse(course)}
                        className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-black py-1.5 px-2.5 transition-colors flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        <span>S'inscrire</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Section Méthodologie Professionnelle */}
        <div className="mt-12 bg-white border border-slate-200 p-6 md:p-8">
          <div className="max-w-3xl mb-6">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
              L'Excellence Pédagogique DTECH GROUP au Togo
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Tous nos cycles de formation respectent une charte stricte de professionnalisation :
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                80% de Pratique
              </div>
              <p className="text-slate-600 leading-relaxed">
                Apprentissage direct sur cas d'entreprises togolaises, logiciels récents et manipulation continue.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 text-sm flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-700" />
                Certificat Authentifié
              </div>
              <p className="text-slate-600 leading-relaxed">
                Chaque certificat délivré possède un numéro unique vérifiable instantanément en ligne par les recruteurs.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-700" />
                Accès LMS Permanent
              </div>
              <p className="text-slate-600 leading-relaxed">
                Supports PDF téléchargeables, exercices corrigés et vidéos consultables 24h/24 depuis votre espace étudiant.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-700" />
                7 Centres au Togo
              </div>
              <p className="text-slate-600 leading-relaxed">
                Salles climatisées équipées d'ordinateurs, vidéo-projecteurs et connexion internet haut débit.
              </p>
            </div>
          </div>
        </div>

        {/* Bannière d'Orientation & Assistant Pédagogique */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 border border-blue-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>Assistance & Orientation Pédagogique</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Hésitant sur la formation certifiante adaptée à votre carrière ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consultez notre <strong>Conseiller Pédagogique Principal (M. Koffi MENSAH)</strong> pour obtenir une recommandation sur-mesure basée sur votre profil, vos objectifs professionnels au Togo et les facilités de paiement par T-Money ou Flooz.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#/assistant-ia';
              }}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-slate-950" />
              <span>Consulter le Conseiller Pédagogique</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
