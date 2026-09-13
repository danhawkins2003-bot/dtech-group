import React, { useState } from 'react';
import { 
  Building, 
  Calendar, 
  UserCheck, 
  Clock, 
  Award, 
  Users, 
  HelpCircle, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  CheckCircle2, 
  Layers, 
  BookOpen 
} from 'lucide-react';
import { StudyDirectorData, CenterData } from '../types';

interface StudyDirectorGuideTabProps {
  director: StudyDirectorData;
  center: CenterData;
  onNavigateToTab?: (tabId: string) => void;
}

export const StudyDirectorGuideTab: React.FC<StudyDirectorGuideTabProps> = ({
  director,
  center,
  onNavigateToTab
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const guideSections = [
    {
      title: '1. Gestion des Promotions & Cohortes',
      icon: Calendar,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      actionTab: 'promotions',
      actionLabel: 'Gérer les promotions',
      steps: [
        'Consultez l’onglet « Promotions & Groupes » pour visualiser l’ensemble des cohortes actives du centre.',
        'Créez une nouvelle cohorte, définissez la date de début, le rythme (Jour, Soir, Samedi) et l’effectif cible.',
        'Suivez le taux de complétion des modules par rapport au syllabus académique.'
      ]
    },
    {
      title: '2. Affectation des Formateurs Agréés',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionTab: 'trainers',
      actionLabel: 'Affecter les formateurs',
      steps: [
        'Dans « Formateurs & Groupes », assignez chaque formateur expert à ses modules de spécialité.',
        'Contrôlez la charge horaire hebdomadaire de chaque enseignant pour éviter les surcharges.',
        'Vérifiez la régularité des émargements saisis par le corps enseignant.'
      ]
    },
    {
      title: '3. Gestion des Emplois du Temps & Salles',
      icon: Clock,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      actionTab: 'schedule',
      actionLabel: 'Planifier les cours',
      steps: [
        'Accédez à « Emploi du Temps » pour configurer les créneaux hebdomadaires (08h-11h, 14h-17h, 18h-21h).',
        'Attribuez les salles et laboratoires spécialisés (Lab Info Alpha, Lab Réseaux, Salles théoriques) sans conflit.',
        'Publiez le planning pour mise à jour instantanée dans les espaces étudiants et formateurs.'
      ]
    },
    {
      title: '4. Suivi de l’Assiduité & Notes Académiques',
      icon: Award,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      actionTab: 'attendance-overview',
      actionLabel: 'Superviser l’assiduité',
      steps: [
        'Contrôlez les bilans d’assiduité par groupe et identifiez les étudiants nécessitant un rattrapage.',
        'Validez les relevés de notes consolidés avant transmission à la Direction Générale pour la délivrance des diplômes d’État.'
      ]
    }
  ];

  const directorFaqs = [
    {
      q: 'Comment résoudre un conflit de salle entre deux groupes ?',
      a: 'Dans le module « Emploi du Temps », visualisez l’occupation des salles par créneau horaire. Vous pouvez réassigner une cohorte à un autre laboratoire ou modifier l’horaire en un clic.'
    },
    {
      q: 'Comment remplacer un formateur indisponible ?',
      a: 'Rendez-vous dans « Formateurs & Groupes », ouvrez la fiche de la session et sélectionnez un nouveau formateur agréé disponible dans la liste du centre.'
    },
    {
      q: 'Quel est le seuil d’assiduité requis pour valider le cursus ?',
      a: 'Conformément au référentiel METFP, un taux de présence minimal de 80% est exigé pour autoriser l’étudiant à passer les évaluations finales et soutenir son projet.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner Dédié Direction des Études */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                Manuel de la Direction des Études
              </span>
              <span className="text-xs text-slate-300">| Centre de {center.name}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Guide Pédagogique du Directeur des Études
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Consultez les procédures de gestion académique : création des promotions, élaboration des emplois du temps, coordination du corps enseignant et supervision des évaluations.
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
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-800 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>{sec.actionLabel}</span>
                  <span className="text-[11px]">&rarr;</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ Direction des Études */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Questions Fréquentes de la Direction des Études (FAQ)
          </h3>
        </div>

        <div className="space-y-2.5">
          {directorFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
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
