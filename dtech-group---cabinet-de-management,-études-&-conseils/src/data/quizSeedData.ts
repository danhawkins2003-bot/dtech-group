/**
 * DONNÉES INITIALES DU MOTEUR DES QUIZ (ÉTAPE 5)
 * DTech Group / Institut Supérieur DELXIA
 */

import { Quiz, QuizSubmission, QuizAuditLogEntry } from '../types';

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'qz-dev-001',
    centerId: 'center-lome-avedji',
    formationId: 'c9-developpement-web-mobile',
    promotionId: 'promo-jan-2026',
    groupId: 'grp-jan26-dev-g1',
    groupIds: ['grp-jan26-dev-g1', 'grp-jan26-dev-g2'],
    courseUnitId: 'crs-informatique-base',
    courseUnitCode: 'INF-101',
    courseUnitTitle: 'Informatique & Outils Bureautiques Professionnels',
    moduleId: 'm1',
    moduleTitle: 'Bureautique avancée',
    trainerId: 'usr_trainer_01',
    trainerName: 'Ing. Kodjo AMENYONA',
    title: 'Quiz Officiel N°1 — Architecture Web & Fondamentaux Informatiques',
    description: 'Évaluation des connaissances fondamentales sur les protocoles web, bases de données et structuration système.',
    generalInstructions: 'Ce quiz comporte 7 questions couvrant différents types de réflexion. Conformément au règlement de DTech Group, vos réponses seront enregistrées puis évaluées exclusivement et manuellement par votre formateur.',
    durationMinutes: 45,
    openingDate: '2026-03-01T08:00:00Z',
    closingDate: '2026-04-30T23:59:59Z',
    displayOrder: 1,
    status: 'published',
    totalMaxPoints: 20,
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-01T08:00:00Z',
    questions: [
      {
        id: 'qz-q1',
        order: 1,
        type: 'QCM',
        prompt: 'Quel protocole réseau sécurisé utilise le port standard 443 pour les échanges chiffrés ?',
        instructions: 'Sélectionnez une seule réponse parmi les options proposées.',
        maxPoints: 2,
        options: ['HTTP', 'HTTPS', 'FTP', 'SSH']
      },
      {
        id: 'qz-q2',
        order: 2,
        type: 'MULTI_SELECT',
        prompt: 'Quels sont les mécanismes recommandés pour sécuriser une API REST moderne ?',
        instructions: 'Sélectionnez toutes les options valides.',
        maxPoints: 3,
        options: [
          'Authentification par tokens JWT signés',
          'Limitation de débit (Rate Limiting)',
          'Stockage des mots de passe en clair dans la base',
          'Contrôle des origines (CORS) strict'
        ]
      },
      {
        id: 'qz-q3',
        order: 3,
        type: 'TRUE_FALSE',
        prompt: 'Dans une architecture relationnelle normalisée, une clé étrangère peut pointer vers une colonne non indexée sans aucune contrainte d\'intégrité.',
        instructions: 'Indiquez si cette affirmation est Vraie ou Fausse.',
        maxPoints: 2,
        options: ['Vrai', 'Faux']
      },
      {
        id: 'qz-q4',
        order: 4,
        type: 'ASSOCIATION',
        prompt: 'Associez chaque commande Git à son rôle précis dans le cycle de développement.',
        instructions: 'Reliez chaque élément de gauche à sa définition de droite.',
        maxPoints: 4,
        associationPairs: [
          { id: 'p1', left: 'git commit -m "..."', right: 'Enregistre un instantané des modifications dans l\'historique local' },
          { id: 'p2', left: 'git push origin main', right: 'Transfère les commits locaux vers le dépôt distant' },
          { id: 'p3', left: 'git pull', right: 'Récupère et fusionne les changements distants sur la branche courante' },
          { id: 'p4', left: 'git checkout -b feature', right: 'Crée et bascule immédiatement sur une nouvelle branche' }
        ]
      },
      {
        id: 'qz-q5',
        order: 5,
        type: 'ORDERING',
        prompt: 'Classez dans l\'ordre chronologique standard les étapes du cycle de vie d\'un projet logiciel chez DTech Group.',
        instructions: 'Réorganisez les étapes de la première (1) à la dernière (4).',
        maxPoints: 3,
        orderingItems: [
          'Analyse des besoins et cahier des charges',
          'Conception d\'architecture et modélisation BDD',
          'Développement et tests unitaires continus',
          'Déploiement en production et maintenance opérationnelle'
        ]
      },
      {
        id: 'qz-q6',
        order: 6,
        type: 'SHORT_ANSWER',
        prompt: 'Citez le principe SOLID qui stipule qu\'une classe logicielle ne doit avoir qu\'une seule et unique raison de changer.',
        instructions: 'Saisissez l\'intitulé précis en quelques mots.',
        maxPoints: 2
      },
      {
        id: 'qz-q7',
        order: 7,
        type: 'LONG_ANSWER',
        prompt: 'Expliquez la différence fondamentale entre une base de données relationnelle (SQL) et une base de données documentaire (NoSQL). Donnez un exemple de cas d\'usage professionnel pour chacune.',
        instructions: 'Rédigez une réponse structurée et argumentée (environ 5 à 10 lignes).',
        maxPoints: 4
      }
    ]
  },
  {
    id: 'qz-compta-001',
    centerId: 'center-kara',
    formationId: 'c1-comptabilite-gestion',
    promotionId: 'promo-jan-2026',
    groupId: 'grp-jan26-cpt-g1',
    groupIds: ['grp-jan26-cpt-g1', 'grp-jan26-cpt-g2'],
    courseUnitId: 'crs-compta-base',
    courseUnitCode: 'CPT-101',
    courseUnitTitle: 'Comptabilité Générale & Système SYSCOHADA',
    moduleId: 'm1',
    moduleTitle: 'Comptabilité SYSCOHADA',
    trainerId: 'usr_trainer_02',
    trainerName: 'Mme. Essivi LAWSON',
    title: 'Quiz N°1 Kara — Principes Comptables SYSCOHADA Révisé',
    description: 'Vérification des notions clés du plan comptable général SYSCOHADA et enregistrement des écritures.',
    generalInstructions: 'Saisie manuelle des points exclusivement par votre formatrice référente Mme Lawson au centre de Kara.',
    durationMinutes: 30,
    openingDate: '2026-03-05T08:00:00Z',
    closingDate: '2026-04-20T23:59:59Z',
    displayOrder: 1,
    status: 'published',
    totalMaxPoints: 10,
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-05T08:00:00Z',
    questions: [
      {
        id: 'qz-cpt-q1',
        order: 1,
        type: 'QCM',
        prompt: 'Dans le système SYSCOHADA révisé, quelle classe regroupe les comptes de capitaux propres et emprunts assimilés ?',
        maxPoints: 2,
        options: ['Classe 1', 'Classe 2', 'Classe 4', 'Classe 6']
      },
      {
        id: 'qz-cpt-q2',
        order: 2,
        type: 'TRUE_FALSE',
        prompt: 'Le principe de prudence interdit strictement d\'enregistrer les gains probables mais oblige à provisionner les pertes probables.',
        maxPoints: 3,
        options: ['Vrai', 'Faux']
      },
      {
        id: 'qz-cpt-q3',
        order: 3,
        type: 'SHORT_ANSWER',
        prompt: 'Quel état financier obligatoire synthétise la situation patrimoniale de l\'entreprise à la clôture de l\'exercice ?',
        maxPoints: 2
      },
      {
        id: 'qz-cpt-q4',
        order: 4,
        type: 'LONG_ANSWER',
        prompt: 'Définissez la règle de la partie double et illustrez-la avec l\'achat d\'un matériel informatique par virement bancaire.',
        maxPoints: 3
      }
    ]
  }
];

export const INITIAL_QUIZ_SUBMISSIONS: QuizSubmission[] = [
  // Soumission 1 : Koffi Mawuli AGBEGNINOU (Lomé Avédji) - DÉJÀ VALIDÉE ET PUBLIÉE
  {
    id: 'sub-qz-001',
    quizId: 'qz-dev-001',
    quizTitle: 'Quiz Officiel N°1 — Architecture Web & Fondamentaux Informatiques',
    studentId: 'usr_student_01',
    studentName: 'Koffi Mawuli AGBEGNINOU',
    studentNumber: 'DTECH-2026-0104',
    centerId: 'center-lome-avedji',
    centerName: 'Lomé Avédji (Siège Pédagogique)',
    groupId: 'grp-jan26-dev-g1',
    groupName: 'Groupe 1 — Matin (08h30 - 12h30)',
    formationId: 'c9-developpement-web-mobile',
    formationTitle: 'DÉVELOPPEMENT WEB & MOBILE',
    promotionId: 'promo-jan-2026',
    courseUnitId: 'crs-informatique-base',
    courseUnitCode: 'INF-101',
    courseUnitTitle: 'Informatique & Outils Bureautiques Professionnels',
    moduleId: 'm1',
    moduleTitle: 'Bureautique avancée',
    trainerId: 'usr_trainer_01',
    submittedAt: '2026-03-08T11:20:00Z',
    status: 'published',
    trainerValidation: true,
    totalPointsAttributed: 16.5,
    totalPointsMax: 20,
    officialScore: 16.5,
    officialScore20: 16.5, // (16.5 / 20) * 20 = 16.50 / 20
    generalComment: 'Excellent travail sur les concepts réseau et sécurité. La réponse NoSQL/SQL est claire et argumentée.',
    validatedAt: '2026-03-09T14:30:00Z',
    validatedByTrainerId: 'usr_trainer_01',
    validatedByTrainerName: 'Ing. Kodjo AMENYONA',
    answers: [
      {
        questionId: 'qz-q1',
        questionOrder: 1,
        questionType: 'QCM',
        questionPrompt: 'Quel protocole réseau sécurisé utilise le port standard 443 pour les échanges chiffrés ?',
        maxPoints: 2,
        studentAnswer: 'HTTPS',
        attributedPoints: 2,
        trainerComment: 'Exact'
      },
      {
        questionId: 'qz-q2',
        questionOrder: 2,
        questionType: 'MULTI_SELECT',
        questionPrompt: 'Quels sont les mécanismes recommandés pour sécuriser une API REST moderne ?',
        maxPoints: 3,
        studentAnswer: [
          'Authentification par tokens JWT signés',
          'Limitation de débit (Rate Limiting)',
          'Contrôle des origines (CORS) strict'
        ],
        attributedPoints: 3,
        trainerComment: 'Excellente sélection des 3 mécanismes indispensables'
      },
      {
        questionId: 'qz-q3',
        questionOrder: 3,
        questionType: 'TRUE_FALSE',
        questionPrompt: 'Dans une architecture relationnelle normalisée, une clé étrangère peut pointer vers une colonne non indexée sans aucune contrainte d\'intégrité.',
        maxPoints: 2,
        studentAnswer: 'Faux',
        attributedPoints: 2,
        trainerComment: 'Exact, l\'intégrité référentielle est fondamentale'
      },
      {
        questionId: 'qz-q4',
        questionOrder: 4,
        questionType: 'ASSOCIATION',
        prompt: 'Associez chaque commande Git à son rôle précis dans le cycle de développement.',
        questionPrompt: 'Associez chaque commande Git à son rôle précis dans le cycle de développement.',
        maxPoints: 4,
        studentAnswer: {
          'p1': 'Enregistre un instantané des modifications dans l\'historique local',
          'p2': 'Transfère les commits locaux vers le dépôt distant',
          'p3': 'Récupère et fusionne les changements distants sur la branche courante',
          'p4': 'Crée et bascule immédiatement sur une nouvelle branche'
        },
        attributedPoints: 4,
        trainerComment: 'Parfait sans faute'
      },
      {
        questionId: 'qz-q5',
        questionOrder: 5,
        questionType: 'ORDERING',
        questionPrompt: 'Classez dans l\'ordre chronologique standard les étapes du cycle de vie d\'un projet logiciel chez DTech Group.',
        maxPoints: 3,
        studentAnswer: [
          'Analyse des besoins et cahier des charges',
          'Conception d\'architecture et modélisation BDD',
          'Développement et tests unitaires continus',
          'Déploiement en production et maintenance opérationnelle'
        ],
        attributedPoints: 3,
        trainerComment: 'Ordre exact'
      },
      {
        questionId: 'qz-q6',
        questionOrder: 6,
        questionType: 'SHORT_ANSWER',
        questionPrompt: 'Citez le principe SOLID qui stipule qu\'une classe logicielle ne doit avoir qu\'une seule et unique raison de changer.',
        maxPoints: 2,
        studentAnswer: 'Principe de Responsabilité Unique (Single Responsibility Principle - SRP)',
        attributedPoints: 2,
        trainerComment: 'Très bonne précision bilingue'
      },
      {
        questionId: 'qz-q7',
        questionOrder: 7,
        questionType: 'LONG_ANSWER',
        questionPrompt: 'Expliquez la différence fondamentale entre une base de données relationnelle (SQL) et une base de données documentaire (NoSQL). Donnez un exemple de cas d\'usage professionnel pour chacune.',
        maxPoints: 4,
        studentAnswer: 'Une base SQL (PostgreSQL, MySQL) utilise un schéma strict avec des tables et relations garantissant les transactions ACID. Idéal pour la comptabilité et facturation. Une base NoSQL (MongoDB) stocke des documents flexibles au format JSON, idéale pour des catalogues e-commerce aux attributs variés et un scaling horizontal rapide.',
        attributedPoints: 3.5,
        trainerComment: 'Très bonne synthèse et cas d\'usage pertinents.'
      }
    ] as any
  },

  // Soumission 2 : Étudiant en attente (Lomé Avédji) - EN ATTENTE DE VALIDATION
  {
    id: 'sub-qz-002',
    quizId: 'qz-dev-001',
    quizTitle: 'Quiz Officiel N°1 — Architecture Web & Fondamentaux Informatiques',
    studentId: 'usr_student_03',
    studentName: 'Kokou Jean-Eudes TOSSOU',
    studentNumber: 'DTECH-2026-0112',
    centerId: 'center-lome-avedji',
    centerName: 'Lomé Avédji (Siège Pédagogique)',
    groupId: 'grp-jan26-dev-g1',
    groupName: 'Groupe 1 — Matin (08h30 - 12h30)',
    formationId: 'c9-developpement-web-mobile',
    formationTitle: 'DÉVELOPPEMENT WEB & MOBILE',
    promotionId: 'promo-jan-2026',
    courseUnitId: 'crs-informatique-base',
    courseUnitCode: 'INF-101',
    courseUnitTitle: 'Informatique & Outils Bureautiques Professionnels',
    moduleId: 'm1',
    moduleTitle: 'Bureautique avancée',
    trainerId: 'usr_trainer_01',
    submittedAt: '2026-03-09T09:45:00Z',
    status: 'pending_result',
    trainerValidation: false,
    officialScore: undefined,
    officialScore20: undefined,
    totalPointsAttributed: undefined,
    totalPointsMax: 20,
    answers: [
      {
        questionId: 'qz-q1',
        questionOrder: 1,
        questionType: 'QCM',
        questionPrompt: 'Quel protocole réseau sécurisé utilise le port standard 443 pour les échanges chiffrés ?',
        maxPoints: 2,
        studentAnswer: 'HTTPS',
        attributedPoints: undefined
      },
      {
        questionId: 'qz-q2',
        questionOrder: 2,
        questionType: 'MULTI_SELECT',
        questionPrompt: 'Quels sont les mécanismes recommandés pour sécuriser une API REST moderne ?',
        maxPoints: 3,
        studentAnswer: [
          'Authentification par tokens JWT signés',
          'Limitation de débit (Rate Limiting)'
        ],
        attributedPoints: undefined
      },
      {
        questionId: 'qz-q3',
        questionOrder: 3,
        questionType: 'TRUE_FALSE',
        questionPrompt: 'Dans une architecture relationnelle normalisée, une clé étrangère peut pointer vers une colonne non indexée sans aucune contrainte d\'intégrité.',
        maxPoints: 2,
        studentAnswer: 'Faux',
        attributedPoints: undefined
      },
      {
        questionId: 'qz-q4',
        questionOrder: 4,
        questionType: 'ASSOCIATION',
        questionPrompt: 'Associez chaque commande Git à son rôle précis dans le cycle de développement.',
        maxPoints: 4,
        studentAnswer: {
          'p1': 'Enregistre un instantané des modifications dans l\'historique local',
          'p2': 'Transfère les commits locaux vers le dépôt distant',
          'p3': 'Récupère et fusionne les changements distants sur la branche courante',
          'p4': 'Crée et bascule immédiatement sur une nouvelle branche'
        },
        attributedPoints: undefined
      },
      {
        questionId: 'qz-q5',
        questionOrder: 5,
        questionType: 'ORDERING',
        questionPrompt: 'Classez dans l\'ordre chronologique standard les étapes du cycle de vie d\'un projet logiciel chez DTech Group.',
        maxPoints: 3,
        studentAnswer: [
          'Analyse des besoins et cahier des charges',
          'Conception d\'architecture et modélisation BDD',
          'Développement et tests unitaires continus',
          'Déploiement en production et maintenance opérationnelle'
        ],
        attributedPoints: undefined
      },
      {
        questionId: 'qz-q6',
        questionOrder: 6,
        questionType: 'SHORT_ANSWER',
        questionPrompt: 'Citez le principe SOLID qui stipule qu\'une classe logicielle ne doit avoir qu\'une seule et unique raison de changer.',
        maxPoints: 2,
        studentAnswer: 'Single Responsibility Principle',
        attributedPoints: undefined
      },
      {
        questionId: 'qz-q7',
        questionOrder: 7,
        questionType: 'LONG_ANSWER',
        questionPrompt: 'Expliquez la différence fondamentale entre une base de données relationnelle (SQL) et une base de données documentaire (NoSQL). Donnez un exemple de cas d\'usage professionnel pour chacune.',
        maxPoints: 4,
        studentAnswer: 'Le SQL fonctionne avec des tables liées par des relations et un schéma rigide. Le NoSQL stocke des documents plus flexibles. Exemple SQL : gestion de paie. Exemple NoSQL : logs d\'activités.',
        attributedPoints: undefined
      }
    ]
  },

  // Soumission 3 : Étudiante Kara (Abla Claire GBANDI) - EN ATTENTE DE VALIDATION
  {
    id: 'sub-qz-kara-001',
    quizId: 'qz-compta-001',
    quizTitle: 'Quiz N°1 Kara — Principes Comptables SYSCOHADA Révisé',
    studentId: 'usr_student_02',
    studentName: 'Abla Claire GBANDI',
    studentNumber: 'DTECH-2026-0205',
    centerId: 'center-kara',
    centerName: 'Kara (Pôle Septentrional)',
    groupId: 'grp-jan26-cpt-g1',
    groupName: 'Groupe 1 — Comptabilité Kara',
    formationId: 'c1-comptabilite-gestion',
    formationTitle: 'COMPTABILITÉ SYSCOHADA & GESTION',
    promotionId: 'promo-jan-2026',
    courseUnitId: 'crs-compta-base',
    courseUnitCode: 'CPT-101',
    courseUnitTitle: 'Comptabilité Générale & Système SYSCOHADA',
    moduleId: 'm1',
    moduleTitle: 'Comptabilité SYSCOHADA',
    trainerId: 'usr_trainer_02',
    submittedAt: '2026-03-09T08:30:00Z',
    status: 'pending_result',
    trainerValidation: false,
    officialScore: undefined,
    officialScore20: undefined,
    totalPointsAttributed: undefined,
    totalPointsMax: 10,
    answers: [
      {
        questionId: 'qz-cpt-q1',
        questionOrder: 1,
        questionType: 'QCM',
        questionPrompt: 'Dans le système SYSCOHADA révisé, quelle classe regroupe les comptes de capitaux propres et emprunts assimilés ?',
        maxPoints: 2,
        studentAnswer: 'Classe 1',
        attributedPoints: undefined
      },
      {
        questionId: 'qz-cpt-q2',
        questionOrder: 2,
        questionType: 'TRUE_FALSE',
        questionPrompt: 'Le principe de prudence interdit strictement d\'enregistrer les gains probables mais oblige à provisionner les pertes probables.',
        maxPoints: 3,
        studentAnswer: 'Vrai',
        attributedPoints: undefined
      },
      {
        questionId: 'qz-cpt-q3',
        questionOrder: 3,
        questionType: 'SHORT_ANSWER',
        questionPrompt: 'Quel état financier obligatoire synthétise la situation patrimoniale de l\'entreprise à la clôture de l\'exercice ?',
        maxPoints: 2,
        studentAnswer: 'Le Bilan comptable',
        attributedPoints: undefined
      },
      {
        questionId: 'qz-cpt-q4',
        questionOrder: 4,
        questionType: 'LONG_ANSWER',
        questionPrompt: 'Définissez la règle de la partie double et illustrez-la avec l\'achat d\'un matériel informatique par virement bancaire.',
        maxPoints: 3,
        studentAnswer: 'Tout débit sur un compte implique un crédit d\'égal montant sur un ou plusieurs autres comptes. Exemple : Débit du compte 244 Matériel informatique et Crédit du compte 521 Banque.',
        attributedPoints: undefined
      }
    ]
  }
];

export const INITIAL_QUIZ_AUDIT_LOGS: QuizAuditLogEntry[] = [
  {
    id: 'aud-qz-001',
    quizAttemptId: 'sub-qz-001',
    quizId: 'qz-dev-001',
    quizTitle: 'Quiz Officiel N°1 — Architecture Web & Fondamentaux Informatiques',
    studentId: 'usr_student_01',
    studentName: 'Koffi Mawuli AGBEGNINOU',
    trainerId: 'usr_trainer_01',
    trainerName: 'Ing. Kodjo AMENYONA',
    centerId: 'center-lome-avedji',
    groupId: 'grp-jan26-dev-g1',
    action: 'official_result_published',
    timestamp: '2026-03-09T14:30:00Z',
    questionScores: [
      { questionId: 'qz-q1', maxPoints: 2, attributedPoints: 2, comment: 'Exact' },
      { questionId: 'qz-q2', maxPoints: 3, attributedPoints: 3, comment: 'Excellente sélection des 3 mécanismes indispensables' },
      { questionId: 'qz-q3', maxPoints: 2, attributedPoints: 2, comment: 'Exact, l\'intégrité référentielle est fondamentale' },
      { questionId: 'qz-q4', maxPoints: 4, attributedPoints: 4, comment: 'Parfait sans faute' },
      { questionId: 'qz-q5', maxPoints: 3, attributedPoints: 3, comment: 'Ordre exact' },
      { questionId: 'qz-q6', maxPoints: 2, attributedPoints: 2, comment: 'Très bonne précision bilingue' },
      { questionId: 'qz-q7', maxPoints: 4, attributedPoints: 3.5, comment: 'Très bonne synthèse et cas d\'usage pertinents.' }
    ],
    totalPointsAttributed: 16.5,
    totalPointsMax: 20,
    officialScore: 16.5,
    generalComment: 'Excellent travail sur les concepts réseau et sécurité. La réponse NoSQL/SQL est claire et argumentée.'
  }
];
