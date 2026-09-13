import React from 'react';
import { 
  Briefcase, 
  LineChart, 
  Calculator, 
  Code2, 
  Users2, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export const CorporateServicesSection: React.FC = () => {
  const services = [
    {
      icon: LineChart,
      title: 'Études de Faisabilité & Montage de Projets',
      description: 'Élaboration de business plans bancables, études de marché togolaises et sous-régionales, plans de financement et dossiers d\'agrément aux codes des investissements.',
      features: [
        'Plans d\'affaires conformes aux exigences des banques togolaises',
        'Études d\'impact socio-économique et environnemental',
        'Recherche et négociation de financements auprès des bailleurs'
      ]
    },
    {
      icon: Calculator,
      title: 'Conseil en Gestion & Assistance Comptable',
      description: 'Tenue et surveillance comptable selon le Système SYSCOHADA Révisé, mise en place de manuels de procédures et élaboration de comptes de synthèse.',
      features: [
        'Mise en place de systèmes comptables informatisés (Sage 100)',
        'Arrêtés des comptes et rédaction des états financiers annuels',
        'Organisation et assainissement des comptabilités d\'entreprises'
      ]
    },
    {
      icon: FileCheck,
      title: 'Audit & Optimisation Fiscale OTR',
      description: 'Accompagnement dans les obligations déclaratives régulières, sécurisation fiscale, audits préventifs et assistance technique lors des contrôles fiscaux OTR.',
      features: [
        'Audit de conformité fiscale préventif',
        'Assistance lors des vérifications générales de l\'OTR',
        'Traitement des contentieux fiscaux et recours gracieux'
      ]
    },
    {
      icon: Code2,
      title: 'Développement Informatique & Systèmes d\'Information',
      description: 'Conception d\'applications sur-mesure pour PME et institutions, intégration de solutions de paiement mobile (T-Money/Flooz), réseaux et sécurité informatique.',
      features: [
        'Développement de portails web et logiciels de gestion internes',
        'Intégration d\'APIs de paiement électronique local',
        'Audit de cybersécurité et maintenance de parcs informatiques'
      ]
    },
    {
      icon: Users2,
      title: 'Conseil RH & Recrutement de Profils Qualifiés',
      description: 'Sourcing, évaluation de compétences et formation continue sur-mesure pour les collaborateurs de votre entreprise à Lomé ou en région.',
      features: [
        'Audit des compétences et plans de formation intra-entreprise',
        'Tests techniques rigoureux de recrutement (Compta, IT, Gestion)',
        'Gestion prévisionnelle des emplois et des compétences (GPEC)'
      ]
    },
    {
      icon: Building2,
      title: 'Restructuration & Stratégie d\'Entreprise',
      description: 'Diagnostics stratégiques, optimisation des processus opérationnels et accompagnement au changement pour accroître la rentabilité.',
      features: [
        'Diagnostics organisationnels et financiers complets',
        'Conception de tableaux de bord de pilotage (Power BI)',
        'Accompagnement à la transmission et fusion d\'entreprises'
      ]
    }
  ];

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Institutionnel */}
        <div className="bg-slate-900 border-l-4 border-blue-600 text-white p-6 md:p-8 mb-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Pôle Expertise & Solutions Entreprises
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Services & Accompagnement Conseil DTECH GROUP
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            DTECH GROUP met à la disposition des entreprises, institutions publiques, ONG et porteurs de projets au Togo une équipe pluridisciplinaire d'experts certifiés pour sécuriser et accélérer leurs opérations.
          </p>
        </div>

        {/* Grille des 6 Services Pro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div key={idx} className="bg-white border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-400 transition-colors shadow-2xs">
                <div>
                  <div className="w-10 h-10 bg-slate-100 text-blue-900 flex items-center justify-center mb-4 border border-slate-200">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {srv.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {srv.description}
                  </p>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    {srv.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => alert(`Demande d'accompagnement initiée pour : "${srv.title}". Contactez notre direction commerciale à Lomé ou Kara.`)}
                    className="text-xs font-bold text-blue-800 hover:text-blue-950 flex items-center gap-1.5"
                  >
                    Demander une proposition d'intervention &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bannière Demande d'Intervention */}
        <div className="bg-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs border border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase text-blue-400">Entreprises & Organisations</span>
            <h2 className="text-xl font-bold mt-1">Vous avez un projet d'étude ou un besoin de formation sur-mesure ?</h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Nos consultants interviennent directement dans vos locaux à Lomé, Kara ou partout au Togo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+22890451234"
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-5 py-3 text-center transition-colors"
            >
              Appeler la Direction : +228 90 45 12 34
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
