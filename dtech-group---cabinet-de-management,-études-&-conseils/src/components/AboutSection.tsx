import React from 'react';
import { 
  Building2, 
  Target, 
  Award, 
  ShieldCheck, 
  Users, 
  Compass, 
  CheckCircle, 
  MapPin,
  Briefcase
} from 'lucide-react';
import { DTECH_INFO, REGIONAL_POINTS } from '../data/dtechData';

export const AboutSection: React.FC = () => {
  return (
    <section id="a-propos" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
            Qui Sommes-Nous
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            DTECH GROUP : L'Excellence Managériale au Cœur du Togo
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Un cabinet pluridisciplinaire d’ingénierie managériale, d’études économiques et de conseil stratégique engagé aux côtés des entreprises, institutions et porteurs de projets.
          </p>
        </div>

        {/* 3 Pillar Cards (Vision, Mission, Valeurs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6 group-hover:bg-blue-700 group-hover:text-white transition-colors">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Notre Mission</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Accompagner la transformation, la rentabilité et la durabilité des organisations publiques et privées à travers des solutions d’études, de conseil en gestion et des formations professionnelles certifiantes à haute valeur ajoutée.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Notre Vision</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Être la référence incontournable en Afrique de l’Ouest et particulièrement au Togo pour l’ingénierie managériale, la modélisation de projets d’investissement et la professionnalisation du capital humain.
            </p>
          </div>

          {/* Valeurs */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Nos Valeurs Fondamentales</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Rigueur & Éthique :</strong> Respect strict des normes comptables et fiscales.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Pragmatisme :</strong> Outils directement applicables sur le terrain.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Confidentialité :</strong> Sécurité absolue de vos données et projets.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Territorial Anchorage & Clarification */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <MapPin className="w-3.5 h-3.5" />
                <span>Ancrage Territorial & Proximité</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Une présence forte et structurée au Togo
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Afin de garantir un accompagnement de proximité, DTECH GROUP dispose de <strong>deux centres majeurs de formation et d'études au Togo</strong> :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    Lomé (Siège National)
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Direction Générale, pôle études stratégiques, assistance fiscale OTR et salles de cours équipées.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    Kara (Pôle Régional Nord)
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Centre de formations professionnelles, accompagnement des entrepreneurs et organisations de la région Nord.
                  </p>
                </div>
              </div>

              {/* Geographical Note */}
              <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-slate-700">
                <strong className="text-blue-900 font-semibold">Note d'information :</strong> DTECH GROUP concentre l'ensemble de ses infrastructures et centres physiques sur le territoire togolais (Lomé, Kara et interventions à Baguida, Kpalimé, Sokodé, Dapaong). Le cabinet n'a aucun centre au Gabon.
              </div>
            </div>

            {/* Regional Network Grid */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 text-white space-y-4 shadow-md">
              <h4 className="text-base font-bold flex items-center gap-2 text-white">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Périmètre d’Intervention Régionale</span>
              </h4>
              <p className="text-xs text-slate-300">
                Nos consultants et équipes se déploient dans toutes les régions économiques :
              </p>

              <div className="space-y-2.5">
                {REGIONAL_POINTS.map((pt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                    <span className="font-semibold text-sky-300">{pt.city}</span>
                    <span className="text-slate-300 text-[11px]">{pt.zone}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800 flex items-center justify-between">
                <span>Formations Intra-entreprises</span>
                <span className="text-emerald-400 font-medium">Disponibles partout au Togo</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
