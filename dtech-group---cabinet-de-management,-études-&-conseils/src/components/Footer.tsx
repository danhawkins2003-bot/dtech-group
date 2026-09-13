import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  GraduationCap, 
  ArrowUp,
  Globe
} from 'lucide-react';
import { DTECH_INFO } from '../data/dtechData';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      
      {/* Top Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-extrabold text-lg shadow">
                <span className="text-white">D</span>
                <span className="text-amber-400">T</span>
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">DTECH GROUP</span>
                <p className="text-[11px] text-slate-400 font-medium">
                  Cabinet de Management, Études & Conseils
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Cabinet d’ingénierie managériale et d’études stratégiques au service du développement économique, de la rentabilité des entreprises et de la montée en compétences des professionnels au Togo et en Afrique.
            </p>

            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Conformité SYSCOHADA Révisé & OTR Togo</span>
            </div>
          </div>

          {/* Expertises Col */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Nos Domaines d'Expertise
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#expertises" className="hover:text-white transition-colors">Études & Plans d'Affaires bancables</a></li>
              <li><a href="#expertises" className="hover:text-white transition-colors">Conseil en Management & Stratégie</a></li>
              <li><a href="#expertises" className="hover:text-white transition-colors">Comptabilité SYSCOHADA & Fiscalité OTR</a></li>
              <li><a href="#formations" className="hover:text-white transition-colors">Formations Certifiantes (Sage, Power BI)</a></li>
              <li><a href="#expertises" className="hover:text-white transition-colors">Transformation Digitale & Systèmes d'Info</a></li>
              <li><a href="#expertises" className="hover:text-white transition-colors">Recrutement & Gestion des Compétences</a></li>
            </ul>
          </div>

          {/* Physical Locations Togo */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Nos Centres au Togo
            </h4>
            <div className="space-y-3">
              <div className="border-l-2 border-blue-600 pl-3 space-y-0.5">
                <div className="font-bold text-white text-xs">Siège Social - Lomé</div>
                <p className="text-[11px]">Boulevard Circulaire / Quartier d'Affaires</p>
                <p className="text-[11px] text-blue-400">+228 90 12 34 56</p>
              </div>

              <div className="border-l-2 border-amber-600 pl-3 space-y-0.5">
                <div className="font-bold text-white text-xs">Centre Régional - Kara</div>
                <p className="text-[11px]">Quartier Administratif / Proche Université</p>
                <p className="text-[11px] text-amber-400">+228 91 23 45 67</p>
              </div>

              <p className="text-[10px] text-slate-500 italic">
                *Interventions décentralisées à Baguida, Kpalimé, Sokodé, Dapaong. Aucun centre au Gabon.
              </p>
            </div>
          </div>

          {/* Quick Contact Col */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Contact & Support
            </h4>
            <div className="space-y-2 text-xs">
              <a href={`mailto:${DTECH_INFO.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{DTECH_INFO.email}</span>
              </a>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+228 90 00 00 00</span>
              </div>
              <a 
                href={DTECH_INFO.website} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors text-blue-400"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span>cabinetdtech.com</span>
              </a>
            </div>

            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowUp className="w-3 h-3" />
                <span>Haut de page</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 py-6 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} DTECH GROUP (Cabinet de Management, Études & Conseils). Tous droits réservés.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Site officiel : cabinetdtech.com</span>
            <span>•</span>
            <span className="text-slate-400">Implantation : République Togolaise</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
