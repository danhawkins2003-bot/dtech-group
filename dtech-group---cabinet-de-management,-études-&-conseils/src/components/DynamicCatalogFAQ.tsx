import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Smartphone, 
  CreditCard, 
  GraduationCap, 
  ShieldCheck, 
  MapPin, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  PhoneCall, 
  Clock, 
  Layers, 
  DollarSign, 
  Award,
  Star
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'payment' | 'enrollment' | 'certificate' | 'centers';
  categoryLabel: string;
  question: string;
  answer: string | React.ReactNode;
  highlights?: string[];
  popular?: boolean;
}

export const DynamicCatalogFAQ: React.FC<{ onContactClick?: () => void }> = ({ onContactClick }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('faq_tmoney');

  const faqItems: FaqItem[] = [
    {
      id: 'faq_tmoney',
      category: 'payment',
      categoryLabel: 'Paiements Mobiles Togo',
      popular: true,
      question: 'Comment effectuer le paiement de ma formation via T-Money (Togocom) ?',
      highlights: ['Paiement instantané', 'Code USSD *145#', 'Reçu numérique immédiat'],
      answer: (
        <div className="space-y-3">
          <p className="text-slate-700 leading-relaxed">
            Le règlement via <strong>Togocom T-Money</strong> est entièrement sécurisé et automatisé au Togo.
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700 text-xs">
            <li>Lors de votre inscription, sélectionnez l'option <strong>T-Money (Togocom)</strong>.</li>
            <li>Renseignez votre numéro de téléphone Togocom (ex: <code>90 XX XX XX</code> ou <code>91 XX XX XX</code>).</li>
            <li>Validez le formulaire puis composez sur votre téléphone la commande <strong>*145#</strong> pour approuver le débit vers le compte marchand agréé DTECH GROUP.</li>
            <li>Dès confirmation, votre statut passe en <em>"Payé"</em> et votre reçu officiel avec QR Code est disponible dans votre espace étudiant.</li>
          </ol>
        </div>
      )
    },
    {
      id: 'faq_flooz',
      category: 'payment',
      categoryLabel: 'Paiements Mobiles Togo',
      popular: true,
      question: 'Comment payer via Moov Money / Flooz ?',
      highlights: ['Moov Africa Togo', 'Code USSD *155#', '0% de frais masqués'],
      answer: (
        <div className="space-y-3">
          <p className="text-slate-700 leading-relaxed">
            Pour régler avec <strong>Moov Money (Flooz)</strong> :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-xs">
            <li>Sélectionnez l'option <strong>Flooz / Moov Money</strong> au moment du paiement.</li>
            <li>Saisissez votre numéro Moov (ex: <code>98 XX XX XX</code> ou <code>99 XX XX XX</code>).</li>
            <li>Vous recevrez un push de validation ou composerez <strong>*155#</strong> pour saisir votre code secret Moov Money.</li>
            <li>Votre place dans la cohorte est verrouillée dès validation du paiement.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'faq_installment',
      category: 'payment',
      categoryLabel: 'Paiements Mobiles Togo',
      question: 'Est-il possible d\'échelonner le paiement de ma formation en plusieurs tranches ?',
      highlights: ['Paiement en 2 tranches', 'Accompagnement étudiants'],
      answer: (
        <div className="space-y-2 text-slate-700 leading-relaxed">
          <p>
            <strong>Oui, absolument.</strong> DTECH GROUP propose un paiement échelonné pour toutes les formations certifiantes :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>1ère tranche (60%) :</strong> À régler au moment de l'inscription pour réserver votre place et débloquer l'accès aux supports pédagogiques.</li>
            <li><strong>2ème tranche (40%) :</strong> À régler à mi-parcours de la formation, avant le début des ateliers pratiques finaux et l'examen de certification.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'faq_cash_agency',
      category: 'payment',
      categoryLabel: 'Paiements Mobiles Togo',
      question: 'Puis-je payer en espèces directement aux sièges de Lomé ou de Kara ?',
      highlights: ['Paiement guichet', 'Siège Tokoin Lomé', 'Pôle Kara'],
      answer: (
        <p className="text-slate-700 leading-relaxed">
          Oui, vous pouvez initier votre pré-inscription en ligne en choisissant <em>"Espèces au Guichet"</em>, puis vous présenter sous 48h au secrétariat de notre <strong>Siège de Lomé (Boulevard du 13 Janvier / Tokoin)</strong> ou de notre <strong>Centre de Kara (Quartier Commercial)</strong>. Un reçu physique à souche fiscale et un reçu électronique vous seront remis.
        </p>
      )
    },
    {
      id: 'faq_enrollment_steps',
      category: 'enrollment',
      categoryLabel: 'Processus d\'Inscription',
      popular: true,
      question: 'Quelles sont les étapes pour finaliser mon inscription à une formation ?',
      highlights: ['3 étapes simples', '100% en ligne ou sur place'],
      answer: (
        <div className="space-y-2 text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-2 text-xs">
            <div className="p-2.5 bg-blue-50 border border-blue-200">
              <strong className="block text-blue-900 font-bold mb-0.5">1. Choix du créneau</strong>
              <span>Sélectionnez votre centre (Lomé ou Kara) et votre horaire (Jour ou Soir).</span>
            </div>
            <div className="p-2.5 bg-indigo-50 border border-indigo-200">
              <strong className="block text-indigo-900 font-bold mb-0.5">2. Informations</strong>
              <span>Renseignez votre nom complet (pour le certificat) et votre téléphone.</span>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200">
              <strong className="block text-emerald-900 font-bold mb-0.5">3. Règlement</strong>
              <span>Payez via T-Money / Flooz ou validez votre pré-inscription guichet.</span>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Une fois inscrit, vous recevez vos identifiants pour vous connecter à l'espace étudiant sécurisé et accéder aux cours.
          </p>
        </div>
      )
    },
    {
      id: 'faq_prerequisites',
      category: 'enrollment',
      categoryLabel: 'Processus d\'Inscription',
      question: 'Faut-il avoir des diplômes ou un niveau particulier pour s\'inscrire ?',
      highlights: ['Tous niveaux', 'Accompagnement personnalisé'],
      answer: (
        <p className="text-slate-700 leading-relaxed">
          Nos formations sont modulaires et conçues aussi bien pour les débutants que pour les professionnels en reconversion ou perfectionnement. Aucun diplôme universitaire spécifique n'est exigé, sauf pour certaines formations avancées (ex: <em>Business Intelligence & Data</em> ou <em>Fiscalité Avancée OTR</em>) où des notions de base en bureautique ou comptabilité sont recommandées.
        </p>
      )
    },
    {
      id: 'faq_schedule_switch',
      category: 'enrollment',
      categoryLabel: 'Processus d\'Inscription',
      question: 'Puis-je changer d\'horaire (cours du jour vers cours du soir) en cours de formation ?',
      highlights: ['Flexibilité horaires', '7 Centres au Togo'],
      answer: (
        <p className="text-slate-700 leading-relaxed">
          Oui, sous réserve de places disponibles dans la cohorte souhaitée. Il vous suffit d'adresser une demande au secrétariat pédagogique de votre centre ou via votre espace étudiant au moins 48 heures avant la session concernée.
        </p>
      )
    },
    {
      id: 'faq_cert_value',
      category: 'certificate',
      categoryLabel: 'Certificats & Débouchés',
      popular: true,
      question: 'Quelle est la valeur du Certificat Professionnel DTECH GROUP ?',
      highlights: ['QR Code sécurisé', 'Conforme normes OHADA / OTR', 'Vérifiable en ligne'],
      answer: (
        <div className="space-y-2 text-slate-700 leading-relaxed">
          <p>
            Le certificat délivré par <strong>DTECH GROUP</strong> atteste de votre maîtrise opérationnelle sur des cas réels d'entreprises. Il comprend :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Un <strong>numéro d'authentification unique</strong> (ex: <code>DTECH-2026-TG-XXXX</code>).</li>
            <li>Un <strong>QR Code infalsifiable</strong> permettant aux employeurs et recruteurs de vérifier la validité de votre parchemin instantanément sur notre plateforme publique.</li>
            <li>La mention des compétences acquises, des heures effectuées et du pôle d'ingénierie formateur.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'faq_equipment',
      category: 'centers',
      categoryLabel: 'Centres au Togo',
      question: 'Dois-je obligatoirement apporter mon propre ordinateur portable aux cours ?',
      highlights: ['Salles informatiques équipées', 'Connexion haut débit'],
      answer: (
        <p className="text-slate-700 leading-relaxed">
          Non, ce n'est pas obligatoire. L'ensemble de nos <strong>7 centres au Togo</strong> disposent de salles climatisées entièrement équipées d'ordinateurs performants avec les logiciels professionnels installés (Suite Adobe, Sage 100, Power BI Desktop, VS Code, etc.). Cependant, disposer de son propre ordinateur à domicile est un atout pour pratiquer entre les séances.
        </p>
      )
    },
    {
      id: 'faq_hybrid_remote',
      category: 'centers',
      categoryLabel: 'Centres au Togo',
      question: 'Est-il possible de suivre les formations en ligne si l\'on réside loin d\'un centre physique ?',
      highlights: ['Accès hybride', 'Replays & supports téléchargeables'],
      answer: (
        <p className="text-slate-700 leading-relaxed">
          Oui, toutes nos formations disposent d'un accès hybride : vous pouvez assister aux webinaires en direct, visionner les rediffusions et télécharger l'ensemble des polycopiés et travaux dirigés depuis votre <strong>Espace Étudiant DTECH 2.0</strong>.
        </p>
      )
    }
  ];

  const categories = [
    { id: 'all', label: 'Toutes les questions', icon: Layers },
    { id: 'payment', label: 'Paiements Mobiles (T-Money / Flooz)', icon: Smartphone },
    { id: 'enrollment', label: 'Processus d\'Inscription', icon: FileText },
    { id: 'certificate', label: 'Certificats & Débouchés', icon: Award },
    { id: 'centers', label: 'Nos 7 Centres au Togo', icon: MapPin }
  ];

  const filteredFaqs = useMemo(() => {
    return faqItems.filter(item => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        item.question.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query) ||
        (typeof item.answer === 'string' && item.answer.toLowerCase().includes(query));
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div id="faq-formations" className="w-full">
      
      {/* En-tête de section FAQ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-widest mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
            <span>Foire Aux Questions • Inscriptions & Paiements</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Questions Fréquentes sur les Formations & Paiements Mobiles
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Tout ce que vous devez savoir pour vous inscrire, valider votre paiement sécurisé T-Money / Flooz et débuter votre apprentissage à Lomé ou Kara.
          </p>
        </div>

        {/* Barre de Recherche dans la FAQ */}
        <div className="relative w-full md:w-72 shrink-0">
          <input
            type="text"
            placeholder="Rechercher une réponse (ex: T-Money, tranches...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs text-slate-900 pl-9 pr-3 py-2.5 shadow-2xs focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Onglets Filtres de Catégories */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grille / Liste d'Accordéons FAQ */}
      {filteredFaqs.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">
            Aucune question ne correspond à votre recherche <strong>"{searchQuery}"</strong>.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
          >
            Réinitialiser les filtres de recherche
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white border transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer group"
                >
                  <div className="space-y-1.5 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
                        {faq.categoryLabel}
                      </span>
                      {faq.popular && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-amber-700" />
                          Fréquent
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {faq.question}
                    </h4>
                  </div>

                  <div className={`p-1.5 rounded-full shrink-0 mt-1 transition-transform duration-200 ${
                    isOpen ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 border-t border-slate-100 bg-slate-50/50 space-y-3">
                    {faq.highlights && faq.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {faq.highlights.map((h, i) => (
                          <span key={i} className="text-[11px] font-bold text-blue-900 bg-blue-100/70 border border-blue-200 px-2 py-0.5 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-blue-700" />
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bloc de support et contact direct */}
      <div className="mt-8 p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white border border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1.5 text-center sm:text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
            Besoin d'une assistance immédiate ?
          </span>
          <h4 className="text-base sm:text-lg font-bold text-white">
            Une question spécifique sur votre paiement ou inscription ?
          </h4>
          <p className="text-xs text-slate-300 max-w-xl">
            Notre secrétariat académique et notre service financier vous répondent par WhatsApp, appel direct ou aux guichets de Lomé et Kara.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href="tel:+22890451234"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>+228 90 45 12 34</span>
          </a>
          <a
            href="https://wa.me/22890451234"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>WhatsApp Direct</span>
          </a>
        </div>
      </div>

    </div>
  );
};
