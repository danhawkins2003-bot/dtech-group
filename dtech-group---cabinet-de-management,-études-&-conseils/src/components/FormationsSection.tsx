import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  Award, 
  Check, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { FORMATIONS_CATALOG } from '../data/dtechData';
import { Formation } from '../types';

interface FormationsSectionProps {
  onRegisterFormation: (formation: Formation) => void;
}

export const FormationsSection: React.FC<FormationsSectionProps> = ({ onRegisterFormation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [activeFormationDetails, setActiveFormationDetails] = useState<Formation | null>(null);

  const categories = [
    { id: 'all', label: 'Toutes les formations' },
    { id: 'finance', label: 'Comptabilité & Fiscalité' },
    { id: 'project', label: 'Gestion de Projets' },
    { id: 'digital', label: 'Data & Power BI' },
    { id: 'management', label: 'Management & Leadership' },
    { id: 'hr', label: 'Ressources Humaines & Paie' },
  ];

  const filteredFormations = useMemo(() => {
    return FORMATIONS_CATALOG.filter((formation) => {
      const matchCategory = selectedCategory === 'all' || formation.category === selectedCategory;
      const matchSearch = 
        formation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formation.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchLocation = 
        selectedLocation === 'all' ||
        (selectedLocation === 'lome' && formation.modalite.includes('Lomé')) ||
        (selectedLocation === 'kara' && formation.modalite.includes('Kara')) ||
        (selectedLocation === 'online' && (formation.modalite.includes('Ligne') || formation.modalite.includes('Hybride')));

      return matchCategory && matchSearch && matchLocation;
    });
  }, [searchQuery, selectedCategory, selectedLocation]);

  return (
    <section id="formations" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
            Pôle Formation DTECH GROUP
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            Catalogue des Formations Professionnelles & Certifiantes
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Des programmes 100% pratiques animés par des professionnels en activité dans nos centres de Lomé et Kara ainsi qu'en distanciel.
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-8 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-formation-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par mot-clé (ex: Sage, SYSCOHADA, Power BI, Projet...)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            {/* Location Selector */}
            <div className="md:col-span-4">
              <select
                id="filter-formation-location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 cursor-pointer"
              >
                <option value="all">Tous les centres (Lomé, Kara, En Ligne)</option>
                <option value="lome">Centre de Lomé (Siège)</option>
                <option value="kara">Centre de Kara (Nord)</option>
                <option value="online">En Ligne / Hybride</option>
              </select>
            </div>

          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>{filteredFormations.length} formation(s) disponible(s)</span>
          <span className="text-emerald-700 font-medium">Attestation & Certificat délivrés en fin de cursus</span>
        </div>

        {/* Formation Cards Grid */}
        {filteredFormations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Aucune formation ne correspond à vos critères</h3>
            <p className="text-sm text-slate-500">Essayez de modifier votre recherche ou réinitialisez les filtres.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedLocation('all'); }}
              className="mt-2 text-xs font-semibold text-blue-700 underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormations.map((formation) => (
              <div
                key={formation.id}
                id={`formation-card-${formation.id}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="p-6 space-y-4">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                      {formation.categoryLabel}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {formation.price}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {formation.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {formation.description}
                  </p>

                  {/* Meta Tags */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formation.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-medium text-slate-700">{formation.modalite}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Prochaine session : <strong className="text-slate-800">{formation.sessions[0]}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Footer Card Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    id={`view-details-${formation.id}`}
                    onClick={() => setActiveFormationDetails(formation)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    Détails du cursus
                  </button>

                  <button
                    id={`register-btn-${formation.id}`}
                    onClick={() => onRegisterFormation(formation)}
                    className="text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>S'inscrire</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for detailed curriculum */}
        {activeFormationDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
              
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {activeFormationDetails.categoryLabel}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    {activeFormationDetails.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveFormationDetails(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <div className="text-slate-400 font-medium">Durée</div>
                  <div className="font-bold text-slate-800">{activeFormationDetails.duration}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Lieu / Modalité</div>
                  <div className="font-bold text-slate-800">{activeFormationDetails.modalite}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Niveau</div>
                  <div className="font-bold text-slate-800">{activeFormationDetails.level}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Frais de formation</div>
                  <div className="font-bold text-emerald-700">{activeFormationDetails.price}</div>
                </div>
              </div>

              {/* Objectives */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">Objectifs pédagogiques :</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {activeFormationDetails.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modules Curriculum */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">Programme détaillé :</h4>
                <div className="space-y-1.5">
                  {activeFormationDetails.modules.map((mod, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      {mod}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites & Certification */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1 text-slate-700">
                <div><strong>Prérequis :</strong> {activeFormationDetails.prerequisites}</div>
                <div><strong>Certification :</strong> {activeFormationDetails.certificate}</div>
                <div><strong>Sessions programmées :</strong> {activeFormationDetails.sessions.join(' | ')}</div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveFormationDetails(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    const f = activeFormationDetails;
                    setActiveFormationDetails(null);
                    onRegisterFormation(f);
                  }}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow transition-colors cursor-pointer"
                >
                  Réserver ma place pour cette session
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
