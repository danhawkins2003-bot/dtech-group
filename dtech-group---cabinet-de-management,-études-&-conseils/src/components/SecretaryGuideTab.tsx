import React, { useState } from 'react';
import { 
  FileBadge, 
  FileText, 
  Users, 
  CreditCard, 
  Printer, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  CheckCircle2, 
  Building, 
  AlertCircle, 
  Smartphone, 
  DollarSign 
} from 'lucide-react';
import { SecretaryData, CenterData } from '../types';

interface SecretaryGuideTabProps {
  secretary: SecretaryData;
  center: CenterData;
  onNavigateToTab?: (tabId: string) => void;
}

export const SecretaryGuideTab: React.FC<SecretaryGuideTabProps> = ({
  secretary,
  center,
  onNavigateToTab
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const guideSections = [
    {
      title: '1. Traitement des Inscriptions en Ligne',
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      actionTab: 'registrations',
      actionLabel: 'Gérer les inscriptions',
      steps: [
        'Consultez l’onglet « Inscriptions en Ligne » pour voir les candidatures soumises via le site web.',
        'Vérifiez la filière demandée, le centre choisi et la modalité de paiement annoncée.',
        'Validez l’inscription dès réception de la preuve de paiement ou du passage au guichet.'
      ]
    },
    {
      title: '2. Gestion des Dossiers Étudiants & Scolarité',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionTab: 'students',
      actionLabel: 'Voir les dossiers',
      steps: [
        'Dans « Dossiers Étudiants », accédez à la liste complète des apprenants inscrits dans votre centre.',
        'Mettez à jour les coordonnées téléphoniques et vérifiez la présence des pièces justificatives (CNI, diplôme antérieur).',
        'Consultez le solde de scolarité de chaque apprenant et le détail des tranches versées.'
      ]
    },
    {
      title: '3. Encaissement des Frais & Caisse du Centre',
      icon: DollarSign,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      actionTab: 'receipts',
      actionLabel: 'Consulter les encaissements',
      steps: [
        'Enregistrez les règlements d’inscription et de scolarité : Espèces au guichet, T-Money ou Moov Flooz.',
        'Chaque paiement est immédiatement comptabilisé dans le journal de caisse du centre.',
        'Les totaux encaissés sont consolidés en temps réel pour le Directeur des Études et la Direction Générale.'
      ]
    },
    {
      title: '4. Émission & Impression des Reçus Officiels',
      icon: FileBadge,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      actionTab: 'receipts',
      actionLabel: 'Imprimer les reçus',
      steps: [
        'Rendez-vous dans l’onglet « Reçus Officiels ».',
        'Sélectionnez le dossier de l’étudiant et cliquez sur « Imprimer le Reçu ».',
        'Remettez en main propre le reçu officiel avec quittance sécurisée, numéro de matricule et cachet DTECH.'
      ]
    }
  ];

  const secretaryFaqs = [
    {
      q: 'Quels sont les frais d’inscription obligatoires à percevoir ?',
      a: 'Les frais d’inscription sont obligatoires pour valider toute réservation de place. Ils peuvent être réglés en espèces à l’accueil, par T-Money ou Moov Flooz.'
    },
    {
      q: 'Comment rééditer un reçu de paiement égaré par un étudiant ?',
      a: 'Dans l’onglet « Reçus Officiels », recherchez l’étudiant par son nom ou son matricule, puis cliquez sur « Réimprimer le Reçu ». Le document original sera regénéré à l’identique.'
    },
    {
      q: 'Comment gérer les paiements en plusieurs tranches ?',
      a: 'Lors de chaque versement, le reçu émis mentionne le montant de la tranche encaissée, le total déjà versé et le solde restant à régler.'
    },
    {
      q: 'Que faire en cas d’erreur lors de la saisie d’un versement ?',
      a: 'Contactez immédiatement la Direction Générale ou le Directeur des Études pour effectuer une régularisation comptable de l’écriture de caisse.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner Dédié Secrétariat */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/80 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <FileBadge className="w-3.5 h-3.5 text-amber-400" />
                Manuel du Secrétariat & Admissions
              </span>
              <span className="text-xs text-slate-300">| Centre de {center.name}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Guide Opérationnel du Secrétariat des Admissions
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Consultez les procédures administratives : validation des inscriptions en ligne, encaissement des règlements de scolarité, impression des reçus officiels et suivi des dossiers étudiants.
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

      {/* Guide Pas à Pas pour Secrétariat */}
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
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-amber-50 hover:text-amber-800 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-amber-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>{sec.actionLabel}</span>
                  <span className="text-[11px]">&rarr;</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ Secrétariat */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Questions Fréquentes du Secrétariat (FAQ)
          </h3>
        </div>

        <div className="space-y-2.5">
          {secretaryFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-500 shrink-0" />
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
