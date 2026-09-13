import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  ChevronRight, 
  GraduationCap, 
  Smartphone, 
  BookOpen, 
  MapPin, 
  ShieldCheck, 
  Maximize2, 
  Minimize2,
  ExternalLink,
  Phone,
  MessageCircle,
  Volume2,
  VolumeX,
  Calculator,
  CheckCheck,
  Building2,
  Clock,
  Award,
  FileText,
  HelpCircle,
  Calendar,
  Briefcase,
  Users,
  CheckCircle2,
  Info
} from 'lucide-react';
import { aiService, ChatMessage } from '../services/aiService';
import { PlatformCourse } from '../types';
import { DTECH_INSTITUTIONAL_DATA } from '../data/dtechPlatformData';
import advisorPortrait from '../assets/images/koffi_advisor_portrait_1786877826179.jpg';

interface AIAssistantWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
  onSelectCourse?: (course: PlatformCourse) => void;
  onEnrollCourse?: (course: PlatformCourse) => void;
  courses?: PlatformCourse[];
}

type WidgetTab = 'chat' | 'admissions' | 'simulator';

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  isOpen,
  onToggle,
  onNavigate,
  onSelectCourse,
  onEnrollCourse,
  courses = []
}) => {
  const [activeTab, setActiveTab] = useState<WidgetTab>('chat');

  const welcomeMessage: ChatMessage = {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `### Cabinet DTECH GROUP & INSTITUT SUPÉRIEUR DELXIA\n*Agrément Officiel N° 003 / METFP / CAB / SE-CPO*\n\nBonjour et bienvenue. Je suis **M. Koffi MENSAH**, Conseiller Pédagogique Principal et Chef du Service des Admissions.\n\nJe suis à votre disposition pour vous orienter vers la filière diplômante d'État ou le module de perfectionnement qui valorisera votre carrière pour la rentrée solennelle du **14 Septembre 2026**.\n\nNotre formule d'excellence : **9 MOIS DE FORMATION INTENSIVE + 3 MOIS DE STAGES EN ENTREPRISE GARANTIS** dans nos **7 centres au Togo** (Lomé Avédji, Avépozo, Kpalimé, Atakpamé, Sokodé, Kara, Dapaong).\n\nNos facilités de scolarité permettent un échelonnement : **60% à l'inscription et 40% au 5ème mois** par **Togocom T-Money (*145#)** ou **Moov Flooz (*155#)**.\n\nQuelle filière ou question souhaitez-vous aborder aujourd'hui ?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedSimulatorCourseId, setSelectedSimulatorCourseId] = useState<string>(
    courses[0]?.id || 'secretariat-direction-bilingue'
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Réponses pré-formatées basées sur les données réelles de DTECH GROUP
  const preformattedTopics = [
    {
      id: 'admission-docs',
      icon: <FileText className="w-3.5 h-3.5 text-blue-600" />,
      label: '📋 Dossier & Pièces requises',
      category: 'Admission',
      query: 'Quelles sont les pièces officielles à fournir pour constituer mon dossier d\'inscription ?'
    },
    {
      id: 'center-formula',
      icon: <Award className="w-3.5 h-3.5 text-amber-600" />,
      label: '⏳ 9 Mois + 3 Mois de stage',
      category: 'Pédagogie',
      query: 'Comment fonctionne la formule 9 mois de cours + 3 mois de stage garanti en entreprise ?'
    },
    {
      id: 'centers-7-tg',
      icon: <MapPin className="w-3.5 h-3.5 text-emerald-600" />,
      label: '📍 7 Centres & Contacts au Togo',
      category: 'Implantation',
      query: 'Quelles sont les adresses exactes et numéros de téléphone de vos 7 centres au Togo ?'
    },
    {
      id: 'tuition-installment',
      icon: <Smartphone className="w-3.5 h-3.5 text-purple-600" />,
      label: '💳 Paiement 60% + 40% T-Money/Flooz',
      category: 'Finances',
      query: 'Comment s\'organise l\'échelonnement en 2 tranches (60% puis 40%) par T-Money (*145#) et Flooz (*155#) ?'
    },
    {
      id: 'courses-state-diplomas',
      icon: <GraduationCap className="w-3.5 h-3.5 text-blue-800" />,
      label: '🎓 6 Filières Diplômantes d\'État',
      category: 'Programmes',
      query: 'Présentez-moi les 6 filières longues diplômantes d\'État reconnues par le Ministère (METFP).'
    },
    {
      id: 'schedule-day-night',
      icon: <Clock className="w-3.5 h-3.5 text-slate-700" />,
      label: '🕒 Horaires Jour (8h30) / Soir (18h30)',
      category: 'Organisation',
      query: 'Quels sont les créneaux horaires des cours du jour et du soir pour les étudiants et travailleurs ?'
    }
  ];

  // Auto-scroll
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading, activeTab]);

  // Focus
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, activeTab]);

  // Arrêter la voix si fermeture du chat
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  }, [isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    if (activeTab !== 'chat') {
      setActiveTab('chat');
    }

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customText) setInputQuery('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'msg_welcome')
        .map(m => ({
          role: m.sender === 'assistant' ? ('model' as const) : ('user' as const),
          text: m.text
        }));

      const res = await aiService.askAdvisor(textToSend.trim(), history);

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      const fallback = aiService.getLocalFallback(textToSend.trim());
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: fallback.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setMessages([
      {
        ...welcomeMessage,
        id: `msg_welcome_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Lecture Vocale Réaliste (Text to Speech)
  const handleToggleSpeech = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/###/g, '')
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

  // Parser Markdown Institutionnel
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h5 key={idx} className="font-black text-blue-950 text-xs sm:text-sm mt-2 mb-1.5 border-b border-blue-100 pb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 inline-block"></span>
            {line.replace('### ', '')}
          </h5>
        );
      }

      if (line.startsWith('#### ')) {
        return (
          <h6 key={idx} className="font-bold text-slate-900 text-xs mt-1.5 mb-1">
            {line.replace('#### ', '')}
          </h6>
        );
      }
      
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.substring(2);
        return (
          <li key={idx} className="ml-3 list-disc text-xs leading-relaxed text-slate-800 my-0.5">
            {renderFormattedInline(content)}
          </li>
        );
      }

      const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-800 my-1">
            <span className="font-black text-blue-900 bg-blue-50 px-1 py-0.2 border border-blue-200 text-[10px] shrink-0">
              {numberedMatch[1]}
            </span>
            <span className="leading-relaxed">{renderFormattedInline(numberedMatch[2])}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="text-xs leading-relaxed text-slate-800 my-0.5">
          {renderFormattedInline(line)}
        </p>
      );
    });
  };

  const renderFormattedInline = (str: string) => {
    const parts = [];
    let remaining = str;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      const codeMatch = remaining.match(/`(.*?)`/);
      const italicMatch = remaining.match(/\*(.*?)\*/);

      let earliestMatch = null;
      let matchType = null;
      let matchIndex = Infinity;

      if (boldMatch && boldMatch.index !== undefined && boldMatch.index < matchIndex) {
        matchIndex = boldMatch.index;
        earliestMatch = boldMatch;
        matchType = 'bold';
      }

      if (codeMatch && codeMatch.index !== undefined && codeMatch.index < matchIndex) {
        matchIndex = codeMatch.index;
        earliestMatch = codeMatch;
        matchType = 'code';
      }

      if (!earliestMatch && italicMatch && italicMatch.index !== undefined && italicMatch.index < matchIndex) {
        matchIndex = italicMatch.index;
        earliestMatch = italicMatch;
        matchType = 'italic';
      }

      if (!earliestMatch || matchIndex === Infinity) {
        parts.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      }

      if (matchIndex > 0) {
        parts.push(<span key={keyIdx++}>{remaining.substring(0, matchIndex)}</span>);
      }

      if (matchType === 'bold') {
        parts.push(<strong key={keyIdx++} className="font-black text-slate-950">{earliestMatch[1]}</strong>);
        remaining = remaining.substring(matchIndex + earliestMatch[0].length);
      } else if (matchType === 'code') {
        parts.push(
          <code key={keyIdx++} className="bg-slate-200 text-blue-900 font-mono px-1 py-0.5 text-[11px] font-bold">
            {earliestMatch[1]}
          </code>
        );
        remaining = remaining.substring(matchIndex + earliestMatch[0].length);
      } else if (matchType === 'italic') {
        parts.push(<em key={keyIdx++} className="italic text-slate-700">{earliestMatch[1]}</em>);
        remaining = remaining.substring(matchIndex + earliestMatch[0].length);
      }
    }

    return parts;
  };

  const currentSimCourse = courses.find(c => c.id === selectedSimulatorCourseId) || courses[0] || {
    id: 'secretariat-direction-bilingue',
    title: 'Secrétariat de Direction Bilingue',
    priceFCFA: 180000,
    durationWeeks: 36
  };

  const tranche1 = Math.round(currentSimCourse.priceFCFA * 0.6);
  const tranche2 = currentSimCourse.priceFCFA - tranche1;

  return (
    <>
      {/* Bouton Flottant Déclencheur Circulaire Stylisé */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
          <button
            type="button"
            id="ai-assistant-floating-btn"
            onClick={onToggle}
            className="h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-slate-900 text-white shadow-2xl flex items-center justify-center border-3 border-amber-400 hover:border-amber-300 hover:scale-105 transition-all cursor-pointer group relative overflow-hidden ring-4 ring-slate-950/30"
            title="Consulter M. Koffi MENSAH (Conseiller Pédagogique Principal)"
            aria-label="Conseiller Pédagogique DTECH GROUP & DELXIA"
          >
            <img 
              src={advisorPortrait} 
              alt="M. Koffi Mensah" 
              className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-slate-950/50 via-transparent to-transparent"></div>
            <span className="w-4 h-4 rounded-full bg-emerald-400 absolute bottom-1 right-1 border-2 border-slate-900 shadow-md animate-pulse"></span>
          </button>
        </div>
      )}

      {/* Fenêtre Interactive du Conseiller IA (Design Institutionnel Supérieur) */}
      {isOpen && (
        <div 
          id="ai-assistant-modal-container"
          className={`fixed z-50 transition-all duration-300 shadow-2xl flex flex-col bg-white border-2 border-slate-800 ${
            isExpanded
              ? 'inset-2 sm:inset-6 md:inset-8 max-w-5xl mx-auto'
              : 'bottom-2 sm:bottom-4 right-2 sm:right-4 w-[calc(100vw-16px)] sm:w-[480px] h-[640px] max-h-[94vh]'
          }`}
        >
          {/* En-tête Institutionnel Solennel */}
          <div className="bg-slate-950 text-white p-3.5 sm:p-4 flex items-center justify-between border-b-2 border-amber-400 select-none">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img 
                  src={advisorPortrait} 
                  alt="M. Koffi Mensah" 
                  className="w-12 h-12 object-cover border-2 border-amber-400 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 border-2 border-slate-950"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black tracking-tight text-white">
                    M. Koffi MENSAH
                  </h4>
                  <span className="text-[8.5px] font-black px-1.5 py-0.5 bg-amber-400 text-slate-950 uppercase tracking-wide">
                    CHEF ADMISSIONS
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                  Cabinet DTECH GROUP & DELXIA • 7 Centres au Togo
                </div>
                <div className="text-[9.5px] text-amber-300/90 font-mono">
                  {DTECH_INSTITUTIONAL_DATA.accreditationNumber}
                </div>
              </div>
            </div>

            {/* Actions d'en-tête */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
                title="Réinitialiser l'échange"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
                title={isExpanded ? 'Réduire la fenêtre' : 'Agrandir la fenêtre'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onToggle}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-850 transition-colors ml-1"
                title="Fermer l'assistant"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation par Onglets Institutionnels */}
          <div className="bg-slate-900 text-slate-300 flex border-b border-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'border-amber-400 text-white bg-slate-850'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>Conseiller IA Direct</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admissions')}
              className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'admissions'
                  ? 'border-amber-400 text-white bg-slate-850'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Modalités & 7 Centres</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'simulator'
                  ? 'border-amber-400 text-white bg-slate-850'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulateur 60%/40%</span>
            </button>
          </div>

          {/* Bandeau d'état administratif & Permanence WhatsApp */}
          <div className="bg-slate-100 px-3.5 py-1.5 text-slate-700 flex items-center justify-between text-[10.5px] border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-bold text-slate-900">Permanence Admissions Ouverte</span>
              <span className="text-slate-500 hidden sm:inline">• Rentrée : 14 Sept. 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href="https://wa.me/22892898979?text=Bonjour%20M.%20Koffi%20Mensah,%20je%20souhaite%20des%20informations%20officielles%20sur%20les%20admissions%20DTECH%20GROUP" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 text-[10px]"
              >
                <MessageCircle className="w-3 h-3 text-emerald-700" />
                <span>WhatsApp (+228 92 89 89 79)</span>
              </a>
            </div>
          </div>

          {/* CONTENU PRINCIPAL SELON L'ONGLET SÉLECTIONNÉ */}
          
          {/* ONGLET 1: DISCUSSION / CONSEIL DIRECT */}
          {activeTab === 'chat' && (
            <>
              {/* Zone de Défilement des Messages */}
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-slate-50">
                {messages.map((msg) => {
                  const isAssistant = msg.sender === 'assistant';
                  const isSpeaking = speakingMessageId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        {isAssistant && (
                          <span className="text-[10px] font-black text-blue-950 uppercase flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-blue-700" />
                            M. Koffi MENSAH (Admissions)
                          </span>
                        )}
                        {!isAssistant && (
                          <span className="text-[10px] font-bold uppercase text-slate-500">
                            Vous (Candidat)
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">• {msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3.5 sm:p-4 max-w-[94%] sm:max-w-[88%] border shadow-xs relative group ${
                          isAssistant
                            ? 'bg-white text-slate-900 border-slate-300 ring-1 ring-slate-200'
                            : 'bg-slate-900 text-white border-slate-950'
                        }`}
                      >
                        {isAssistant ? (
                          <div className="space-y-1.5">
                            {formatMarkdown(msg.text)}
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        )}

                        {/* Actions de message (Copie + Synthèse vocale) */}
                        {isAssistant && (
                          <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-slate-100 justify-between text-[10px] text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleSpeech(msg.id, msg.text)}
                                className={`px-2 py-1 flex items-center gap-1 border transition-colors cursor-pointer ${
                                  isSpeaking
                                    ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold'
                                    : 'bg-slate-50 text-slate-700 hover:text-blue-900 border-slate-200 hover:bg-slate-100'
                                }`}
                                title={isSpeaking ? "Arrêter la lecture" : "Écouter la voix de M. Koffi"}
                              >
                                {isSpeaking ? (
                                  <>
                                    <VolumeX className="w-3 h-3 text-red-600 animate-pulse" />
                                    <span className="text-[9.5px]">Lecture en cours...</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3 text-slate-600" />
                                    <span className="text-[9.5px]">Écouter</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyMessage(msg.id, msg.text)}
                                className="px-2 py-1 flex items-center gap-1 bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Copier la réponse"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-500" />
                                )}
                                <span className="text-[9.5px]">Copier</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-1 text-[9.5px] font-mono text-slate-400">
                              <CheckCheck className="w-3.5 h-3.5 text-blue-700" />
                              <span>DTECH & DELXIA</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Indicateur de traitement */}
                {isLoading && (
                  <div className="flex flex-col items-start animate-fade-in">
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-blue-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                        M. Koffi MENSAH consulte les registres pédagogiques...
                      </span>
                    </div>
                    <div className="p-3 bg-white border border-blue-300 text-slate-800 flex items-center gap-3 shadow-xs">
                      <img 
                        src={advisorPortrait} 
                        alt="Koffi" 
                        className="w-7 h-7 rounded-full object-cover border border-amber-400"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-800 animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-800 animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-blue-800 animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                      <span className="text-xs text-slate-600 font-medium">Recherche de réponse institutionnelle...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions de questions rapides officielles */}
              <div className="p-2.5 bg-slate-100 border-t border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block mb-1.5 px-1">
                  Questions fréquentes posées au service des admissions :
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pb-0.5">
                  {preformattedTopics.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSendMessage(item.query)}
                      disabled={isLoading}
                      className="text-[11px] font-semibold px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-900 text-slate-800 border border-slate-300 hover:border-blue-400 transition-colors disabled:opacity-50 text-left whitespace-nowrap cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulaire d'envoi du message */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  id="ai-assistant-input"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Posez votre question à M. Koffi (admission, pièces, 7 centres, T-Money...)"
                  disabled={isLoading}
                  className="flex-1 bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 px-3 py-2.5 focus:outline-none focus:border-blue-800 focus:bg-white placeholder-slate-400 disabled:bg-slate-100"
                />

                <button
                  type="submit"
                  id="ai-assistant-submit-btn"
                  disabled={isLoading || !inputQuery.trim()}
                  className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Envoyer</span>
                </button>
              </form>
            </>
          )}

          {/* ONGLET 2: MODALITÉS D'ADMISSION & RÉSEAU DES 7 CENTRES */}
          {activeTab === 'admissions' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 text-xs text-slate-800">
              
              {/* Cadre institutionnel Agrément */}
              <div className="bg-white border-l-4 border-amber-500 p-3.5 shadow-2xs border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span className="font-black text-slate-900 uppercase text-[11px]">
                    Cadre Juridique & Reconnaissance Nationale
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Formations dispensées sous l'<strong>{DTECH_INSTITUTIONAL_DATA.accreditationNumber}</strong> en partenariat avec <strong>{DTECH_INSTITUTIONAL_DATA.partner}</strong>. Diplômes d'État reconnus par le Ministère de l'Enseignement Technique (METFP).
                </p>
                <div className="mt-2 inline-block bg-amber-100 text-amber-900 font-bold px-2 py-0.5 text-[10px]">
                  Rentrée Solennelle Nationale : 14 Septembre 2026
                </div>
              </div>

              {/* Pièces à fournir */}
              <div className="bg-white p-3.5 border border-slate-200 shadow-2xs space-y-2">
                <h5 className="font-black text-blue-950 uppercase text-[11px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  Pièces Officielles pour le Dossier d'Admission
                </h5>
                <ul className="space-y-1.5 text-[11px] text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Fiche d'inscription officielle</strong> renseignée et signée (en ligne ou au guichet).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Deux (02) photos d'identité couleur récentes</strong> sur fond blanc.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Une (01) photocopie légalisée</strong> de la CNI, du Passeport ou de l'Acte de Naissance.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Une (01) copie du dernier diplôme ou attestation</strong> (BEPC, BAC 1, BAC 2, BTS, Licence, etc.).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Versement de la 1ère tranche (60%)</strong> des frais de scolarité.</span>
                  </li>
                </ul>
              </div>

              {/* Formule Pédagogique & Stages */}
              <div className="bg-white p-3.5 border border-slate-200 shadow-2xs space-y-2">
                <h5 className="font-black text-blue-950 uppercase text-[11px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  Formule d'Apprentissage & Stages Garantis
                </h5>
                <div className="grid grid-cols-2 gap-2 text-center text-[10.5px]">
                  <div className="bg-slate-50 p-2 border border-slate-200">
                    <span className="block font-black text-blue-900 text-xs">9 MOIS</span>
                    <span className="text-slate-600">Formation Pratique (80% TP)</span>
                  </div>
                  <div className="bg-slate-50 p-2 border border-slate-200">
                    <span className="block font-black text-emerald-800 text-xs">3 MOIS</span>
                    <span className="text-slate-600">Stage garanti en entreprise</span>
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-600">
                  Créneaux au choix : <strong>Cours du jour (08h30 - 12h30)</strong> ou <strong>Cours du soir (18h30 - 20h30)</strong>.
                </p>
              </div>

              {/* Réseau des 7 Centres */}
              <div className="bg-white p-3.5 border border-slate-200 shadow-2xs space-y-2">
                <h5 className="font-black text-blue-950 uppercase text-[11px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  Réseau des 7 Centres DTECH GROUP au Togo
                </h5>
                <div className="space-y-1.5 text-[10.5px]">
                  {DTECH_INSTITUTIONAL_DATA.centers.map((c) => (
                    <div key={c.city} className="flex items-center justify-between bg-slate-50 p-1.5 border border-slate-200">
                      <div>
                        <strong className="text-slate-900">{c.city}</strong>
                        <span className="text-slate-500 ml-1">({c.landmark})</span>
                      </div>
                      <a href={`tel:${c.phone}`} className="font-mono font-bold text-blue-800 hover:underline">
                        {c.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton d'action directe vers le chat */}
              <button
                type="button"
                onClick={() => handleSendMessage('Je souhaite être orienté personnellement pour constituer mon dossier d\'inscription.')}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Poser une question à M. Koffi sur les admissions</span>
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          )}

          {/* ONGLET 3: SIMULATEUR DE PAIEMENT ÉCHELONNÉ */}
          {activeTab === 'simulator' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 text-xs text-slate-800">
              
              <div className="bg-amber-50 border border-amber-200 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase">
                  <Calculator className="w-4 h-4 text-amber-700" />
                  <span>Calculateur d'Échelonnement Officiel (60% + 40%)</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Conformément aux modalités DTECH GROUP, les frais de formation sont payables en 2 tranches par <strong>Togocom T-Money (*145#)</strong> ou <strong>Moov Flooz (*155#)</strong>.
                </p>
              </div>

              {/* Sélecteur de formation */}
              <div className="bg-white p-3.5 border border-slate-200 shadow-2xs space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Sélectionner la filière d'État ou le module :
                </label>
                <select
                  value={selectedSimulatorCourseId}
                  onChange={(e) => setSelectedSimulatorCourseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-xs p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} — {c.priceFCFA.toLocaleString('fr-FR')} FCFA
                    </option>
                  ))}
                </select>
              </div>

              {/* Grille de répartition 60% / 40% */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border-2 border-blue-700 p-3 text-center shadow-xs">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">1ère Tranche (60%)</span>
                  <span className="text-sm font-black text-blue-900 mt-1 block">
                    {tranche1.toLocaleString('fr-FR')} <span className="text-[10px]">FCFA</span>
                  </span>
                  <span className="inline-block mt-1 text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2">
                    À l'inscription
                  </span>
                </div>

                <div className="bg-white border-2 border-slate-300 p-3 text-center shadow-xs">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">2ème Tranche (40%)</span>
                  <span className="text-sm font-black text-slate-900 mt-1 block">
                    {tranche2.toLocaleString('fr-FR')} <span className="text-[10px]">FCFA</span>
                  </span>
                  <span className="inline-block mt-1 text-[9.5px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2">
                    Au 5ème mois
                  </span>
                </div>
              </div>

              {/* Codes USSD de validation */}
              <div className="bg-white p-3.5 border border-slate-200 shadow-2xs space-y-2">
                <h6 className="font-bold text-slate-900 uppercase text-[10.5px]">
                  Instructions de Paiement Mobile au Togo :
                </h6>
                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  <div className="bg-blue-50 border border-blue-200 p-2">
                    <strong className="block text-blue-900">Togocom T-Money</strong>
                    <span className="font-mono text-xs font-bold text-slate-900">*145#</span>
                    <p className="text-[9.5px] text-slate-600 mt-0.5">Validation sur le compte officiel DTECH GROUP</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-2">
                    <strong className="block text-emerald-900">Moov Money (Flooz)</strong>
                    <span className="font-mono text-xs font-bold text-slate-900">*155#</span>
                    <p className="text-[9.5px] text-slate-600 mt-0.5">Validation sécurisée avec reçu horodaté</p>
                  </div>
                </div>
              </div>

              {/* Actions d'inscription */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onEnrollCourse) {
                      onEnrollCourse(currentSimCourse as any);
                    }
                  }}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Valider mon inscription pour cette formation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSendMessage(`Pouvez-vous me détailler le programme de la formation "${currentSimCourse.title}" et les débouchés associés ?`);
                  }}
                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Demander conseil à M. Koffi sur ce programme
                </button>
              </div>

            </div>
          )}

          {/* Pied Institutionnel avec Infoline et Mentions */}
          <div className="bg-slate-950 px-3.5 py-2 text-center text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>DTECH & DELXIA • 7 Centres Togo</span>
            </span>
            <a 
              href="tel:+22892898979"
              className="text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>(+228) 92 89 89 79</span>
            </a>
          </div>

        </div>
      )}
    </>
  );
};
