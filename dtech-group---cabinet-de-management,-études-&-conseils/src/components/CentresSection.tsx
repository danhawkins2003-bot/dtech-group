import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  ShieldCheck, 
  Calendar, 
  Award 
} from 'lucide-react';
import { DTECH_INSTITUTIONAL_DATA } from '../data/dtechPlatformData';

export const CentresSection: React.FC = () => {
  return (
    <section id="centres" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 border border-blue-200 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>{DTECH_INSTITUTIONAL_DATA.accreditationNumber}</span>
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Nos 7 Centres de Formation au Togo
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            DTECH GROUP et l'<strong>{DTECH_INSTITUTIONAL_DATA.partner}</strong> vous accueillent dans tout le Togo avec la formule <strong>{DTECH_INSTITUTIONAL_DATA.trainingFormula}</strong>. Prochaine rentrée solennelle : <strong>{DTECH_INSTITUTIONAL_DATA.nextCohortDate}</strong>.
          </p>
        </div>

        {/* 7 Centres Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DTECH_INSTITUTIONAL_DATA.centers.map((centre) => (
            <div
              key={centre.id}
              id={`centre-card-${centre.id}`}
              className="bg-white border-2 border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-blue-600 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm border border-slate-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {centre.city}
                      </h3>
                      <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
                        {centre.name}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                    Ouvert
                  </span>
                </div>

                <div className="space-y-2 bg-slate-50 p-3.5 border border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                    <span><strong>Repère :</strong> {centre.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Infoline :</strong> <a href={`tel:${centre.phone.replace(/[^0-9+]/g, '')}`} className="font-bold text-slate-900 hover:text-blue-700">{centre.phone}</a></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span><strong>Horaires :</strong> {centre.openingHours}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Équipements & Services :
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-200">
                      Salles informatiques climatisées
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-200">
                      Fibre Optique
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-200">
                      Inscriptions & Dépôt
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  Code: {centre.id.toUpperCase()}
                </span>
                <a
                  href={`tel:${centre.phone.replace(/[^0-9+]/g, '')}`}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group-hover:underline"
                >
                  <span>Appeler ce centre</span>
                  <Navigation className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bandeau Institutionnel Ministère & Partenariat */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 border-l-4 border-amber-400 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Diplômes Reconnus & Agréés par l'État Togolais
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {DTECH_INSTITUTIONAL_DATA.accreditationNumber} — PARTENAIRE {DTECH_INSTITUTIONAL_DATA.partner}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Toutes nos filières d'apprentissage durent <strong>9 mois de cours théoriques et pratiques intensifs</strong> suivis obligatoirement de <strong>3 mois de stage professionnel garanti</strong> en entreprise au Togo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="tel:+22892898979"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-3 flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Infoline Nationale : (+228) 92 89 89 79</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
