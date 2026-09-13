import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  DollarSign, 
  BookOpen, 
  HelpCircle, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  CheckCircle2, 
  Building, 
  Users, 
  Layers 
} from 'lucide-react';

interface AdminGuideTabProps {
  onNavigateToTab?: (tabId: string) => void;
}

export const AdminGuideTab: React.FC<AdminGuideTabProps> = ({
  onNavigateToTab
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const guideSections = [
    {
      title: '1. Pilotage Stratégique & KPIs Nationaux',
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      actionTab: 'kpi',
      actionLabel: 'Voir les indicateurs',
      steps: [
        'Consultez les statistiques consolidées en temps réel : nombre total d’étudiants inscrits (347+), taux de rétention (96.4%) et répartition par centre.',
        'Suivez le chiffre d’affaires global encaissé en FCFA et analysez les performances par filière de formation.',
        'Filtrez les données par centre (Lomé Tokoin/Avédji, Kara, Sokodé, etc.) pour des analyses locales ciblées.'
      ]
    },
    {
      title: '2. Émission & Signature des Diplômes d’État',
      icon: Award,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      actionTab: 'certificates',
      actionLabel: 'Gérer les certificats',
      steps: [
        'Dans l’onglet « Diplômes & Certifications », visualisez les étudiants ayant validé avec succès l’ensemble des modules.',
        'Cliquez sur « Émettre le Diplôme Officiel » pour générer le certificat d’État avec le matricule national unique.',
        'Le QR Code cryptographique infalsifiable est automatiquement lié à la base de vérification publique (/verify-cert).'
      ]
    },
    {
      title: '3. Contrôle des Rapprochements Financiers',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionTab: 'enrollments',
      actionLabel: 'Contrôler les paiements',
      steps: [
        'Vérifiez la liste des paiements d’inscription et de scolarité soumis par les secrétariats des 7 centres.',
        'Validez les transactions mobiles T-Money et Flooz avec confirmation des références bancaires/opérateurs.',
        'Exportez les journaux de trésorerie consolidés au format Excel ou PDF pour les audits comptables.'
      ]
    },
    {
      title: '4. Administration du Catalogue & Nouvelles Sessions',
      icon: BookOpen,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      actionTab: 'courses',
      actionLabel: 'Gérer le catalogue',
      steps: [
        'Dans « Catalogue & Sessions », ajoutez de nouvelles filières, mettez à jour les tarifs ou ajustez les durées de formation.',
        'Programmez les dates des rentrées académiques et publiez les sessions à l’échelle nationale avec notification push.'
      ]
    }
  ];

  const adminFaqs = [
    {
      q: 'Comment un recruteur ou un ministère vérifie-t-il un diplôme émis ?',
      a: 'Tout recruteur peut scanner le QR Code imprimé sur le diplôme ou saisir le numéro de matricule sur le vérificateur public (/verify-cert). L’authenticité certifiée par le METFP sous le N° 003 / METFP / CAB / SE-CPO s’affiche instantanément.'
    },
    {
      q: 'Comment exporter les données financières globales ?',
      a: 'Cliquez sur le bouton « Exporter Rapport Consolidation » en haut de votre tableau de bord. Le rapport contient l’état complet des inscriptions, des paiements validés et des soldes restants.'
    },
    {
      q: 'Quelle est la procédure pour intégrer un nouveau centre régional ?',
      a: 'Le paramétrage d’un nouveau centre s’effectue dans la configuration de la plateforme avec assignation de son Directeur des Études et de son Secrétariat.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner Dédié Direction Générale */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                Manuel de la Direction Générale
              </span>
              <span className="text-xs text-slate-300">| Administration Centrale DTECH GROUP</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Guide de Pilotage & d’Administration Nationale
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Retrouvez l’ensemble des procédures exécutives : suivi des indicateurs financiers consolidés, émission et signature des diplômes d’État, gestion du catalogue et contrôle de gestion.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors flex items-center gap-2 shrink-0 cursor-pointer backdrop-blur-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer ce Guide</span>
          </button>
        </div>
      </div>

      {/* Guide Pas à Pas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guideSections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold ${sec.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{sec.title}</h3>
                </div>

                <ul className="space-y-2 text-xs text-slate-600">
                  {sec.steps.map((st, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span className="leading-relaxed">{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab(sec.actionTab)}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-purple-50 hover:text-purple-800 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>{sec.actionLabel}</span>
                  <span className="text-[11px]">&rarr;</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ DG */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Questions Fréquentes de la Direction Générale (FAQ)
          </h3>
        </div>

        <div className="space-y-2.5">
          {adminFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-500 shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
