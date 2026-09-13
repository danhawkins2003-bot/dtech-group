import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Clock, 
  Award, 
  CheckCircle, 
  FileBadge, 
  Download, 
  HelpCircle, 
  Printer, 
  Sparkles, 
  QrCode, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  GraduationCap, 
  Smartphone, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { StudentData } from '../types';

interface StudentGuideTabProps {
  student: StudentData;
  onNavigateToTab?: (tabId: string) => void;
}

export const StudentGuideTab: React.FC<StudentGuideTabProps> = ({
  student,
  onNavigateToTab
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const guideSections = [
    {
      title: '1. Télécharger vos Supports de Cours & Fiches TD (PDFs)',
      icon: FileText,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      actionTab: 'resources',
      actionLabel: 'Accéder aux supports',
      steps: [
        'Rendez-vous dans l’onglet « Mes supports (PDFs) » depuis le menu de votre espace.',
        'Visualisez la liste des chapitres et documents mis à disposition par vos formateurs certifiés.',
        'Cliquez sur « Télécharger PDF » pour enregistrer le document complet sur votre ordinateur ou smartphone pour réviser hors-ligne.'
      ]
    },
    {
      title: '2. Consulter votre Planning Hebdomadaire & Salles',
      icon: Clock,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      actionTab: 'planning',
      actionLabel: 'Voir mon planning',
      steps: [
        'Cliquez sur l’onglet « Mon planning » pour voir l’emploi du temps de la semaine en cours.',
        'Consultez vos horaires selon votre créneau choisi (Matin : 08h-11h, Après-midi : 14h-17h, Soir : 18h-21h ou Samedi).',
        'Vérifiez la salle de cours et le laboratoire informatique assigné (ex : Lab Info Alpha, Salle Réseaux).'
      ]
    },
    {
      title: '3. Suivre vos Notes & Relevé d’Évaluations',
      icon: Award,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      actionTab: 'evaluations',
      actionLabel: 'Consulter mes notes',
      steps: [
        'Rendez-vous dans « Évaluations & Notes » pour suivre vos notes sur 20 attribuées aux contrôles continus et TPs.',
        'Consultez les appréciations qualitatives et conseils d’amélioration rédigés par vos enseignants.',
        'Votre moyenne générale est recalculée automatiquement selon les coefficients des modules.'
      ]
    },
    {
      title: '4. Vérifier vos Présences & Assiduité en Cours',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionTab: 'attendance',
      actionLabel: 'Voir mes présences',
      steps: [
        'Consultez l’onglet « Mes présences » pour vérifier l’historique des séances validées par le formateur.',
        'Assurez-vous de maintenir un taux d’assiduité supérieur à 80% pour être éligible à la soutenance du Diplôme d’État.'
      ]
    },
    {
      title: '5. Télécharger votre Reçu Officiel & Fiche d’Inscription',
      icon: FileBadge,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      actionTab: 'registration',
      actionLabel: 'Imprimer mon reçu',
      steps: [
        'Dans « Mon inscription & Reçu », visualisez votre quittance financière officielle certifiée par DTECH GROUP.',
        'Cliquez sur « Imprimer le Reçu » pour générer le justificatif officiel avec numéro de quittance et cachet de l’école.'
      ]
    },
    {
      title: '6. Certificat Officiel & QR Code d’Authenticité',
      icon: QrCode,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      actionTab: 'formation',
      actionLabel: 'Voir mon certificat',
      steps: [
        'Une fois votre formation validée, votre certificat numérique certifié METFP est disponible dans l’onglet « Ma formation ».',
        'Ce document officiel comporte un QR Code sécurisé permettant aux recruteurs et entreprises de vérifier son authenticité en temps réel.'
      ]
    }
  ];

  const studentFaqs = [
    {
      q: 'Comment obtenir mon reçu d’inscription pour mon employeur ou mes parents ?',
      a: 'Accédez à l’onglet « Mon inscription & Reçu », puis cliquez sur le bouton « Imprimer le Reçu Officiel ». Le document au format officiel avec cachet de direction sera généré et prêt à être imprimé ou sauvegardé en PDF.'
    },
    {
      q: 'Que faire si un support de cours PDF ne se télécharge pas ?',
      a: 'Vérifiez votre connexion internet ou rechargez la page. Si le problème persiste, signalez-le directement à votre formateur en classe ou au secrétariat de votre centre DTECH.'
    },
    {
      q: 'Comment fonctionne la vérification du certificat par les recruteurs ?',
      a: 'Chaque certificat délivré par DTECH GROUP dispose d’un numéro matricule unique et d’un QR Code. Tout employeur peut scanner le code avec son smartphone ou entrer le numéro sur le vérificateur public de diplômes pour attester de son authenticité.'
    },
    {
      q: 'Puis-je changer d’horaire ou de créneau de cours en cours d’année ?',
      a: 'Oui, les demandes de changement de tranche horaire (Matin, Soir ou Samedi) doivent être adressées au secrétariat de votre centre pour validation par la Direction des Études.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner Dédié Étudiant */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Manuel de l’Apprenant
              </span>
              <span className="text-xs text-slate-300">| Espace Étudiant DTECH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Guide d’Utilisation de Votre Espace Étudiant
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Retrouvez ici toutes les instructions pour réussir votre formation : téléchargement des cours en PDF, suivi des notes, planning des cours et obtention de vos justificatifs officiels.
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

      {/* Guide Pas à Pas pour Étudiants */}
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

      {/* Foire Aux Questions Spécifique à l'Étudiant */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Questions Fréquentes de l'Étudiant (FAQ)
          </h3>
        </div>

        <div className="space-y-2.5">
          {studentFaqs.map((faq, idx) => {
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
