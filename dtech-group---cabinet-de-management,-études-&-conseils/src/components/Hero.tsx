import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap, 
  Building, 
  FileText, 
  MapPin, 
  Award,
  Users,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { DTECH_INFO } from '../data/dtechData';

interface HeroProps {
  onExploreServices: () => void;
  onExploreFormations: () => void;
  onOpenSimulator: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onExploreServices, 
  onExploreFormations, 
  onOpenSimulator 
}) => {
  return (
    <section id="accueil" className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Background Subtle Tech Grid Decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Cabinet d’Ingénierie Managériale & Formations d’Excellence</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>7 Centres Agréés au Togo (Lomé, Kpalimé, Kara...)</span>
          </div>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              Propulsez la performance de vos organisations et vos{' '}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                compétences stratégiques
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              <strong className="text-white font-semibold">DTECH GROUP</strong> est votre cabinet de référence au Togo pour les études de faisabilité, l’audit organisationnel, la gestion comptable & fiscale (SYSCOHADA) et les formations certifiantes de haut niveau.
            </p>

            {/* Core Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-200">
                  Études de projets & plans d’affaires bancables
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-200">
                  Formations pratiques Sage, Power BI & Management
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-200">
                  Conformité fiscale OTR & comptabilité SYSCOHADA
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-200">
                  Sessions présentielles à Lomé et Kara + Formules E-learning
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                id="hero-cta-formations"
                onClick={onExploreFormations}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Voir le catalogue des formations</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-cta-simulator"
                onClick={onOpenSimulator}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Simuler un devis / projet</span>
              </button>

              <button
                id="hero-cta-services"
                onClick={onExploreServices}
                className="px-4 py-3 rounded-xl font-medium text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Découvrir nos pôles de conseil →
              </button>
            </div>
          </div>

          {/* Right Floating Card / Key Stats Bento */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700/80 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-snug">
                      Impact & Performance
                    </h2>
                    <p className="text-xs text-slate-400">Chiffres clés DTECH GROUP</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Togo & Région
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                    {DTECH_INFO.professionalsTrained}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">Professionnels & Cadres formés</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">
                    {DTECH_INFO.projectsAccomplished}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">Projets & Études structurés</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    {DTECH_INFO.satisfactionRate}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">Taux de satisfaction certifié</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">
                    {DTECH_INFO.yearsOfExperience}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">Années d'excellence terrain</p>
                </div>
              </div>

              {/* Clarification banner */}
              <div className="p-3.5 rounded-xl bg-blue-950/70 border border-blue-800/60 text-xs text-slate-300 flex items-start gap-2.5">
                <Building className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Ancrage Territorial :</span> Présence physique à <strong className="text-blue-300">Lomé</strong> (Siège National) et <strong className="text-blue-300">Kara</strong> (Pôle Régional Nord), avec des interventions partout au Togo.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
