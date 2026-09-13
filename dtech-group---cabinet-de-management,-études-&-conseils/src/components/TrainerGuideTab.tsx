import React, { useState } from 'react';
import { 
  UserCheck, 
  CheckSquare, 
  Award, 
  Upload, 
  Users, 
  BookOpen, 
  HelpCircle, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Layers, 
  FileText, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { TrainerData } from '../types';

interface TrainerGuideTabProps {
  trainer: TrainerData;
  onNavigateToTab?: (tabId: string) => void;
}

export const TrainerGuideTab: React.FC<TrainerGuideTabProps> = ({
  trainer,
  onNavigateToTab
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const guideSections = [
    {
      title: '1. Gérer vos Groupes & Liste des Apprenants',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      actionTab: 'groups',
      actionLabel: 'Voir mes groupes',
      steps: [
        'Accédez à l’onglet « Mes groupes & Étudiants » pour afficher l’ensemble des cohortes qui vous sont affectées.',
        'Consultez la liste des apprenants inscrits avec leur numéro de matricule et leurs coordonnées de contact.',
        'Vérifiez le niveau d’avancement de chaque groupe par rapport au calendrier pédagogique.'
      ]
    },
    {
      title: '2. Effectuer l’Émargement & Appel Journalier',
      icon: CheckSquare,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionTab: 'attendance',
      actionLabel: 'Faire l’appel',
      steps: [
        'À chaque début ou fin de séance, rendez-vous dans l’onglet « Cahier de Présences ».',
        'Sélectionnez la date du jour et cochez le statut de chaque étudiant : Présent, Absent ou Retard.',
        'Cliquez sur « Enregistrer l’émargement » pour synchroniser instantanément les données avec la Direction des Études.'
      ]
    },
    {
      title: '3. Saisir les Notes & Évaluations des Apprenants',
      icon: Award,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      actionTab: 'grades',
      actionLabel: 'Saisir des notes',
      steps: [
        'Dans l’onglet « Évaluations & Notes », choisissez le groupe concerné et cliquez sur « Nouvelle Évaluation ».',
        'Renseignez l’intitulé (ex : Contrôle Continu N°1, TP Pratique, Examen Blanc) et le coefficient.',
        'Attribuez les notes sur 20 à chaque apprenant et ajoutez une remarque personnalisée pour guider sa progression.'
      ]
    },
    {
      title: '4. Publier vos Supports de Cours & Fiches TD (PDFs)',
      icon: Upload,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      actionTab: 'resources',
      actionLabel: 'Déposer un support',
      steps: [
        'Rendez-vous dans l’onglet « Supports pédagogiques (Direct) ».',
        'Remplissez le formulaire de publication : titre du document, module associé et fichier PDF.',
        'Dès la publication, le support est immédiatement disponible en téléchargement dans l’espace des étudiants de votre classe.'
      ]
    },
    {
      title: '5. Suivre la Couverture du Programme & Syllabus',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      actionTab: 'courses',
      actionLabel: 'Consulter le syllabus',
      steps: [
        'Dans « Mes cours », vérifiez les compétences clés à valider selon le référentiel officiel METFP.',
        'Mettez à jour l’état d’avancement des chapitres pour informer le Directeur des Études du rythme de formation.'
      ]
    }
  ];

  const trainerFaqs = [
    {
      q: 'Quand dois-je valider la feuille d’émargement ?',
      a: 'L’émargement numérique doit être enregistré à chaque séance de cours. Cela permet d’alimenter automatiquement le taux d’assiduité des étudiants et de générer les bilans pédagogiques.'
    },
    {
      q: 'Puis-je modifier une note après avoir enregistré l’évaluation ?',
      a: 'Oui, tant que la période d’évaluation n’est pas clôturée par la Direction des Études, vous pouvez modifier les notes et remarques directement depuis l’onglet « Évaluations & Notes ».'
    },
    {
      q: 'Quel est le format recommandé pour les supports de cours ?',
      a: 'Nous recommandons le format PDF normalisé (diaporamas de cours, fiches de travaux pratiques, exercices corrigés) pour garantir une lecture fluide sur ordinateurs et smartphones.'
    },
    {
      q: 'Comment signaler un apprenant en difficulté ou absent de manière répétée ?',
      a: 'Vous pouvez consigner une observation dans la fiche de présence ou envoyer une note d’alerte directement au Directeur des Études depuis votre tableau de bord.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner Dédié Formateur */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                Manuel du Formateur Agréé
              </span>
              <span className="text-xs text-slate-300">| Espace Enseignant DTECH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Guide d’Utilisation de Votre Espace Formateur
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Retrouvez l’ensemble des procédures pédagogiques : émargement journalier, saisie des notes d’évaluation, partage direct des supports de cours et suivi de vos groupes d'apprenants.
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

      {/* Guide Pas à Pas pour Formateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>{sec.actionLabel}</span>
                  <span className="text-[11px]">&rarr;</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ Formateur */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Questions Fréquentes du Formateur (FAQ)
          </h3>
        </div>

        <div className="space-y-2.5">
          {trainerFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0" />
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
