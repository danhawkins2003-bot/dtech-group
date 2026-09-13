import { Formation, ServiceExpertise, CentreInfo, Testimonial } from '../types';

export const DTECH_INFO = {
  name: 'DTECH GROUP',
  tagline: 'Cabinet de Management, Études & Conseils',
  subTagline: 'Votre partenaire stratégique pour la performance des organisations et le renforcement des compétences.',
  email: 'contact@cabinetdtech.com',
  secondaryEmail: 'infos@cabinetdtech.com',
  mainPhone: '+228 90 00 00 00 / +228 99 00 00 00',
  website: 'https://cabinetdtech.com',
  headquarters: 'Lomé, Togo',
  regionalHub: 'Kara, Togo',
  country: 'Togo',
  yearsOfExperience: '10+',
  professionalsTrained: '2 500+',
  satisfactionRate: '98.5%',
  projectsAccomplished: '320+'
};

export const SERVICES_LIST: ServiceExpertise[] = [
  {
    id: 'etudes-projets',
    title: 'Études & Montage de Projets',
    shortDesc: 'Élaboration de plans d’affaires, études de faisabilité économique, études d’impact et évaluation de projets.',
    fullDesc: 'Nous accompagnons les promoteurs d’entreprises, ONG et institutions publiques dans la conceptualisation, la modélisation financière et la concrétisation de leurs initiatives de développement à fort impact.',
    icon: 'FileSpreadsheet',
    deliverables: [
      'Business Plans bancables conformes aux normes',
      'Études de faisabilité technique et financière',
      'Plans de suivi-évaluation (PMP) et indicateurs d’impact',
      'Dossiers de levée de fonds et recherche de subventions'
    ],
    target: 'Entrepreneurs, PME/PMI, Bailleurs de fonds, Institutions publiques, ONG',
    methodology: [
      'Diagnostic préliminaire & cadrage des besoins',
      'Collecte de données terrain & études de marché',
      'Modélisation financière & analyse de sensibilité',
      'Restitution & accompagnement à la mise en œuvre'
    ]
  },
  {
    id: 'conseil-management',
    title: 'Conseil en Management & Stratégie',
    shortDesc: 'Optimisation organisationnelle, gouvernance d’entreprise, audits de processus et restructuration.',
    fullDesc: 'DTECH GROUP aide les dirigeants à structurer leur gouvernance, fluidifier leurs processus internes et accroître leur rentabilité opérationnelle face aux mutations du marché économique.',
    icon: 'TrendingUp',
    deliverables: [
      'Manuels de procédures administratives et financières',
      'Plans stratégiques quinquennaux et feuilles de route',
      'Cartographie des risques et plans de mitigation',
      'Schémas de gouvernance et organigrammes cibles'
    ],
    target: 'Directeurs Généraux, Comités de Direction, Conseils d’administration',
    methodology: [
      'Audit organisationnel à 360°',
      'Benchmarking sectoriel & analyse SWOT avancée',
      'Co-construction des plans d’action stratégiques',
      'Conduite du changement & suivi des KPI'
    ]
  },
  {
    id: 'comptabilite-fiscalite',
    title: 'Gestion Comptable, Finance & Fiscalité',
    shortDesc: 'Tenue de comptes SYSCOHADA révisé, déclarations fiscales et sociales, audits financiers et assistance contrôle fiscal.',
    fullDesc: 'Une expertise rigoureuse pour garantir la conformité légale de votre entreprise auprès de l’OTR (Office Togolais des Recettes) et sécuriser votre gestion patrimoniale et financière.',
    icon: 'Calculator',
    deliverables: [
      'Montage des états financiers annuels (Bilan, Compte de Résultat, TAFIRE/Tableau des flux)',
      'Déclarations fiscales mensuelles et annuelles (TVA, IMF, IS, IRPP)',
      'Assistance et défense lors des contrôles fiscaux',
      'Tableaux de bord de trésorerie et pilotage budgétaire'
    ],
    target: 'TPE, PME, Grandes Entreprises, Associations professionnelles',
    methodology: [
      'Revue périodique des pièces comptables',
      'Rapprochements bancaires et lettrage exhaustif',
      'Validation de conformité aux normes SYSCOHADA révisé',
      'Conseil d’optimisation fiscale légale continue'
    ]
  },
  {
    id: 'formations-professionnelles',
    title: 'Formations Professionnelles Continues',
    shortDesc: 'Programmes certifiants, séminaires de renforcement de capacités et masterclasses pour cadres et équipes.',
    fullDesc: 'Des modules pratiques animés par des experts praticiens chevronnés dans nos centres modernes de Lomé et Kara, ou directement dans vos locaux d’entreprise.',
    icon: 'GraduationCap',
    deliverables: [
      'Certificats de compétences professionnelles DTECH GROUP',
      'Supports pédagogiques complets et cas pratiques réels',
      'Accompagnement post-formation et mentorat de 3 mois',
      'Attestations officielles de participation'
    ],
    target: 'Cadres, Responsables d’équipe, Gestionnaires, Étudiants en fin de cycle',
    methodology: [
      'Évaluation des besoins & positionnement initial',
      'Pédagogie active (70% pratique / 30% théorie)',
      'Mises en situation & études de cas contextualisées',
      'Évaluation des acquis & remise des certificats'
    ]
  },
  {
    id: 'digital-bi',
    title: 'Transformation Digitale & Business Intelligence',
    shortDesc: 'Intégration d’outils de gestion ERP (Sage, Odoo), tableaux de bord Power BI et automatisation des flux.',
    fullDesc: 'Modernisez vos processus d’affaires grâce aux technologies actuelles. Nous concevons vos tableaux de bord décisionnels dynamiques et automatisons vos rapports de gestion.',
    icon: 'Cpu',
    deliverables: [
      'Tableaux de bord dynamiques interactifs sous Power BI',
      'Paramétrage et formation sur logiciels Sage (Comptabilité, Paie, Gestion Commerciale)',
      'Automatisation de processus Excel (VBA / Power Query)',
      'Numérisation et archivage électronique des documents'
    ],
    target: 'Directions financières, Contrôleurs de gestion, Responsables IT/Opérations',
    methodology: [
      'Cartographie des flux d’information existants',
      'Architecture des données & modélisation',
      'Développement des solutions & phase de tests utilisateurs',
      'Transfert de compétences & documentation utilisateur'
    ]
  },
  {
    id: 'rh-recrutement',
    title: 'Ressources Humaines & Recrutement',
    shortDesc: 'Chasse de têtes, bilans de compétences, fiches de poste, politique de rémunération et climat social.',
    fullDesc: 'Attirez, valorisez et fidélisez les meilleurs talents togolais et régionaux pour soutenir la croissance de votre entreprise.',
    icon: 'Users',
    deliverables: [
      'Fiches de postes et grilles de compétences détaillées',
      'Dossiers de sélection et tests psychotechniques/techniques',
      'Grilles salariales équitables et motivantes',
      'Plans de développement des carrières'
    ],
    target: 'DRH, Dirigeants d’entreprise, Cabinets de recrutement partenaires',
    methodology: [
      'Définition précise du profil de poste',
      'Sourcing ciblé & entretiens structurés',
      'Vérification des références & tests d’aptitude',
      'Intégration et suivi de la période d’essai'
    ]
  }
];

export const FORMATIONS_CATALOG: Formation[] = [
  {
    id: 'f-sage-syscohada',
    title: 'Pratique de la Comptabilité sous SAGE 100 & SYSCOHADA Révisé',
    category: 'finance',
    categoryLabel: 'Comptabilité & Finance',
    duration: '40 Heures (4 semaines)',
    level: 'Intermédiaire',
    modalite: 'Présentiel Lomé',
    price: '85 000 FCFA',
    sessions: ['14 Septembre 2026', '06 Octobre 2026', '10 Novembre 2026'],
    description: 'Maîtrisez le logiciel de référence SAGE 100 Comptabilité de la création du plan comptable jusqu’à l’édition de la liasse fiscale annuelle conforme au SYSCOHADA révisé.',
    objectives: [
      'Paramétrer un dossier comptable complet sous Sage 100',
      'Saisir les écritures complexes (achats, ventes, trésorerie, OD)',
      'Gérer les lettrages et rapprochements bancaires automatisés',
      'Générer les états financiers et la déclaration fiscale OTR'
    ],
    prerequisites: 'Bases en comptabilité générale requises',
    targetAudience: 'Comptables, assistants comptables, gestionnaires, auditeurs juniors',
    modules: [
      'Module 1: Paramétrage structurel & plan des tiers selon SYSCOHADA',
      'Module 2: Enregistrement des opérations courantes et spécifiques',
      'Module 3: Travaux d’inventaire et de fin d’exercice',
      'Module 4: Clôture, réouverture et génération de la liasse fiscale'
    ],
    certificate: 'Certificat de Praticien Sage 100 DTECH'
  },
  {
    id: 'f-powerbi-excel',
    title: 'Excel Avancé & Business Intelligence avec Power BI',
    category: 'digital',
    categoryLabel: 'Data & Bureautique Avancée',
    duration: '30 Heures (3 semaines)',
    level: 'Tous niveaux',
    modalite: 'Hybride',
    price: '75 000 FCFA',
    sessions: ['14 Septembre 2026', '13 Octobre 2026'],
    description: 'Transformez vos données brutes en indicateurs de performance interactifs et percutants pour la prise de décision stratégique.',
    objectives: [
      'Maîtriser les fonctions avancées d’Excel (RECHERCHEX, INDEX/EQUIV, SOMME.SI.ENS)',
      'Construire des tableaux croisés dynamiques avec segments et chronologies',
      'Importer, nettoyer et modéliser des données dans Power Query',
      'Créer des tableaux de bord Power BI interactifs et automatisés'
    ],
    prerequisites: 'Connaissance basique de Microsoft Excel',
    targetAudience: 'Contrôleurs de gestion, analystes, responsables commerciaux, managers',
    modules: [
      'Module 1: Fonctions logiques, statistiques et recherche avancées',
      'Module 2: Automatisation des retraitements avec Power Query',
      'Module 3: Modélisation relationnelle & mesures DAX essentielles',
      'Module 4: Design & diffusion de tableaux de bord Power BI'
    ],
    certificate: 'Certification DTECH Data Analyst'
  },
  {
    id: 'f-gestion-projets',
    title: 'Management de Projets : De la Conception au Suivi-Évaluation (PMP/PMBOK)',
    category: 'project',
    categoryLabel: 'Gestion de Projets',
    duration: '35 Heures (weekend)',
    level: 'Intermédiaire',
    modalite: 'Présentiel Kara',
    price: '90 000 FCFA',
    sessions: ['14 Septembre 2026', '18 Octobre 2026'],
    description: 'Acquérez les compétences indispensables pour structurer, planifier, budgétiser et piloter efficacement des projets de développement et d’entreprise.',
    objectives: [
      'Rédiger des termes de référence (TDR) et une note de cadrage claire',
      'Élaborer le cadre logique et la matrice d’indicateurs de suivi',
      'Planifier les ressources et les délais (diagrammes de GANTT sous MS Project)',
      'Gérer les risques et les relations avec les parties prenantes'
    ],
    prerequisites: 'Expérience en milieu professionnel ou associatif',
    targetAudience: 'Chefs de projets, coordinateurs d’ONG, consultants, ingénieurs',
    modules: [
      'Module 1: Cycle de vie d’un projet & Approche Cadre Logique (ACL)',
      'Module 2: Planification opérationnelle, financière et temporelle',
      'Module 3: Système de Suivi-Évaluation et collecte de données terrain',
      'Module 4: Clôture de projet, capitalisation et reporting aux bailleurs'
    ],
    certificate: 'Certificat en Gestion de Projets DTECH'
  },
  {
    id: 'f-fiscalite-togo',
    title: 'Pratique de la Fiscalité Togolaise & Gestion des Contrôles OTR',
    category: 'finance',
    categoryLabel: 'Fiscalité & Droit des Affaires',
    duration: '25 Heures (2 semaines)',
    level: 'Avancé',
    modalite: 'Présentiel Lomé',
    price: '95 000 FCFA',
    sessions: ['14 Septembre 2026', '25 Octobre 2026'],
    description: 'Une formation pointue sur le Code Général des Impôts togolais, la gestion des déclarations en ligne OTR et les stratégies d’optimisation fiscale sécurisée.',
    objectives: [
      'Maîtriser les règles d’assiette et de liquidation des principaux impôts togolais',
      'Gérer avec conformité les télédéclarations sur le portail OTR',
      'Anticiper les redressements et gérer sereinement les contrôles sur pièces et sur place',
      'Mettre en place un plan de conformité fiscale interne'
    ],
    prerequisites: 'Bonnes notions de fiscalité ou de comptabilité d’entreprise',
    targetAudience: 'Directeurs financiers, fiscalistes d’entreprise, experts-comptables stagiaires, chefs d’entreprise',
    modules: [
      'Module 1: TVA, droits d’enregistrement et retenues à la source',
      'Module 2: Impôt sur les Sociétés (IS) & Impôt Minimum Forfaitaire (IMF)',
      'Module 3: Fiscalité des salaires (IRPP, VPS, charges sociales CNSS)',
      'Module 4: Procédures contentieuses et défense des droits du contribuable'
    ],
    certificate: 'Attestation d’Expertise Fiscale Pratique'
  },
  {
    id: 'f-leadership-management',
    title: 'Leadership Managérial & Conduite d’Équipes Performantes',
    category: 'management',
    categoryLabel: 'Management & Leadership',
    duration: '20 Heures',
    level: 'Tous niveaux',
    modalite: 'En Ligne (E-learning)',
    price: '60 000 FCFA',
    sessions: ['Disponible en continu / Sessions interactives hebdomadaires'],
    description: 'Développez votre posture managériale, renforcez l’engagement de vos collaborateurs et résolvez efficacement les conflits en milieu professionnel.',
    objectives: [
      'Identifier son style de leadership prédominant et adapter sa communication',
      'Fixer des objectifs SMART motivants et mener les entretiens annuels',
      'Déléguer avec méthode et responsabiliser les équipes',
      'Gérer les tensions et motiver dans les contextes de changement'
    ],
    prerequisites: 'Aucun prérequis spécifique',
    targetAudience: 'Managers d’équipe, chefs de service, superviseurs, porteurs de projet',
    modules: [
      'Module 1: Fondements du leadership & intelligence émotionnelle',
      'Module 2: Communication managériale & feedback constructif',
      'Module 3: Motivation d’équipe & animation des réunions efficaces',
      'Module 4: Gestion des conflits et accompagnement du changement'
    ],
    certificate: 'Certificat en Leadership & Management DTECH'
  },
  {
    id: 'f-sage-paie-rh',
    title: 'Gestion de la Paie & Administration RH avec SAGE Paie',
    category: 'hr',
    categoryLabel: 'Ressources Humaines & Paie',
    duration: '30 Heures (3 semaines)',
    level: 'Intermédiaire',
    modalite: 'Présentiel Lomé',
    price: '70 000 FCFA',
    sessions: ['05 Octobre 2026', '02 Novembre 2026'],
    description: 'Apprenez à calculer les bulletins de paie selon la législation du travail togolaise, paramétrer les rubriques sous SAGE Paie et déclarer à la CNSS.',
    objectives: [
      'Calculer les éléments du salaire brut, cotisations CNSS et retenues fiscales',
      'Paramétrer les constantes, rubriques et profils de paie sous SAGE',
      'Éditer les fiches de paie, le livre de paie et les états de virement',
      'Générer les déclarations sociales périodiques (CNSS)'
    ],
    prerequisites: 'Notions de gestion administrative ou comptable',
    targetAudience: 'Gestionnaires de paie, chargés RH, assistants de direction, comptables',
    modules: [
      'Module 1: Droit du travail togolais & éléments constitutifs du salaire',
      'Module 2: Paramétrage du dossier entreprise sous SAGE Paie',
      'Module 3: Gestion des congés, primes, heures sup et départs',
      'Module 4: Clôture mensuelle, télé-déclarations et comptabilisation de la paie'
    ],
    certificate: 'Certificat de Gestionnaire Paie SAGE DTECH'
  }
];

export const CENTRES_DATA: CentreInfo[] = [
  {
    id: 'centre-lome',
    city: 'Lomé (Siège Principal)',
    role: 'Siège Social & Centre de Formation Principale',
    address: 'Boulevard Circulaire / Quartier d’Affaires, Lomé - Togo',
    phone: '+228 90 12 34 56 / +228 99 87 65 43',
    email: 'contact@cabinetdtech.com',
    openingHours: 'Lundi au Vendredi : 08h00 - 18h00 | Samedi : 08h30 - 13h00',
    servicesAvailable: [
      'Direction Générale & Consultation sur RDV',
      'Salles de formation informatique climatisées',
      'Pôle Études & Montage de Business Plans',
      'Assistance Comptable & Fiscale aux Entreprises',
      'Espace Coworking & Rendez-vous Clients'
    ]
  },
  {
    id: 'centre-kara',
    city: 'Kara (Centre Régional Nord)',
    role: 'Centre Régional de Formation & d’Accompagnement',
    address: 'Quartier Administratif / Proche Université de Kara, Kara - Togo',
    phone: '+228 91 23 45 67 / +228 98 76 54 32',
    email: 'kara@cabinetdtech.com',
    openingHours: 'Lundi au Vendredi : 08h00 - 17h30 | Samedi : 08h30 - 12h30',
    servicesAvailable: [
      'Pôle Régional de Formations Professionnelles Certifiantes',
      'Accompagnement des PME/TPE du Nord Togo',
      'Études socio-économiques & Suivi de projets régionaux',
      'Inscriptions & sessions présentielles décentralisées'
    ]
  }
];

export const REGIONAL_POINTS = [
  { city: 'Baguida', zone: 'Région Maritime', description: 'Accompagnement de proximité entreprises et commerces' },
  { city: 'Kpalimé', zone: 'Région des Plateaux', description: 'Études agro-économiques et renforcement de capacités' },
  { city: 'Sokodé', zone: 'Région Centrale', description: 'Appui technique PME, microfinance et formations' },
  { city: 'Dapaong', zone: 'Région des Savanes', description: 'Conseil en gestion de projets et suivi opérationnel' }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 't-1',
    name: 'Koffi Mensah',
    role: 'Directeur Général',
    company: 'Société Agro-Industrielle Togolaise',
    service: 'Étude de Faisabilité & Business Plan',
    comment: 'L’équipe de DTECH GROUP a structuré un plan d’affaires d’une clarté remarquable qui nous a permis de mobiliser 45 millions FCFA auprès de notre banque partenaire. Une rigueur exemplaire.',
    rating: 5
  },
  {
    id: 't-2',
    name: 'Afiwa Lawson',
    role: 'Responsable Financière',
    company: 'Cabinet de Négoce & Logistique',
    service: 'Formation SAGE 100 & SYSCOHADA',
    comment: 'La formation dispensée au siège de Lomé est hyper pratique. En 4 semaines, nous avons complètement assaini notre chaîne comptable et nos déclarations fiscales OTR se font sans accroc.',
    rating: 5
  },
  {
    id: 't-3',
    name: 'Tchala Kpatcha',
    role: 'Chef de Projet Développement',
    company: 'Coordination Régionale Kara',
    service: 'Management de Projets & Suivi-Évaluation',
    comment: 'Avoir un centre DTECH à Kara est une opportunité immense pour les professionnels du Nord Togo. Pédagogie active et formateurs très expérimentés.',
    rating: 5
  }
];

export const FAQ_DATA = [
  {
    q: 'Où sont situés les centres physiques de DTECH GROUP ?',
    a: 'DTECH GROUP est implanté au Togo avec son Siège social et centre de formation principal à Lomé, ainsi qu’un centre régional majeur à Kara. Nous intervenons également dans toutes les régions du Togo (Baguida, Kpalimé, Sokodé, Dapaong). Notez qu’il n’y a aucun centre au Gabon.'
  },
  {
    q: 'Les attestations et certificats délivrés par DTECH sont-ils reconnus ?',
    a: 'Oui, DTECH GROUP est un cabinet agréé de management, d’études et de conseils. Nos certificats de compétences professionnelles attestent de savoir-faire concrets recherchés par les entreprises et recruteurs en zone UEMOA.'
  },
  {
    q: 'Peut-on suivre les formations à distance ou en entreprise (intra-entreprise) ?',
    a: 'Absolument. En plus des sessions présentielles à Lomé et Kara, nous proposons des formules en e-learning interactif ainsi que des programmes sur-mesure déployés directement dans les locaux de votre organisation.'
  },
  {
    q: 'Comment obtenir un devis pour une mission de conseil ou de tenue comptable ?',
    a: 'Vous pouvez utiliser notre simulateur de projet en ligne sur cette plateforme, nous envoyer un email à contact@cabinetdtech.com ou nous joindre directement par téléphone pour un entretien de cadrage gratuit.'
  },
  {
    q: 'Quels sont les modes de règlement acceptés ?',
    a: 'Nous acceptons les règlements par virement bancaire, chèque d’entreprise, espèces à la caisse de nos centres (Lomé/Kara) ainsi que les paiements mobiles (T-Money / Flooz) pour plus de flexibilité.'
  }
];
