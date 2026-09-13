import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  CreditCard, 
  GraduationCap, 
  ShieldCheck, 
  HelpCircle, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Smartphone, 
  CheckCircle2, 
  ArrowLeft, 
  Building, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';

interface PublicCandidateGuideViewProps {
  onNavigate: (path: string) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const PublicCandidateGuideView: React.FC<PublicCandidateGuideViewProps> = ({
  onNavigate,
  onOpenRegister,
  onOpenLogin
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const candidateSteps = [
    {
      step: 'Étape 1',
      title: 'Explorer le Catalogue des Formations',
      desc: 'Parcourez nos filières d’expertise (Informatique & Télécoms, Gestion & Finance, BTP & Ingénierie, Design & Multimédia, Langues). Consultez les programmes détaillés, débouchés et prérequis.',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: BookOpen
    },
    {
      step: 'Étape 2',
      title: 'Remplir le Formulaire d’Inscription',
      desc: 'Cliquez sur « S’inscrire » sur la formation choisie. Renseignez vos nom, prénom, numéro WhatsApp et choisissez votre centre de formation (7 centres au Togo) ainsi que votre créneau horaire préféré.',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: GraduationCap
    },
    {
      step: 'Étape 3',
      title: 'Régler les Frais d’Inscription (25 000 FCFA)',
      desc: 'Validez votre réservation en effectuant le paiement sécurisé des frais d’inscription de 25 000 FCFA via T-Money (Mixx by Yas) ou Moov Flooz, ou directement au guichet du secrétariat du centre de votre choix.',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Smartphone
    },
    {
      step: 'Étape 4',
      title: 'Accéder à Votre Espace Étudiant',
      desc: 'Dès validation de votre dossier, vous recevez vos identifiants pour vous connecter à votre Espace Étudiant, télécharger les supports de cours en PDF et consulter votre emploi du temps.',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: ShieldCheck
    }
  ];

  const publicFaqs = [
    {
      q: 'Quels sont les diplômes et attestations délivrés ?',
      a: 'DTECH GROUP est agréé par le Ministère de l’Enseignement Technique et de la Formation Professionnelle sous le N° 003 / METFP / CAB / SE-CPO. Nos formations délivrent des Certificats de Qualification Professionnelle et Diplômes d’État avec QR Code de vérification publique.'
    },
    {
      q: 'Quels sont les créneaux horaires disponibles ?',
      a: 'Nous proposons trois tranches horaires flexibles adaptées aux étudiants et aux professionnels : Matinée (08h00 - 11h00), Après-midi (14h00 - 17h00), Soirée (18h00 - 21h00) ainsi qu’une formule spéciale Samedi.'
    },
    {
      q: 'Où se situent les centres DTECH au Togo ?',
      a: 'Nous disposons de 7 centres équipés de laboratoires informatiques modernes : Lomé Tokoin/Avédji, Lomé Agoè, Lomé Avépozo, Kpalimé, Atakpamé, Sokodé et Kara.'
    },
    {
      q: 'Comment un recruteur peut-il vérifier mon certificat ?',
      a: 'Chaque diplôme est doté d’un QR Code officiel et d’un numéro matricule unique vérifiables gratuitement sur notre portail de vérification en ligne (/verify-cert).'
    }
  ];

  return (
    <div className="w-full bg-slate-100 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour à l’accueil</span>
                </button>
                <span className="text-slate-600">|</span>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Guide du Candidat & Inscriptions
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Comment s’inscrire & Démarrer sa Formation
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Toutes les étapes pour choisir votre formation, effectuer votre inscription en ligne et accéder à votre espace de cours chez DTECH GROUP.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-2 cursor-pointer backdrop-blur-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le Guide</span>
              </button>

              <button
                type="button"
                onClick={onOpenRegister}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>S’inscrire Maintenant</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Étapes Clés pour le Candidat */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Le Parcours d’Inscription en 4 Étapes Simples
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidateSteps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-slate-900 text-amber-300 font-extrabold text-[10px] rounded-md uppercase tracking-wider">
                        {st.step}
                      </span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border font-bold ${st.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vérification des Diplômes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Vérificateur Public de Diplômes & Certificats</h3>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              Vous êtes recruteur ou employeur ? Vérifiez immédiatement l’authenticité d’un diplôme délivré par DTECH GROUP grâce à son numéro matricule officiel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/verify-cert')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
          >
            <span>Vérifier un Certificat</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* FAQ Candidat */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Questions Fréquentes des Candidats (FAQ)
            </h3>
          </div>

          <div className="space-y-2.5">
            {publicFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
