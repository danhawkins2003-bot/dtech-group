import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  Calculator, 
  GraduationCap, 
  Cpu, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  Briefcase,
  Layers,
  FileCheck
} from 'lucide-react';
import { SERVICES_LIST } from '../data/dtechData';
import { ServiceExpertise } from '../types';

interface ServicesSectionProps {
  onSelectServiceForQuote: (serviceTitle: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectServiceForQuote }) => {
  const [selectedService, setSelectedService] = useState<ServiceExpertise>(SERVICES_LIST[0]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  return (
    <section id="expertises" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
            Nos Pôles de Compétences
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            Une Offre de Conseil Intégrée pour Dirigeants et Promoteurs
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            De l'analyse d'opportunités à l'exécution opérationnelle, DTECH GROUP mobilise des experts sectoriels pour sécuriser vos décisions d'affaires.
          </p>
        </div>

        {/* Services Interactive Grid / Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Service Selector Tabs */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-3 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Sélectionnez un domaine d'intervention</span>
            </div>

            {SERVICES_LIST.map((service) => {
              const isSelected = selectedService.id === service.id;
              return (
                <button
                  key={service.id}
                  id={`service-tab-${service.id}`}
                  onClick={() => setSelectedService(service)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-blue-700 text-white border-blue-700 shadow-md shadow-blue-700/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-blue-700 shadow-xs border border-slate-200'}`}>
                      {getIcon(service.icon)}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {service.title}
                      </div>
                      <p className={`text-xs line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {service.shortDesc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Right: Detailed Service Card */}
          <div className="lg:col-span-8 bg-slate-50/70 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow">
                  {getIcon(selectedService.icon)}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {selectedService.title}
                  </h3>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Pôle d'Expertise DTECH
                  </span>
                </div>
              </div>

              <button
                id="service-request-quote-btn"
                onClick={() => onSelectServiceForQuote(selectedService.title)}
                className="px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <span>Demander une proposition</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-slate-700 text-base leading-relaxed">
              {selectedService.fullDesc}
            </p>

            {/* Target Audience */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
              <strong className="text-slate-900 font-semibold">Bénéficiaires & Cibles : </strong>
              <span className="text-slate-600">{selectedService.target}</span>
            </div>

            {/* Two Column details: Deliverables & Methodology */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Deliverables */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Livrables & Résultats Clés</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {selectedService.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Methodology */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Démarche Méthodologique DTECH</span>
                </h4>
                <ol className="space-y-2 text-xs text-slate-600">
                  {selectedService.methodology.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
