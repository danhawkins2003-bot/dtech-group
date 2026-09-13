import { PlatformCourse, StudentEnrollment, VerifiedCertificate, Trainer, DTechNews, AdminStats, AppNotification } from '../types';
import { COURSES_9_MONTHS } from './courses9MonthsData';
import { COURSES_3_MONTHS } from './courses3MonthsData';

import heroTrainingImg from '../assets/images/hero_training_center_1786816741559.jpg';
import graphicDesignImg from '../assets/images/graphic_design_studio_1786816754120.jpg';
import webDevImg from '../assets/images/web_development_lab_1786816765641.jpg';
import accountingPowerBiImg from '../assets/images/accounting_powerbi_office_1786816775337.jpg';
import togoStudentsPromoImg from '../assets/images/togo_students_promo_1786957327122.jpg';
import togoGraduateSuccessImg from '../assets/images/togo_graduate_success_1786957341802.jpg';

export { 
  heroTrainingImg, 
  graphicDesignImg, 
  webDevImg, 
  accountingPowerBiImg,
  togoStudentsPromoImg,
  togoGraduateSuccessImg
};

// Informations Institutionnelles Officielles issues des Affiches Officielles DTECH GROUP
export const DTECH_INSTITUTIONAL_DATA = {
  cabinetName: 'DTECH GROUP',
  cabinetFullTitle: 'Cabinet de Management, Études & Conseils',
  partnerInstitute: 'INSTITUT SUPÉRIEUR DELXIA',
  partner: 'INSTITUT SUPÉRIEUR DELXIA',
  accreditationNumber: 'AGRÉMENT N° 003/METFP/CAB/SE-CPO',
  ministry: "Ministère de l'Enseignement Technique et de la Formation Professionnelle (Togo)",
  stateDiplomaMention: "DIPLÔME AGRÉÉ PAR L'ÉTAT",
  slogan: 'FORMEZ-VOUS AUTREMENT, Progressez efficacement !',
  pedagogyTagline: 'FORMATION 100% PRATIQUE — COURS DU JOUR & COURS DU SOIR',
  formula: '09 MOIS + 3 MOIS DE STAGE & 03 MOIS EN STAGE DE FORMATION PRATIQUE',
  trainingFormula: '09 MOIS + 3 MOIS DE STAGE GARANTI',
  nextSessionDate: '14 SEPTEMBRE 2026',
  nextCohortDate: '14 Septembre 2026',
  sessionBadge: 'NOUVELLE RENTRÉE : 14 SEPTEMBRE 2026',
  tiktok: '@cabinetdtech',
  facebook: 'cabinetdtech',
  website: 'www.cabinetdtech.com',
  headquartersAddress: 'AVÉDJI, IMMEUBLE DTECH GROUP, CARREFOUR LIMOUSINE FACE ANSAT',
  hotlines: ['(+228) 92 89 89 79', '98 82 82 16', '22 50 81 86'],
  centers: [
    { id: 'center-lome-avedji', name: 'Lomé Avédji (Siège)', city: 'Lomé Avédji', phone: '(+228) 92 89 89 79 / 22 50 81 86', rawPhone: '+22892898979', isHeadquarter: true, address: 'Avédji, Immeuble DTECH GROUP, Carrefour Limousine face ANSAT', landmark: 'Carrefour Limousine face ANSAT', openingHours: 'Lun - Ven : 07h30 - 21h00 | Sam : 08h00 - 16h00' },
    { id: 'center-avepozo', name: 'Avépozo', city: 'Avépozo', phone: '(+228) 98 82 82 16', rawPhone: '+22898828216', address: 'Avépozo, Carrefour Monument, Lomé Est, Togo', landmark: 'Carrefour Monument', openingHours: 'Lun - Sam : 08h00 - 18h30' },
    { id: 'center-kpalime', name: 'Kpalimé', city: 'Kpalimé', phone: '(+228) 92 89 89 79', rawPhone: '+22892898979', address: 'Quartier Administratif / Centre-ville, Kpalimé, Togo', landmark: 'Proche Centre-Ville', openingHours: 'Lun - Sam : 08h00 - 18h00' },
    { id: 'center-atakpame', name: 'Atakpamé', city: 'Atakpamé', phone: '(+228) 98 82 82 16', rawPhone: '+22898828216', address: 'Quartier Commercial / Proche Grand Marché, Atakpamé, Togo', landmark: 'Proche Grand Marché', openingHours: 'Lun - Sam : 08h00 - 18h00' },
    { id: 'center-kara', name: 'Kara', city: 'Kara', phone: '(+228) 90 18 40 78', rawPhone: '+22890184078', address: 'Quartier Administratif / Proche Université de Kara, Kara, Togo', landmark: 'Proche Université de Kara', openingHours: 'Lun - Ven : 07h30 - 20h00 | Sam : 08h00 - 14h00' },
    { id: 'center-sokode', name: 'Sokodé', city: 'Sokodé', phone: '(+228) 92 89 89 79', rawPhone: '+22892898979', address: 'Quartier Didaouré, Sokodé, Togo', landmark: 'Quartier Didaouré', openingHours: 'Lun - Sam : 08h00 - 18h00' },
    { id: 'center-dapaong', name: 'Dapaong', city: 'Dapaong', phone: '(+228) 98 82 82 16', rawPhone: '+22898828216', address: 'Quartier Nassablé / Route Nationale N°1, Dapaong, Togo', landmark: 'Quartier Nassablé (RN1)', openingHours: 'Lun - Sam : 08h00 - 18h00' }
  ]
};

export const DTECH_INSTITUTION_INFO = DTECH_INSTITUTIONAL_DATA;

// TOUTES LES FORMATIONS OFFICIELLES ISSUES DES 2 PAGES D'AFFICHE DTECH GROUP (40 FORMATIONS AU TOTAL)
export const INITIAL_COURSES: PlatformCourse[] = [
  ...COURSES_9_MONTHS,
  ...COURSES_3_MONTHS
];

export const INITIAL_ENROLLMENTS: StudentEnrollment[] = [
  {
    id: 'ENR-2026-001',
    studentId: 'STU-001',
    studentName: 'Jean-Luc KOFFI',
    studentEmail: 'jeanluc.koffi@gmail.com',
    studentPhone: '+228 92 89 89 79',
    studentCity: 'Lomé',
    courseId: 'c9-developpement-web-mobile',
    courseTitle: 'DÉVELOPPEMENT WEB & MOBILE',
    sessionId: 's-lome',
    sessionDetails: 'Lomé Avédji (Siège) — Début 14/09/2026 (Cours du Jour)',
    enrollmentDate: '2026-08-12',
    amountFCFA: 160000,
    paymentMethod: 'tmoney',
    paymentReference: 'TM-TOGO-89102839',
    paymentStatus: 'completed',
    progressPercent: 45,
    completedModulesCount: 2,
    totalModulesCount: 4,
    certificateIssued: false
  },
  {
    id: 'ENR-2026-002',
    studentId: 'STU-002',
    studentName: 'Afiwa MENSAH',
    studentEmail: 'afi.mensah@yahoo.fr',
    studentPhone: '+228 98 82 82 16',
    studentCity: 'Lomé',
    courseId: 'c9-infographie',
    courseTitle: 'INFOGRAPHIE',
    sessionId: 's-lome',
    sessionDetails: 'Lomé Avédji (Siège) — Session Complétée',
    enrollmentDate: '2026-06-15',
    amountFCFA: 130000,
    paymentMethod: 'flooz',
    paymentReference: 'FL-TG-7729104',
    paymentStatus: 'completed',
    progressPercent: 100,
    completedModulesCount: 4,
    totalModulesCount: 4,
    certificateIssued: true,
    certificateNumber: 'DTECH-2026-TG-8841',
    grade: 'Très Bien (17.5/20)'
  },
  {
    id: 'ENR-2026-003',
    studentId: 'STU-003',
    studentName: 'Mawuli AGBEGNINOU',
    studentEmail: 'mawuli.agb@outlook.com',
    studentPhone: '+228 90 18 40 78',
    studentCity: 'Kara',
    courseId: 'c9-maintenance-reseaux',
    courseTitle: 'MAINTENANCE & RESEAUX INFORMATIQUES',
    sessionId: 's-kara',
    sessionDetails: 'Kara — Début 14/09/2026',
    enrollmentDate: '2026-08-14',
    amountFCFA: 130000,
    paymentMethod: 'tmoney',
    paymentReference: 'TM-TOGO-9912048',
    paymentStatus: 'completed',
    progressPercent: 20,
    completedModulesCount: 1,
    totalModulesCount: 4,
    certificateIssued: false
  },
  {
    id: 'ENR-2026-004',
    studentId: 'STU-004',
    studentName: 'Essi DJONDO',
    studentEmail: 'essi.djondo@gmail.com',
    studentPhone: '+228 92 88 19 02',
    studentCity: 'Lomé',
    courseId: 'c3-stage-comptabilite-finance',
    courseTitle: 'STAGE DE FORMATION PRATIQUE EN COMPTABILITE FINANCE',
    sessionId: 's3-lome',
    sessionDetails: 'Lomé Avédji — Début 14/09/2026',
    enrollmentDate: '2026-08-15',
    amountFCFA: 42000,
    paymentMethod: 'bank_transfer',
    paymentReference: 'VIR-ORABANK-00392',
    paymentStatus: 'pending',
    progressPercent: 0,
    completedModulesCount: 0,
    totalModulesCount: 3,
    certificateIssued: false
  },
  {
    id: 'ENR-2026-005',
    studentId: 'STU-005',
    studentName: 'Kokou FOLY',
    studentEmail: 'k.foly@ecobank.com',
    studentPhone: '+228 90 77 66 55',
    studentCity: 'Lomé',
    courseId: 'c9-organisation-grh',
    courseTitle: 'ORGANISATION & GESTION DES RESSOURCES HUMAINES',
    sessionId: 's-lome',
    sessionDetails: 'Lomé Avédji — Début 14/09/2026',
    enrollmentDate: '2026-08-13',
    amountFCFA: 130000,
    paymentMethod: 'cash_agency',
    paymentReference: 'RECU-CAISSE-LM-440',
    paymentStatus: 'completed',
    progressPercent: 15,
    completedModulesCount: 1,
    totalModulesCount: 4,
    certificateIssued: false
  }
];

export const INITIAL_CERTIFICATES: VerifiedCertificate[] = [
  {
    certificateNumber: 'DTECH-2026-TG-8841',
    studentName: 'Afiwa MENSAH',
    courseTitle: 'INFOGRAPHIE (DIPLÔME AGRÉÉ PAR L\'ÉTAT)',
    completionDate: '2026-07-28',
    grade: 'Mention Très Bien (17.5/20)',
    hours: 360,
    location: 'Lomé, TOGO',
    instructorName: 'M. Fabrice AMEGANDJIN (Lead Designer)',
    directorSignature: 'Dr. Yaovi D. TOSSOU — Directeur Général DTECH GROUP',
    qrVerificationUrl: 'https://cabinetdtech.com/certificat/DTECH-2026-TG-8841',
    status: 'valid'
  },
  {
    certificateNumber: 'DTECH-2026-TG-7420',
    studentName: 'Komi Paul AMEGBLEAME',
    courseTitle: 'DÉVELOPPEMENT WEB & MOBILE',
    completionDate: '2026-06-20',
    grade: 'Mention Excellent (18.5/20)',
    hours: 360,
    location: 'Lomé, TOGO',
    instructorName: 'Ing. Kodjo EDOH (Senior Full Stack Dev)',
    directorSignature: 'Dr. Yaovi D. TOSSOU — Directeur Général DTECH GROUP',
    qrVerificationUrl: 'https://cabinetdtech.com/certificat/DTECH-2026-TG-7420',
    status: 'valid'
  },
  {
    certificateNumber: 'DTECH-2026-TG-6311',
    studentName: 'Bagnan TCHABORE',
    courseTitle: 'CERTIFICAT EN GESTION DE PROJET',
    completionDate: '2026-05-18',
    grade: 'Mention Bien (15/20)',
    hours: 360,
    location: 'Kara, TOGO',
    instructorName: 'M. Sylvanus KOUASSI (PMP Consultant)',
    directorSignature: 'Dr. Yaovi D. TOSSOU — Directeur Général DTECH GROUP',
    qrVerificationUrl: 'https://cabinetdtech.com/certificat/DTECH-2026-TG-6311',
    status: 'valid'
  }
];

export const INITIAL_TRAINERS: Trainer[] = [
  {
    id: 'tr-1',
    name: 'M. Fabrice AMEGANDJIN',
    title: 'Lead Designer Graphique & Directeur Artistique',
    speciality: 'Suite Adobe CC (Photoshop, Illustrator), Montage Vidéo',
    email: 'f.amegandjin@cabinetdtech.com',
    phone: '+228 92 89 89 79',
    location: 'Lomé Avédji',
    activeCourses: ['INFOGRAPHIE', 'CERTIFICAT EN CREATION DE STUDIO MULTIMEDIA SHOOT MONTAGE VIDEO ET REALISATION'],
    totalStudentsTrained: 210,
    rating: 4.9
  },
  {
    id: 'tr-2',
    name: 'Ing. Kodjo EDOH',
    title: 'Ingénieur Concepteur Logiciel & Développeur Senior',
    speciality: 'Développement Web Full-stack, Mobile (Android/iOS) & SEO',
    email: 'k.edoh@cabinetdtech.com',
    phone: '+228 98 82 82 16',
    location: 'Lomé Avédji',
    activeCourses: ['DÉVELOPPEMENT WEB & MOBILE', 'STAGE DE FORMATION PRATIQUE EN PROGRAMMATION INFORMATIQUE'],
    totalStudentsTrained: 185,
    rating: 4.85
  },
  {
    id: 'tr-3',
    name: 'Mme Abra LAWSON',
    title: 'Consultante Financière & Formatrice Certifiée SAARI',
    speciality: 'SAARI Comptabilité, SAARI Paie, SYSCOHADA Révisé',
    email: 'a.lawson@cabinetdtech.com',
    phone: '+228 92 89 89 79',
    location: 'Lomé Avédji',
    activeCourses: ['SECRETARIAT COMPTABILITE & CAISSE MICROFINANCE', 'STAGE DE FORMATION PRATIQUE EN COMPTABILITE FINANCE'],
    totalStudentsTrained: 340,
    rating: 4.95
  },
  {
    id: 'tr-4',
    name: 'M. Sylvanus KOUASSI',
    title: 'Expert en Gestion de Projets & SGBD',
    speciality: 'MS Project, Epidata, Access, Suivi-Évaluation',
    email: 's.kouassi@cabinetdtech.com',
    phone: '+228 90 18 40 78',
    location: 'Kara',
    activeCourses: ['CERTIFICAT EN GESTION DE PROJET', 'STAGE DE FORMATION PRATIQUE EN GESTION DE PROJET & EN LOGICIEL DE GESTION DE BASE DE DONNEE (SGBD)'],
    totalStudentsTrained: 130,
    rating: 4.8
  },
  {
    id: 'tr-5',
    name: 'M. Yao BASSOWA',
    title: 'Spécialiste Réseaux & Maintenance Informatique',
    speciality: 'Maintenance Hardware, Câblage Réseaux, Paraboles TV',
    email: 'y.bassowa@cabinetdtech.com',
    phone: '+228 90 18 40 78',
    location: 'Kara & Lomé',
    activeCourses: ['MAINTENANCE & RESEAUX INFORMATIQUES', 'STAGE DE FORMATION PRATIQUE EN MAINTENANCE & RESEAUX'],
    totalStudentsTrained: 195,
    rating: 4.9
  }
];

export const INITIAL_NEWS: DTechNews[] = [
  {
    id: 'news-1',
    title: 'Rentrée Solennelle du 14 Septembre 2026 : Inscriptions Ouvertes dans les 7 Centres au Togo',
    date: '14 Août 2026',
    category: 'Session de formation',
    summary: 'DTECH GROUP lance officiellement les inscriptions pour les formations de 09 mois + 3 mois de stage et 03 mois de stage pratique.',
    content: 'Les apprenants de Lomé Avédji, Avépozo, Kpalimé, Atakpamé, Kara, Sokodé et Dapaong peuvent dès à présent réserver leur place. Tous les diplômes de 9 mois sont agréés par l\'État avec 3 mois de stage garantis.',
    author: 'Direction Générale DTECH GROUP',
    location: '7 Centres au Togo'
  },
  {
    id: 'news-2',
    title: 'Filières d’Appui Canadien & Américain : Petite Enfance & Aide-Soignante',
    date: '05 Août 2026',
    category: 'Partenariat International',
    summary: 'Ouverture des filières Métiers de la Petite Enfance (Garderie) et Préposé aux Bénéficiaires / Aide-Soignante bénéficiant d\'un appui pédagogique canadien et américain.',
    content: 'Ces formations de 9 mois + 3 mois de stage permettent aux diplômés d\'acquérir des compétences hautement qualifiées répondant aux standards internationaux.',
    author: 'Pôle International DTECH',
    location: 'Lomé Avédji'
  }
];

export const INITIAL_ADMIN_STATS: AdminStats = {
  activeFormations: 40,
  totalEnrolledStudents: 412,
  monthlyEnrollments: 98,
  monthlyRevenueFCFA: 12450000,
  totalRevenueFCFA: 48900000,
  pendingPaymentsCount: 5,
  certificatesIssuedCount: 265,
  topFormations: [
    { name: 'MAINTENANCE & RESEAUX INFORMATIQUES', enrolled: 68, revenueFCFA: 8840000 },
    { name: 'DÉVELOPPEMENT WEB & MOBILE', enrolled: 92, revenueFCFA: 14720000 },
    { name: 'INFOGRAPHIE', enrolled: 77, revenueFCFA: 10010000 },
    { name: 'STAGE DE FORMATION PRATIQUE EN COMPTABILITE FINANCE', enrolled: 95, revenueFCFA: 3990000 }
  ]
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'STU-001',
    type: 'payment_validated',
    title: 'Paiement Confirmé & Validé ✓',
    message: 'Votre versement pour la formation « DÉVELOPPEMENT WEB & MOBILE » a été validé avec succès par la Direction DTECH. Vos modules et plannings sont débloqués.',
    createdAt: 'Il y a 10 minutes',
    read: false,
    linkPath: '#/student',
    metadata: {
      enrollmentId: 'ENR-2026-001',
      studentName: 'Jean-Luc KOFFI',
      courseId: 'c9-developpement-web-mobile',
      courseTitle: 'DÉVELOPPEMENT WEB & MOBILE',
      amountFCFA: 160000,
      paymentMethod: 'tmoney'
    }
  },
  {
    id: 'notif-2',
    userId: 'all',
    type: 'new_session_opened',
    title: 'Rentrée Solennelle : 14 Septembre 2026',
    message: 'Les cohortes en cours du jour et cours du soir débuteront le 14 Septembre 2026 dans les 7 centres DTECH du Togo.',
    createdAt: 'Il y a 1 heure',
    read: false,
    linkPath: '#/',
    metadata: {
      location: 'Lomé Avédji, Avépozo, Kpalimé, Atakpamé, Kara, Sokodé, Dapaong'
    }
  }
];
