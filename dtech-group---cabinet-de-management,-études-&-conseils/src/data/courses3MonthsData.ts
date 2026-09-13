import { PlatformCourse } from '../types';
import graphicDesignImg from '../assets/images/graphic_design_studio_1786816754120.jpg';
import webDevImg from '../assets/images/web_development_lab_1786816765641.jpg';
import accountingPowerBiImg from '../assets/images/accounting_powerbi_office_1786816775337.jpg';
import heroTrainingImg from '../assets/images/hero_training_center_1786816741559.jpg';
import togoStudentsPromoImg from '../assets/images/togo_students_promo_1786957327122.jpg';
import togoGraduateSuccessImg from '../assets/images/togo_graduate_success_1786957341802.jpg';

const default3MSessions = [
  { id: 's3-lome', location: 'Lomé Avédji (Siège)', startDate: '2026-09-14', endDate: '2026-12-14', schedule: 'Matin (08h-12h) ou Soir (18h-21h)', totalSeats: 25, availableSeats: 7, instructorName: 'Expert Praticien DTECH' },
  { id: 's3-avepozo', location: 'Avépozo', startDate: '2026-09-14', endDate: '2026-12-14', schedule: 'Matin (08h-12h)', totalSeats: 20, availableSeats: 5, instructorName: 'Expert Praticien' },
  { id: 's3-kara', location: 'Kara', startDate: '2026-09-14', endDate: '2026-12-14', schedule: 'Matin & Soir', totalSeats: 20, availableSeats: 6, instructorName: 'Expert Praticien' },
  { id: 's3-sokode', location: 'Sokodé', startDate: '2026-09-14', endDate: '2026-12-14', schedule: 'Matin & Soir', totalSeats: 20, availableSeats: 5, instructorName: 'Expert Praticien' },
  { id: 's3-kpalime', location: 'Kpalimé', startDate: '2026-09-14', endDate: '2026-12-14', schedule: 'Matin & Soir', totalSeats: 20, availableSeats: 6, instructorName: 'Expert Praticien' },
  { id: 's3-atakpame', location: 'Atakpamé', startDate: '2026-09-14', endDate: '2026-12-14', schedule: 'Matin & Soir', totalSeats: 20, availableSeats: 7, instructorName: 'Expert Praticien' },
  { id: 's3-dapaong', location: 'Dapaong', startDate: '2026-09-14', endDate: '2026-12-14', schedule: 'Matin & Soir', totalSeats: 20, availableSeats: 6, instructorName: 'Expert Praticien' }
];

export const COURSES_3_MONTHS: PlatformCourse[] = [
  {
    id: 'c3-management-gestion-organisations',
    title: 'MANAGEMENT & GESTION DES ORGANISATIONS',
    category: 'Management & Projets',
    level: 'Tous niveaux',
    priceFCFA: 150000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Management & Gestion des Organisations",
    description: "Assistant de direction | Attaché commercial | Chargé d'affaires | Chargé de communication interne et du marketing. - La comptabilité |La communication - Management commercial - Management des ressources humaines Etc....",
    objectives: [
      "Maîtriser les fondements du management opérationnel et de la gestion d'équipe",
      "Piloter la communication interne, le marketing et la relation d'affaires",
      "Tenir les outils de gestion comptable et financière des organisations",
      "Pratiquer le management des ressources humaines et le leadership"
    ],
    prerequisites: 'Tous niveaux, professionnels, étudiants.',
    targetAudience: "Assistants de direction, attachés commerciaux, chargés d'affaires, managers.",
    enrolledStudentsCount: 45,
    popularRank: 1,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Management d’Équipe', 'Comptabilité Pratique', 'RH', 'Communication'],
    bannerAccentColor: 'from-blue-700 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: heroTrainingImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Management Opérationnel & Communication Interne', duration: 'Management Pro', materials: [] },
      { id: 'm2', title: 'Comptabilité Pratique & Management Commercial', duration: 'Comptabilité & Vente', materials: [] },
      { id: 'm3', title: 'Gestion des Ressources Humaines & Stage d’Immersion', duration: 'RH & Immersion', materials: [] }
    ]
  },
  {
    id: 'c3-stage-comptabilite-finance',
    title: 'STAGE DE FORMATION PRATIQUE EN COMPTABILITE FINANCE',
    category: 'Gestion & Comptabilité',
    level: 'Tous niveaux',
    priceFCFA: 42000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Comptabilité & Finance",
    description: "Acquérir Compétences solides en comptabilité & audit (entreprises et ONG) pour optimiser productivité et efficacité des pratiques financières. Programme: -SAARI Comptabilité, SAARI Paie, Excel appliqué à la gestion (Des pièces comptables aux Etats Financiers) -Réalisation de livre de paie, Fiches de stocks -Tableau d'amortissement & Etats de rapprochement, -Calculs et déclarations fiscales et sociales, -Formalités de création d'entreprise -Initiation à l'entreprenariat et à la recherche d'emploi",
    objectives: [
      "Traiter les pièces comptables jusqu'aux États Financiers sous SAARI Comptabilité",
      "Établir les livres de paie sur SAARI Paie et déclarations fiscales / sociales",
      "Élaborer les tableaux d'amortissement, fiches de stocks et états de rapprochement",
      "Réaliser les formalités de création d'entreprise et recherche d'emploi"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Comptables, gestionnaires, trésoriers, étudiants en sciences économiques et gestion.',
    enrolledStudentsCount: 95,
    popularRank: 2,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['SAARI Compta', 'SAARI Paie', 'Excel Gestion', 'Déclarations OTR/CNSS'],
    bannerAccentColor: 'from-emerald-700 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: accountingPowerBiImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'SAARI Compta & Pièces Comptables aux États Financiers', duration: 'SAARI Compta', materials: [] },
      { id: 'm2', title: 'SAARI Paie, Déclarations Fiscales & Sociales (OTR/CNSS)', duration: 'SAARI Paie & Fiscal', materials: [] },
      { id: 'm3', title: 'Rapprochements Bancaires, Amortissements & Création d’Entreprise', duration: 'États & Entreprise', materials: [] }
    ]
  },
  {
    id: 'c3-initiation-informatique',
    title: "STAGE D'INITIATION A L'INFORMATIQUE",
    category: 'Informatique & Web',
    level: 'Débutant',
    priceFCFA: 17000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat d'Initiation Pratique à l'Informatique",
    description: "Devenir autonome sur les fonctionnalités de base de l'ordinateur. Programme: -Windows, Word, Excel, Power Point, Publisher, Internet -Initiation à l'entreprenariat et à la recherche d'emploi.",
    objectives: [
      "Devenir totalement autonome sur Windows et l'environnement PC",
      "Maîtriser Word (saisie, mise en page de documents professionnels)",
      "Maîtriser Excel (tableaux, calculs simples, formules de base)",
      "Créer des présentations PowerPoint, supports Publisher et naviguer sur Internet"
    ],
    prerequisites: 'Aucun prérequis, ouvert à tous.',
    targetAudience: 'Débutants, élèves, commerçants, travailleurs souhaitant se digitaliser.',
    enrolledStudentsCount: 110,
    popularRank: 3,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Windows', 'Word', 'Excel', 'PowerPoint', 'Publisher', 'Internet'],
    bannerAccentColor: 'from-blue-600 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: webDevImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Environnement Windows & Prise en Main de l’Ordinateur', duration: 'Windows & PC', materials: [] },
      { id: 'm2', title: 'Bureautique Essentielle : Word & Excel Pratique', duration: 'Word & Excel', materials: [] },
      { id: 'm3', title: 'PowerPoint, Publisher, Internet & Recherche d’Emploi', duration: 'PowerPoint & Web', materials: [] }
    ]
  },
  {
    id: 'c3-formation-pratique-anglais',
    title: 'FORMATION PRATIQUE EN ANGLAIS',
    category: 'Langues & Communication',
    level: 'Tous niveaux',
    priceFCFA: 42000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Pratique Intensive de l'Anglais",
    description: "Parler couramment l'anglais",
    objectives: [
      "Développer une fluidité orale et une prononciation claire en anglais",
      "S'exprimer avec aisance lors d'entretiens d'embauche et réunions professionnelles",
      "Maîtriser le vocabulaire d'affaires, des voyages et de la vie courante",
      "Rédiger des e-mails professionnels et correspondances en anglais"
    ],
    prerequisites: 'Tous niveaux, du débutant à l’intermédiaire.',
    targetAudience: 'Professionnels, étudiants, demandeurs d’emploi, voyageurs.',
    enrolledStudentsCount: 89,
    popularRank: 4,
    posterTagline: "FORMATION 100% PRATIQUE • DURÉE 3 MOIS",
    toolsStack: ['Speaking Labs', 'Business English', 'Grammar in Action', 'Listening'],
    bannerAccentColor: 'from-red-700 to-slate-900',
    promoDiscount: 'IMMERSION ORALE INTENSIVE',
    imageUrl: togoStudentsPromoImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Bases de Conversation & Structures Grammaticales', duration: 'Conversation Orale', materials: [] },
      { id: 'm2', title: 'Anglais Professionnel, E-mails & Entretiens d’Embauche', duration: 'Anglais des Affaires', materials: [] },
      { id: 'm3', title: 'Débats Oratifs, Négociation & Fluidité Intensive', duration: 'Débats & Fluidité', materials: [] }
    ]
  },
  {
    id: 'c3-stage-paie-grh',
    title: 'STAGE DE FORMATION PRATIQUE EN PAIE & GRH',
    category: 'Ressources Humaines',
    level: 'Tous niveaux',
    priceFCFA: 42000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Paie & GRH",
    description: "Former des Responsables des Ressources Humaines à acquérir des connaissances indispensables et être apte pour exercer au sein du service de RH. Programme: -SAARI Paie & Comptabilité, Excel appliqué à la gestion. -Recrutement et Utilisation pratique du code de travail -Motivation du personnel & Gestion des conflits, -Plan de carrière, Initiation à l'entreprenariat et à la Recherche d'emploi.",
    objectives: [
      "Paramétrer et éditer les bulletins de paie sur SAARI Paie",
      "Appliquer les dispositions du Code du Travail togolais et conventions collectives",
      "Gérer le recrutement, l'intégration, la motivation et les plans de carrière",
      "Concevoir des tableaux de bord RH avancés sous Excel"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Chargés de paie, gestionnaires RH, secrétaires administratifs, juristes.',
    enrolledStudentsCount: 67,
    popularRank: 5,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['SAARI Paie', 'Code du Travail', 'Excel RH', 'Gestion des Conflits'],
    bannerAccentColor: 'from-amber-700 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: togoGraduateSuccessImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Code du Travail, Contrats & Gestion Administrative', duration: 'Droit du Travail', materials: [] },
      { id: 'm2', title: 'Pratique de SAARI Paie & Cotisations Sociales CNSS', duration: 'SAARI Paie & CNSS', materials: [] },
      { id: 'm3', title: 'Gestion des Carrières, Motivation & Climat Social', duration: 'Carrières & Climat', materials: [] }
    ]
  },
  {
    id: 'c3-stage-programmation-informatique',
    title: 'STAGE DE FORMATION PRATIQUE EN PROGRAMMATION INFORMATIQUE',
    category: 'Informatique & Web',
    level: 'Tous niveaux',
    priceFCFA: 60000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Programmation Informatique",
    description: "Apprendre des techniques très poussées dans le domaine du développement d'application web & mobiles. Programme: -Conception des applications mobiles Android -Conception des applications desktop & web -Initiation à l'entrepreneuriat et à la Recherche d'emploi.",
    objectives: [
      "Développer des applications mobiles Android performantes",
      "Concevoir et programmer des applications web et desktop",
      "Maîtriser les bases de données et l'architecture logicielle",
      "Initier des projets informatiques entrepreneuriaux et freelancing"
    ],
    prerequisites: 'Connaissances de base de l’ordinateur.',
    targetAudience: 'Développeurs débutants/intermédiaires, passionnés de code, étudiants IT.',
    enrolledStudentsCount: 78,
    popularRank: 6,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Android Studio', 'Web Dev', 'Desktop Apps', 'SQL / Bases de données'],
    bannerAccentColor: 'from-blue-700 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: webDevImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Conception d’Applications Mobiles Android', duration: 'Android Apps', materials: [] },
      { id: 'm2', title: 'Développement d’Applications Web & Desktop', duration: 'Web & Desktop', materials: [] },
      { id: 'm3', title: 'Déploiement, Freelancing & Recherche de Missions', duration: 'Projet & Emploi', materials: [] }
    ]
  },
  {
    id: 'c3-protocole-relations-publiques',
    title: "PROTOCOLE ET RELATIONX PUBLIQUES / AGENT D'APPUI AUX COLLECTIVITES LOCALES",
    category: 'Administration & Collectivités',
    level: 'Tous niveaux',
    priceFCFA: 60000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Protocole, Relations Publiques & Collectivités",
    description: "Organisation et gestion des réunions | La hiérarchisation de l'administration | Organisation des événements | animation et gestion d'équipe",
    objectives: [
      "Maîtriser les règles du protocole officiel et de préséance administrative",
      "Organiser et piloter les cérémonies, conférences et événements d'envergure",
      "Gérer la hiérarchie et la communication au sein des administrations locales",
      "Animer et coordonner les équipes de relations publiques"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Chargés de protocole, assistants de relations publiques, agents de mairie et préfecture.',
    enrolledStudentsCount: 36,
    popularRank: 7,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Protocole Officiel', 'Événementiel', 'Administration', 'Relations Publiques'],
    bannerAccentColor: 'from-slate-700 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: heroTrainingImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Règles Protocolaires & Hiérarchie Administrative', duration: 'Protocole Officiel', materials: [] },
      { id: 'm2', title: 'Organisation d’Événements Officiels & Réunions', duration: 'Événements & Réunions', materials: [] },
      { id: 'm3', title: 'Relations Publiques & Gestion d’Équipe', duration: 'Relations Publiques', materials: [] }
    ]
  },
  {
    id: 'c3-stage-audit',
    title: 'STAGE DE FORMATION PRATIQUE EN AUDIT',
    category: 'Gestion & Comptabilité',
    level: 'Tous niveaux',
    priceFCFA: 60000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Audit Comptable & Financier",
    description: "Maîtriser toute la démarche et les techniques d'audit. Maîtriser les savoir-faire et savoir être pour conduire les missions audit. Programme: -Définir les objectifs et planifier une mission d'audit. -Organiser, préparer et réaliser une mission d'audit -Initiation à l'entreprenariat et à la Recherche d'emploi.",
    objectives: [
      "Maîtriser la méthodologie et les normes d'une mission d'audit financier",
      "Définir le plan de mission, cartographier les risques et évaluer le contrôle interne",
      "Réaliser les tests substantiels et rédiger le rapport d'audit avec recommandations",
      "Développer la posture professionnelle d'auditeur en cabinet ou entreprise"
    ],
    prerequisites: 'Notions de comptabilité ou diplôme en gestion.',
    targetAudience: 'Auditeurs juniors, comptables, contrôleurs de gestion, consultants.',
    enrolledStudentsCount: 52,
    popularRank: 8,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Normes d’Audit', 'Évaluation du Contrôle Interne', 'Rapports d’Audit'],
    bannerAccentColor: 'from-indigo-700 to-slate-900',
    promoDiscount: 'STAGE EN CABINET GARANTI',
    imageUrl: accountingPowerBiImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Planification & Cadrage d’une Mission d’Audit', duration: 'Planification Audit', materials: [] },
      { id: 'm2', title: 'Évaluation du Contrôle Interne & Tests d’Audit', duration: 'Contrôle & Tests', materials: [] },
      { id: 'm3', title: 'Rédaction du Rapport d’Audit & Insertion Professionnelle', duration: 'Rapport & Recommandations', materials: [] }
    ]
  },
  {
    id: 'c3-gestion-projet-sgbd',
    title: 'STAGE DE FORMATION PRATIQUE EN GESTION DE PROJET & EN LOGICIEL DE GESTION DE BASE DE DONNEE (SGBD)',
    category: 'Management & Projets',
    level: 'Tous niveaux',
    priceFCFA: 60000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Gestion de Projet & SGBD",
    description: "Programme: -EPIDATA ACCESS, MS-PROJECT -Elaboration d'un projet de développement, -Gestion de cycle d'un projet, -Suivi-évaluation de projets et programmes. -Initiation à l'entreprenariat et à la Recherche d'emploi.",
    objectives: [
      "Élaborer un projet de développement complet selon le cycle de projet",
      "Créer et exploiter des bases de données avec Epidata et Access",
      "Planifier les délais, budgets et ressources sous MS Project",
      "Concevoir le dispositif de Suivi-Évaluation pour projets et programmes"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Coordinateurs de projets, chargés de S&E, agents de développement, statisticiens.',
    enrolledStudentsCount: 61,
    popularRank: 9,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Epidata', 'MS Access', 'MS Project', 'Cadre Logique S&E'],
    bannerAccentColor: 'from-teal-700 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: accountingPowerBiImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Élaboration de Projet & Cycle de Développement', duration: 'Cycle de Projet', materials: [] },
      { id: 'm2', title: 'Pratique d’Epidata & Conception de SGBD Access', duration: 'Epidata & Access', materials: [] },
      { id: 'm3', title: 'Planification MS Project & Suivi-Évaluation', duration: 'MS Project & S&E', materials: [] }
    ]
  },
  {
    id: 'c3-secretariat-caisse-microfinance',
    title: 'SECRETARIAT CAISSE MICROFINANCE & AIDE COMPTABLE',
    category: 'Gestion & Comptabilité',
    level: 'Tous niveaux',
    priceFCFA: 47000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Secrétariat Caisse Microfinance & Aide Comptable",
    description: "Satisfaire le secrétariat et la caisse d'une entreprise ou la caisse d'une Microfinance. Programme: -Windows, Excel, Word, Power point, Publisher, Photoshop. -Comptabilité des Institutions de Microfinance -Communication, approche client et vente | Logiciels de Gestion des IMF / SAARI Gestion de Caisse décentralisée, -Initiation à l'entreprenariat et à la Recherche d'emploi.",
    objectives: [
      "Maîtriser les opérations de guichet et de caisse décentralisée sur SAARI",
      "Tenir la comptabilité spécifique des Institutions de Microfinance (IMF)",
      "Assurer le secrétariat bureautique polyvalent (Office + Photoshop)",
      "Pratiquer l'accueil, la relation clientèle et la vente de services financiers"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Caissiers, aides-comptables, agents de crédit en microfinance, secrétaires.',
    enrolledStudentsCount: 81,
    popularRank: 10,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['SAARI Caisse IMF', 'Comptabilité IMF', 'Pack Office', 'Photoshop'],
    bannerAccentColor: 'from-blue-700 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: accountingPowerBiImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Bureautique Complète (Word, Excel, Photoshop)', duration: 'Bureautique & Photoshop', materials: [] },
      { id: 'm2', title: 'Comptabilité des IMF & Logiciels de Caisse Décentralisée', duration: 'Compta & Caisse IMF', materials: [] },
      { id: 'm3', title: 'Approche Client, Vente & Recherche d’Emploi', duration: 'Relation Client IMF', materials: [] }
    ]
  },
  {
    id: 'c3-marketing-technique-vente',
    title: 'STAGE DE FORMATION PRATIQUE EN MARKETING & TECHNIQUE DE VENTE',
    category: 'Marketing & Digital',
    level: 'Tous niveaux',
    priceFCFA: 42000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Marketing & Vente",
    description: "Former des Responsables Marketings à acquérir des méthodes, démarches et outils pour répondre aux besoins d'un service commercial. Programme: -SAARI Gestion Commerciale, Excel appliqué à la gestion (Fiche de stock, Tableau de bord...) | Photoshop -Négociation commerciale, Commerce – vente – marketing -Vendeur professionnel, Marketing Internet (e-marketing) -Utiliser efficacement Internet et les outils de recherche -Initiation à l'entreprenariat et à la Recherche d'emploi.",
    objectives: [
      "Maîtriser la négociation commerciale directe et la conclusion de ventes",
      "Utiliser SAARI Gestion Commerciale et Photoshop pour les fiches produits",
      "Élaborer fiches de stock et tableaux de bord commerciaux sous Excel",
      "Développer des actions de e-marketing et prospection sur Internet"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Commerciaux, vendeurs pro, chargés de marketing, promoteurs de vente.',
    enrolledStudentsCount: 70,
    popularRank: 11,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['SAARI Commercial', 'Négociation Vente', 'E-Marketing', 'Photoshop'],
    bannerAccentColor: 'from-orange-700 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: togoStudentsPromoImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Techniques de Vente & Négociation Commerciale', duration: 'Vente & Négociation', materials: [] },
      { id: 'm2', title: 'SAARI Commercial, Tableaux Excel & Photoshop Visuel', duration: 'SAARI & Outils Visuels', materials: [] },
      { id: 'm3', title: 'E-Marketing, Outils Web & Stratégie Commerciale', duration: 'E-Marketing Pro', materials: [] }
    ]
  },
  {
    id: 'c3-banque-microfinance',
    title: 'STAGE DE FORMATION PRATIQUE EN BANQUE & MICROFINANCE',
    category: 'Banque & Microfinance',
    level: 'Tous niveaux',
    priceFCFA: 60000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Banque & Microfinance",
    description: "Acquérir une vision d'ensemble de l'activité de la banque & microfinance. De connaître les principaux produits bancaires tant de crédit que d'épargne et spécifique. Programme: -Technique de gestion d'un portefeuille client | Technique de montage et d'évaluation d'un projet de prêt. -Evaluation financière et rentabilité: Calcul des ratios de gestion -Technique de montage ou d'élaboration des états financiers. -Technique de suivi et d'élaboration des projets financiers -Procédures de contrôle interne -Initiation à l'entreprenariat et à la recherche d'emploi",
    objectives: [
      "Gérer et fidéliser un portefeuille de clients bancaires et microfinance",
      "Monter et évaluer un dossier de demande de prêt (analyse du risque)",
      "Calculer les ratios financiers de rentabilité et solvabilité",
      "Appliquer les procédures de contrôle interne et conformité bancaire"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Chargés de prêt, analystes crédit, gestionnaires de comptes IMF, banquiers.',
    enrolledStudentsCount: 68,
    popularRank: 12,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Analyse Crédit', 'Ratios Financiers', 'Contrôle Interne', 'Portefeuille Client'],
    bannerAccentColor: 'from-emerald-800 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: heroTrainingImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Gestion de Portefeuille & Produits Épargne/Crédit', duration: 'Gestion Portefeuille', materials: [] },
      { id: 'm2', title: 'Montage de Dossier de Prêt & Ratios Financiers', duration: 'Dossier de Prêt', materials: [] },
      { id: 'm3', title: 'Contrôle Interne & Élaboration d’États Financiers', duration: 'Contrôle Interne', materials: [] }
    ]
  },
  {
    id: 'c3-infographie-pratique',
    title: 'STAGE DE FORMATION PRATIQUE EN INFOGRAPHIE',
    category: 'Design & Infographie',
    level: 'Tous niveaux',
    priceFCFA: 60000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Infographie",
    description: "Maîtriser des logiciels de conception (PS, AI) | Conception des affiches publicitaires, cartes, flyers, roll up, Branding... Montage vidéo",
    objectives: [
      "Maîtriser Photoshop pour les retouches photo et affiches publicitaires",
      "Maîtriser Illustrator pour logos, flyers, cartes de visite et roll-ups",
      "Créer des chartes de Branding complètes prêtes pour impression",
      "Réaliser du montage vidéo promotionnel pour réseaux sociaux"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Graphistes juniors, community managers, créateurs visuels.',
    enrolledStudentsCount: 88,
    popularRank: 13,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Photoshop', 'Illustrator', 'Montage Vidéo', 'Branding Express'],
    bannerAccentColor: 'from-purple-700 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: graphicDesignImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Création Graphique sur Photoshop (Affiches, Flyers)', duration: 'Photoshop Créatif', materials: [] },
      { id: 'm2', title: 'Dessin Vectoriel & Branding sur Illustrator', duration: 'Illustrator & Branding', materials: [] },
      { id: 'm3', title: 'Montage Vidéo Promotionnel & Impression', duration: 'Vidéo & Print', materials: [] }
    ]
  },
  {
    id: 'c3-maintenance-reseaux-pratique',
    title: 'STAGE DE FORMATION PRATIQUE EN MAINTENANCE & RESEAUX',
    category: 'Réseaux & Maintenance',
    level: 'Tous niveaux',
    priceFCFA: 60000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Maintenance & Réseaux",
    description: "Maîtriser la configuration & la maintenance des outils informatiques | Réseau | Pratique en Maintenance | Parabole...",
    objectives: [
      "Diagnostiquer et dépanner les pannes matérielles et logicielles des PC",
      "Concevoir et câbler un réseau informatique local fonctionnel",
      "Installer et configurer les antennes paraboliques et récepteurs",
      "Appliquer les règles de sécurité informatique et maintenance préventive"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Techniciens en maintenance, installateurs réseaux, câbleurs.',
    enrolledStudentsCount: 59,
    popularRank: 14,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Dépannage PC', 'Câblage RJ45', 'Parabole TV', 'Maintenance Réseau'],
    bannerAccentColor: 'from-blue-800 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: webDevImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Démontage, Diagnostic & Maintenance PC', duration: 'Diagnostic & PC', materials: [] },
      { id: 'm2', title: 'Configuration Réseau LAN & Partage de Ressources', duration: 'Réseaux Locaux', materials: [] },
      { id: 'm3', title: 'Installation & Réglage Parabole Télévision', duration: 'Installation Paraboles', materials: [] }
    ]
  },
  {
    id: 'c3-epidata-sgbd',
    title: 'STAGE DE FORMATION PRATIQUE EN EPIDATA ET SGBD',
    category: 'Management & Projets',
    level: 'Tous niveaux',
    priceFCFA: 60000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Epidata & SGBD",
    description: "Acquérir la capacité d'élaboré un projet de développement, l'utilisation des logiciels EPIDATA Access, Ms-project",
    objectives: [
      "Concevoir des masques de saisie et sécuriser la collecte sous Epidata",
      "Créer des bases de données relationnelles professionnelles sous MS Access",
      "Planifier et budgétiser les projets avec MS Project",
      "Analyser et exporter les données statistiques pour les rapports de projets"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Chargés d’études statistiques, agents de collecte de données, chefs de projets.',
    enrolledStudentsCount: 47,
    popularRank: 15,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Epidata', 'MS Access', 'MS Project', 'Traitement Données'],
    bannerAccentColor: 'from-teal-800 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: accountingPowerBiImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Conception de Questionnaires & Saisie sous Epidata', duration: 'Masques Epidata', materials: [] },
      { id: 'm2', title: 'Gestion de Base de Données Relationnelle sous Access', duration: 'Bases MS Access', materials: [] },
      { id: 'm3', title: 'Planification MS Project & Restitution des Données', duration: 'Planning Project', materials: [] }
    ]
  },
  {
    id: 'c3-community-manager-pratique',
    title: 'STAGE DE FORMATION PRATIQUE EN COMMUNITY MANAGER',
    category: 'Marketing & Digital',
    level: 'Tous niveaux',
    priceFCFA: 75000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Stage Pratique en Community Management",
    description: "Rendre son entreprise visible sur la web et ainsi de développer sa notoriété et sa e-réputation. Maîtriser les démarche d'échange avec le consommateur, et donner une dimension plus humaine et accessible, crée une fidélité forte.",
    objectives: [
      "Développer la notoriété et la e-réputation d'une marque sur les réseaux sociaux",
      "Créer une ligne éditoriale captivante et des visuels engageants",
      "Fidéliser la communauté et gérer la relation client en ligne",
      "Lancer des campagnes publicitaires ciblées avec ROI mesurable"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Community managers, créateurs de contenu, commerçants en ligne.',
    enrolledStudentsCount: 76,
    popularRank: 16,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Meta Ads', 'TikTok Marketing', 'Canva Pro', 'Modération'],
    bannerAccentColor: 'from-pink-700 to-slate-900',
    promoDiscount: 'STAGE EN AGENCE DIGITALE INCLUS',
    imageUrl: graphicDesignImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Stratégie de Présence & E-Réputation de Marque', duration: 'E-Réputation', materials: [] },
      { id: 'm2', title: 'Création de Contenus Visuels & Planning de Publication', duration: 'Contenus & Planning', materials: [] },
      { id: 'm3', title: 'Publicité Ciblée & Animation de Communauté', duration: 'Meta Ads & Modération', materials: [] }
    ]
  },
  {
    id: 'c3-gestion-stocks-pratique',
    title: 'FORMATION PRATIQUE EN GESTION DE STOCKS & APPROVISIONNEMENTS',
    category: 'Commerce & Transit',
    level: 'Tous niveaux',
    priceFCFA: 60000,
    durationHours: 120,
    durationWeeks: '03 mois en stage de formation pratique',
    programType: '03 mois en stage de formation pratique',
    certificationTitle: "Certificat de Formation Pratique en Gestion de Stocks & Approvisionnements",
    description: "Identifier la place du stock dans la chaîne logistique | Organiser la gestion physique et comptable des stocks et élaborer le tableau de bord des stocks...",
    objectives: [
      "Identifier la place stratégique du stock dans la supply chain",
      "Organiser la tenue physique de magasin et les inventaires périodiques",
      "Tenir la comptabilité des stocks (fiches de stock, valorisation FIFO / CMUP)",
      "Concevoir les tableaux de bord d'alerte et de réapprovisionnement"
    ],
    prerequisites: 'Tous niveaux.',
    targetAudience: 'Gestionnaires d’entrepôt, magasiniers, acheteurs, logisticiens.',
    enrolledStudentsCount: 49,
    popularRank: 17,
    posterTagline: "FORMATION 100% PRATIQUE • PRATIQUE + STAGE (3 MOIS)",
    toolsStack: ['Fiches de Stocks', 'Tableaux Excel Supply Chain', 'Méthodes FIFO/CMUP'],
    bannerAccentColor: 'from-amber-800 to-slate-900',
    promoDiscount: 'STAGE PRATIQUE INCLUS',
    imageUrl: accountingPowerBiImg,
    sessions: default3MSessions,
    modules: [
      { id: 'm1', title: 'Chaîne Logistique & Rôle du Stock en Entreprise', duration: 'Chaîne Logistique', materials: [] },
      { id: 'm2', title: 'Organisation Physique du Magasin & Inventaires', duration: 'Magasin & Inventaires', materials: [] },
      { id: 'm3', title: 'Comptabilité des Stocks & Tableaux de Bord Excel', duration: 'Compta Stocks & Excel', materials: [] }
    ]
  }
];
