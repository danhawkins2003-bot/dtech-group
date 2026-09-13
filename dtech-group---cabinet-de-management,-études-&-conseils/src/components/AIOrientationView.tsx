import React, { useState } from 'react';
import { 
  Bot, 
  ArrowRight, 
  Send, 
  BookOpen, 
  Smartphone, 
  MapPin, 
  CheckCircle2, 
  RotateCcw, 
  GraduationCap, 
  Briefcase, 
  Compass, 
  Layers,
  Award,
  ChevronRight,
  UserCheck,
  Phone,
  MessageCircle,
  Volume2,
  VolumeX,
  Calculator,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  CheckCheck
} from 'lucide-react';
import { PlatformCourse } from '../types';
import { aiService, ChatMessage } from '../services/aiService';

interface AIOrientationViewProps {
  courses: PlatformCourse[];
  onSelectCourse: (course: PlatformCourse) => void;
  onEnrollCourse: (course: PlatformCourse) => void;
  onNavigate: (path: string) => void;
}

export const AIOrientationView: React.FC<AIOrientationViewProps> = ({
  courses,
  onSelectCourse,
  onEnrollCourse,
  onNavigate
}) => {
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [conversation, setConversation] = useState<ChatMessage[]>([
    {
      id: 'init_msg',
      sender: 'assistant',
      text: `Bonjour ! Je suis **M. Koffi MENSAH**, Conseiller Pédagogique Principal chez **DTECH GROUP TOGO**.\n\nBienvenue dans notre **Cabinet d'Orientation & Ingénierie Pédagogique**.\n\nMon rôle est de vous guider en toute transparence pour choisir la formation la plus stratégique à **Lomé (Tokoin)** ou **Kara**, vous expliquer les débouchés réels sur le marché togolais, et simuler vos modalités de paiement par **T-Money (*145#)** ou **Moov Flooz (*155#)** (60% à l'inscription / 40% à mi-parcours).\n\nSélectionnez une des orientations types ci-dessous ou décrivez-moi votre situation personnelle.`,
      timestamp: 'En direct'
    }
  ]);

  const profileScenarios = [
    {
      id: 'prof_beginner_it',
      icon: Compass,
      title: 'Reconversion Métiers du Numérique',
      desc: 'Débutant(e) sans prérequis technique souhaitant intégrer le digital au Togo.',
      prompt: 'Je suis débutant sans expérience préalable et je souhaite me reconvertir dans le numérique au Togo. Quelles opportunités existent entre le Développement Web, l\'Infographie et Power BI ?'
    },
    {
      id: 'prof_finance',
      icon: Briefcase,
      title: 'Comptabilité & Normes SYSCOHADA',
      desc: 'Diplômé(e) ou en poste voulant maîtriser Sage 100 Compta et la liasse fiscale.',
      prompt: 'J\'ai des bases en gestion et je veux maîtriser Sage 100 Compta i7 et le SYSCOHADA Révisé. Comment cette formation me rendra-t-elle directement opérationnel en entreprise à Lomé ?'
    },
    {
      id: 'prof_otr',
      icon: ShieldCheck,
      title: 'Fiscalité & Télédéclaration OTR',
      desc: 'Comptables, juristes et gestionnaires souhaitant maîtriser le portail fiscal togolais.',
      prompt: 'Quels sont les modules clés de la formation Fiscalité Togolaise et comment s\'effectue la pratique sur la télédéclaration OTR (TVA, IRPP, IS, patente) ?'
    },
    {
      id: 'prof_data',
      icon: Layers,
      title: 'Data Analytics & Power BI',
      desc: 'Professionnels souhaitant concevoir des dashboards interactifs de direction.',
      prompt: 'Je souhaite piloter la performance d\'entreprise avec Microsoft Power BI. Quels sont les prérequis et le niveau de maîtrise DAX / Power Query atteint ?'
    },
    {
      id: 'prof_dev',
      icon: GraduationCap,
      title: 'Développeur Web Full Stack',
      desc: 'Apprendre React 19, TypeScript, Node.js et intégrer les paiements T-Money / Flooz.',
      prompt: 'Quels projets réels sont construits durant la formation Développement Web Full Stack et comment les cours du soir sont-ils organisés ?'
    },
    {
      id: 'prof_proj',
      icon: Award,
      title: 'Gestion & Suivi de Projets',
      desc: 'Cadres et porteurs de projets souhaitant maîtriser MS Project et le cadre logique.',
      prompt: 'Quelles sont les compétences pratiques acquises en Suivi-Évaluation et Modélisation Financière de Projets (MS Project, VAN, TRI) ?'
    }
  ];

  const handleSendPrompt = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversation(prev => [...prev, userMsg]);
    setCustomQuestion('');
    setIsLoading(true);

    try {
      const history = conversation
        .filter(c => c.id !== 'init_msg')
        .map(c => ({
          role: c.sender === 'assistant' ? ('model' as const) : ('user' as const),
          text: c.text
        }));

      const response = await aiService.askAdvisor(text.trim(), history);

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversation(prev => [...prev, botMsg]);
    } catch (err) {
      setConversation(prev => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: `Désolé pour cette courte interruption. Vous pouvez joindre directement le secrétariat académique de **DTECH GROUP Lomé** au **+228 90 45 12 34** pour échanger avec notre équipe pédagogique.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeech = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '')
      .replace(/•/g, '-');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 0.95;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fade-in">
      
      {/* En-tête Institutionnel du Pôle d'Orientation Réaliste */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-10 border border-blue-900 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>Orientation Professionnelle Personnalisée • Togo</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Conseiller Pédagogique Principal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consultez en direct <strong>M. Koffi MENSAH</strong> pour analyser vos compétences actuelles, choisir le parcours de formation le plus pertinent dans nos <strong>7 centres au Togo</strong>, et organiser vos paiements par <strong>T-Money (*145#)</strong> et <strong>Flooz (*155#)</strong>.
            </p>
          </div>

          {/* Profil Réaliste du Conseiller */}
          <div className="bg-slate-950/90 p-5 border border-blue-800 text-xs space-y-3 shrink-0 w-full lg:w-80 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                  alt="M. Koffi Mensah" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 border-2 border-slate-950 animate-pulse"></span>
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">M. Koffi MENSAH</h4>
                <p className="text-[11px] text-amber-300 font-semibold">Référent Orientation DTECH</p>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span>🟢 En direct du Siège (Tokoin)</span>
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <span>Implantation :</span>
                <strong className="text-white">7 Centres au Togo</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Règlements :</span>
                <strong className="text-emerald-300">T-Money & Flooz (2x)</strong>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <a 
                href="https://wa.me/22890451234?text=Bonjour%20M.%20Koffi%20Mensah,%20je%20souhaite%20prendre%20un%20rendez-vous%20d'orientation%20à%20DTECH%20Lomé"
                target="_blank"
                rel="noreferrer"
                className="flex-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-center text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
              <a 
                href="tel:+22890451234"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-center text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Appel</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des Scénarios d'Orientation Rapide */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-700" />
            <span>Filières et Orientations Pratiques au Togo :</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            Cliquez pour lancer l'analyse avec M. Koffi
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profileScenarios.map((scen) => {
            const Icon = scen.icon;
            const isSelected = activeProfile === scen.id;
            return (
              <div
                key={scen.id}
                onClick={() => {
                  setActiveProfile(scen.id);
                  handleSendPrompt(scen.prompt);
                }}
                className={`p-4 bg-white border cursor-pointer transition-all hover:border-blue-600 hover:shadow-md flex flex-col justify-between group ${
                  isSelected ? 'border-blue-700 ring-2 ring-blue-700/20 bg-blue-50/40' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 bg-blue-100 text-blue-800 flex items-center justify-center font-bold group-hover:bg-blue-700 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Orientation</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-800 transition-colors">
                    {scen.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {scen.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                  <span>Consulter M. Koffi</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interface de Discussion Réaliste avec M. Koffi */}
      <div className="bg-white border border-slate-300 shadow-md overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
                alt="Koffi" 
                className="w-7 h-7 rounded-full object-cover border border-amber-400"
                referrerPolicy="no-referrer"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0"></span>
            </div>
            <div>
              <span className="font-black text-sm uppercase tracking-wider text-white">
                Salon d'Orientation avec M. Koffi MENSAH
              </span>
              <span className="block text-[10px] text-slate-300">Référent Académique DTECH GROUP Togo</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setConversation([conversation[0]])}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
        </div>

        {/* Zone de Messages */}
        <div className="p-4 sm:p-6 bg-slate-50 min-h-[380px] max-h-[550px] overflow-y-auto space-y-4">
          {conversation.map((msg) => {
            const isBot = msg.sender === 'assistant';
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  {isBot ? (
                    <span className="text-[10px] font-black text-blue-900 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-700" />
                      M. Koffi MENSAH (Conseiller)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      Vous (Candidat)
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">• {msg.timestamp}</span>
                </div>

                <div
                  className={`p-4 max-w-[92%] sm:max-w-[82%] border shadow-2xs whitespace-pre-wrap text-xs sm:text-sm leading-relaxed ${
                    isBot 
                      ? 'bg-white text-slate-900 border-slate-200 ring-1 ring-slate-100' 
                      : 'bg-blue-800 text-white border-blue-900'
                  }`}
                >
                  {msg.text}

                  {isBot && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSpeech(msg.id, msg.text)}
                          className={`px-2 py-0.5 flex items-center gap-1 border transition-colors ${
                            isSpeaking
                              ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
                              : 'bg-slate-50 text-slate-600 hover:text-blue-800 border-slate-200'
                          }`}
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-3 h-3 text-red-600 animate-pulse" />
                              <span>Arrêter la voix</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-slate-500" />
                              <span>Écouter la réponse</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="px-2 py-0.5 bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center gap-1"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500" />
                          )}
                          <span>Copier</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>DTECH TOGO</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-white border border-blue-200 p-3 shadow-xs w-fit">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
                alt="Koffi" 
                className="w-5 h-5 rounded-full object-cover border border-amber-400"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-700 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-700 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-blue-700 animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="ml-1 text-slate-600 font-medium">M. Koffi MENSAH formule son avis d'orientation...</span>
            </div>
          )}
        </div>

        {/* Formulaire de Saisie Réaliste */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(customQuestion);
          }}
          className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch gap-3"
        >
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Posez votre question à M. Koffi (Ex: J'ai un BTS Comptabilité, comment m'insérer rapidement ?)"
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 px-4 py-3 focus:outline-none focus:border-blue-700 focus:bg-white placeholder-slate-400"
          />

          <button
            type="submit"
            disabled={isLoading || !customQuestion.trim()}
            className="px-6 py-3 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Demander conseil</span>
          </button>
        </form>
      </div>

      {/* Catalogue Référentiel Rapide */}
      <div className="bg-white p-6 border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-wider">
              Les 6 Formations Certifiantes Recommandées
            </h4>
            <p className="text-xs text-slate-600">
              Cohortes ouvertes aux inscriptions à Lomé (Tokoin) et Kara avec facilités T-Money (*145#) et Flooz (*155#).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Voir le catalogue complet</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((course) => {
            const tr1 = Math.round(course.priceFCFA * 0.6);
            const tr2 = course.priceFCFA - tr1;

            return (
              <div 
                key={course.id}
                className="p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-400 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-800">{course.code}</span>
                    <span className="font-black text-slate-900">{course.priceFCFA.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 line-clamp-1">
                    {course.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="bg-amber-50 p-1.5 border border-amber-200 text-[10px] text-amber-900 font-medium">
                    <span>2 Tranches : <strong>{tr1.toLocaleString('fr-FR')} F</strong> (60%) + <strong>{tr2.toLocaleString('fr-FR')} F</strong> (40%)</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectCourse(course)}
                    className="font-bold text-slate-700 hover:text-blue-700 cursor-pointer"
                  >
                    Détails
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnrollCourse(course)}
                    className="px-2.5 py-1 bg-blue-700 text-white font-bold text-[11px] hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    S'inscrire
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
