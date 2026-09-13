export type UserRole = 'admin' | 'study_director' | 'secretary' | 'trainer' | 'student' | 'visitor';

export type UserScope = 'ALL_CENTERS' | 'SINGLE_CENTER';

export type DTechCity = 'Lomé Avédji' | 'Avépozo' | 'Kpalimé' | 'Atakpamé' | 'Sokodé' | 'Kara' | 'Dapaong' | 'Autre';

export interface Center {
  id: string;
  name: string;
  city: string;
  region: 'Maritime' | 'Plateaux' | 'Centrale' | 'Kara' | 'Savanes' | string;
  address: string;
  phone: string;
  rawPhone?: string;
  email: string;
  isHeadquarter: boolean;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  openingHours?: string;
  landmark?: string;
  responsibleName?: string;
  secretariesCount?: number;
  trainersCount?: number;
  studentsCount?: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending';
  scope?: UserScope; // 'ALL_CENTERS' pour la Direction Générale / Admin, 'SINGLE_CENTER' pour les utilisateurs locaux
  phone?: string;
  centerId?: string;
  centerName?: string;
  city?: DTechCity | string;
  avatarUrl?: string;
  speciality?: string;
  // For student
  studentNumber?: string;
  formationId?: string; // STRICTEMENT UNE SEULE FORMATION ACTIVE
  formationTitle?: string;
  promotionId?: string;
  promotionName?: string;
  groupId?: string;
  groupName?: string;
  // For trainer
  assignedGroupIds?: string[];
  assignedCourseIds?: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export type PaymentMethod = 'tmoney' | 'flooz' | 'card' | 'bank_transfer' | 'cash_agency';

export type PaymentStatus = 'completed' | 'pending' | 'failed';

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'exercise' | 'link';
  sizeOrDuration: string;
  downloadUrl?: string;
  videoUrl?: string;
  isCompleted?: boolean;
}

export interface CourseModule {
  id: string;
  code?: string;
  title: string;
  duration?: string;
  description?: string;
  lessons?: string[];
  materials?: CourseMaterial[];
  orderIndex?: number;
  learningObjectives?: string[];
}

export type CourseCategory = 
  | 'Informatique & Web' 
  | 'Gestion & Comptabilité' 
  | 'Santé & Médical' 
  | 'Commerce & Transit' 
  | 'Langues & Communication' 
  | 'Réseaux & Maintenance' 
  | 'Design & Infographie' 
  | 'Marketing & Digital' 
  | 'Management & Projets' 
  | 'Ressources Humaines'
  | 'Banque & Microfinance'
  | 'Administration & Collectivités'
  | 'Petite Enfance & Éducation'
  | 'Tous domaines';

export interface PedagogicalPhase {
  id: string;
  phaseNumber: 1 | 2;
  title: string; // ex: "Phase 1 — Tronc Commun" ou "Phase 2 — Spécialisation Professionnelle"
  description: string;
  courseIds: string[];
}

export interface PlatformCourse {
  id: string;
  title: string;
  category: CourseCategory | string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Tous niveaux';
  priceFCFA: number;
  registrationFeeFCFA?: number; // Frais d'inscription réglables en ligne (ex: 25 000 FCFA)
  tuitionFeeFCFA?: number; // Frais de scolarité (réglables physiquement au secrétariat)
  durationHours: number;
  durationWeeks: string;
  programType: '9 mois + 3 mois de stage' | '03 mois en stage de formation pratique' | string;
  certificationTitle: string;
  description: string;
  programDetails?: string;
  objectives: string[];
  prerequisites: string;
  targetAudience: string;
  phases?: PedagogicalPhase[];
  modules: CourseModule[];
  sessions?: any[];
  popularRank?: number;
  enrolledStudentsCount: number;
  posterTagline?: string;
  toolsStack?: string[];
  bannerAccentColor?: string;
  promoDiscount?: string;
  imageUrl?: string;
}

export interface Promotion {
  id: string;
  name: string; // ex: "Promotion Janvier 2026", "Promotion Avril 2026"
  sessionCode: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'open' | 'in_progress' | 'completed' | 'archived';
  capacity: number;
  enrolledCount: number;
  formationIds: string[];
}

export interface PromotionGroup {
  id: string;
  name: string; // ex: "Groupe 1 (Matin)", "Groupe 2 (Soir)"
  code: string;
  promotionId: string;
  promotionName?: string;
  formationId: string;
  formationTitle?: string;
  centerId: string;
  centerName?: string;
  trainerIds: string[];
  schedule: string; // ex: "08h30 - 12h30 (Lun - Ven)"
  room: string;
  studentCount: number;
}

export interface GroupCourseAssignment {
  id: string;
  centerId: string;
  formationId: string;
  promotionId: string;
  groupId: string;
  courseUnitId: string; // ex: "CPT-101", "INF-101", "ANG-101", "DEV-201"
  courseUnitCode: string;
  courseUnitTitle: string;
  trainerId: string;
  trainerName: string;
  assignedByDeId: string;
  assignedAt: string;
  status: 'active' | 'completed' | 'suspended';
}

export interface CourseUnit {
  id: string;
  code: string; // ex: "INF-101", "CPT-102"
  title: string;
  description: string;
  formationId: string; // or 'common' for shared tronc commun
  formationTitle?: string;
  phase: 'common_core' | 'specialization';
  phaseTitle: string;
  hours: number;
  trainerId?: string;
  trainerName?: string;
  modules: CourseModule[];
}

export interface CourseResource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'exercise' | 'presentation' | 'video' | 'link';
  courseId: string; // ID de l'Unité d'Enseignement
  courseTitle: string;
  courseCode?: string;
  moduleId: string; // ID du Module Certifiant
  moduleTitle: string;
  centerId: string; // Centre de formation émetteur
  centerName?: string;
  promotionId: string;
  groupIds: string[]; // Groupes autorisés à accéder à ce document
  groupNames?: string[];
  authorId: string; // Formateur auteur
  authorName: string;
  createdAt: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: string;
  orderIndex?: number; // Support 01, Support 02...
  status: 'published' | 'draft' | 'archived';
  directPublished: boolean; // Directement publié par le formateur sans validation préalable du DE
  exerciseRefId?: string; // Liaison préparatoire pour futurs exercices
  quizRefId?: string; // Liaison préparatoire pour futurs quiz
}

// ============================================================================
// ÉTAPE 4 : MOTEUR D'EXERCICES ET TRAVAUX PRATIQUES (MODÈLES OFFICIELS)
// ============================================================================

export type ExerciseQuestionType = 
  | 'qcm'            // Choix multiple (une ou plusieurs réponses)
  | 'true_false'      // Vrai ou Faux
  | 'short_answer'    // Réponse courte textuelle
  | 'long_answer'     // Réponse longue / développement (correction manuelle)
  | 'file_upload';    // Dépôt de fichier (PDF, DOCX, XLSX, PPTX, ZIP)

export interface ExerciseQuestion {
  id: string;
  exerciseId: string;
  orderIndex: number;
  prompt: string; // Énoncé
  type: ExerciseQuestionType;
  points: number;
  options?: string[]; // Pour QCM
  correctAnswers?: string | string[]; // Pour correction automatique (QCM, Vrai/Faux, Réponse courte)
  maxFileSizeMB?: number; // Limite de taille pour dépôt de fichier
  allowedExtensions?: string[]; // Ex: ['pdf', 'docx', 'xlsx', 'pptx', 'zip']
  requiresManualGrading: boolean;
  sampleAnswer?: string; // Corrigé type / critères de notation
  explanation?: string; // Explication pédagogique
}

// Workflow des évaluations et exercices : Brouillon -> Publié -> Expiré -> Archivé
export type ExerciseStatus = 'draft' | 'published' | 'archived' | 'expired';

export interface Exercise {
  id: string;
  centerId: string;
  centerName?: string;
  groupId: string;
  groupIds?: string[];
  groupNames?: string[];
  courseUnitId: string; // ID de l'UE
  courseCode?: string;
  courseTitle?: string;
  moduleId: string; // ID du module certifiant
  moduleTitle?: string;
  trainerId: string;
  trainerName?: string;
  title: string;
  description: string;
  instructions: string;
  type: 'practical_work' | 'exercise' | 'evaluation' | 'quiz';
  totalPoints: number; // Ex: 20
  status: ExerciseStatus;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  estimatedDurationMinutes?: number;
  questions: ExerciseQuestion[];
}

// Réponse fournie par un étudiant à une question d'exercice (Correction exclusivement humaine)
export interface ExerciseAnswer {
  questionId: string;
  questionPrompt?: string;
  questionType: ExerciseQuestionType;
  pointsPossible: number;
  studentAnswer?: string | string[]; // Texte ou options sélectionnées
  fileUrl?: string; // Si dépôt de fichier
  fileName?: string;
  fileSizeBytes?: string;
  
  // Correction manuelle exclusive par le formateur
  pointsEarned?: number; // Points attribués manuellement par le formateur
  trainerComment?: string; // Annotation ou commentaire pédagogique du formateur
  isGraded?: boolean; // True dès que le formateur a évalué la question
  
  // Rétrocompatibilité désactivée (la notation automatique est strictement supprimée)
  isAutoGraded?: boolean; // Toujours false
  provisionalPoints?: number;
  originalSystemPoints?: number;
  isOverridden?: boolean;
}

// Cycle de vie d'une copie : 
// Brouillon (draft) -> Publié (published) -> En cours (in_progress) -> Soumis (submitted) -> En attente de correction (pending_correction) -> Corrigé (graded / reviewed) -> Note publiée (published)
export type ExerciseAttemptStatus = 
  | 'draft' 
  | 'published'
  | 'in_progress' 
  | 'submitted' 
  | 'pending_correction'
  | 'pending_trainer_validation' 
  | 'reviewed' 
  | 'graded' 
  | 'expired';

// Audit Trail de traçabilité obligatoire des corrections : Formateur, Date/Heure, Points par question, Note, Validation, Publication
export interface EvaluationAuditTrail {
  // Données obligatoires de traçabilité formateur
  trainerId?: string;
  trainerName?: string;
  gradedAt?: string; // Date et heure de correction
  validatedAt?: string; // Date et heure de validation
  publishedAt?: string; // Date et heure de publication
  finalTrainerScore?: number; // Total des points attribués
  finalTrainerScore20?: number; // Note finale sur 20
  pointsPerQuestion?: Record<string, number>; // Points attribués pour chaque question
  trainerComment?: string; // Appréciation ou remarque générale
  actionName?: string; // ex: "Correction manuelle et publication officielle de la note"
  
  // Champs rétrocompatibles
  systemSuggestedScore?: number;
  systemSuggestedScore20?: number;
  systemCalculatedAt?: string;
  isScoreOverridden?: boolean;
  scoreDelta?: number;
}

// Tentative d'exercice soumise par un étudiant
export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  exerciseTitle?: string;
  courseTitle?: string;
  courseCode?: string;
  moduleTitle?: string;
  studentId: string;
  studentName?: string;
  studentNumber?: string;
  centerId: string;
  groupId: string;
  startedAt: string;
  submittedAt: string;
  status: ExerciseAttemptStatus;
  
  // ==========================================================================
  // RÈGLE FONDAMENTALE : CORRECTION ET NOTATION EXCLUSIVEMENT HUMAINES
  // Aucune notation automatique. Aucune décision pédagogique par la machine.
  // ==========================================================================
  trainerValidation: boolean; // True si validé et publié officiellement par le formateur
  officialScore?: number; // Total des points explicitement attribués par le formateur
  officialScore20?: number; // Note officielle sur 20 calculée à partir des points du formateur
  isValidated: boolean; // True si officialScore20 >= 10 après validation humaine
  publishedAt?: string; // Date et heure de publication de la note
  
  // Traçabilité complète obligatoire
  auditTrail?: EvaluationAuditTrail;

  // Notes et points
  totalPointsEarned?: number; // Points attribués par le formateur
  maxPoints: number; // Total des points possibles
  score20?: number; // Note sur 20 (uniquement renseignée ou rendue publique après validation formateur)
  
  // Rétrocompatibilité (valeurs neutres / non automatiques)
  provisionalPoints?: number;
  provisionalScore20?: number;
  isProvisional?: boolean;
  isScoreOverridden?: boolean;
  
  answers: ExerciseAnswer[];
  generalFeedback?: string; // Appréciation générale du formateur
  gradedBy?: string; // ID du formateur
  gradedByName?: string; // Nom du formateur
  gradedAt?: string; // Date de correction
  validatedBy?: string;
  validatedByName?: string;
  validatedAt?: string;
  attemptNumber: number;

  // Historique des modifications de notes officielles (Étape 6)
  gradeHistory?: GradeModificationEntry[];
}

// Trace d'audit d'une modification de note officielle par un formateur (Étape 6)
export interface GradeModificationEntry {
  id: string;
  attemptId: string;
  exerciseId: string;
  exerciseTitle?: string;
  studentId: string;
  studentName?: string;
  previousScore20?: number;
  newScore20: number;
  trainerId: string;
  trainerName: string;
  modifiedAt: string;
  reason: string; // Motif obligatoire de modification
}

// Élément d'évaluation pris en compte dans le calcul du module
export interface EvaluationItemScore {
  evaluationId: string;
  title: string;
  type: 'exercise' | 'practical_work' | 'evaluation' | 'quiz';
  officialScore20: number;
  publishedAt: string;
  attemptId: string;
  attemptNumber: number;
  trainerName?: string;
}

// État d'avancement du calcul de l'évaluation du module (Étape 6)
export type ModuleCalculationState = 
  | 'waiting_evaluations' // "En attente d’évaluations" (aucune note officielle publiée)
  | 'waiting_required_evaluations' // "En attente de toutes les évaluations requises" (notes partielles, copies manquantes ou non corrigées)
  | 'available' // "Résultat disponible" (exercices + quiz officiels disponibles)
  | 'complete'; // "Évaluation complète" (toutes les évaluations prévues sont corrigées et publiées)

// Synthèse de l'évaluation d'un module (Étape 6 - Formule: (Exercices × 0.60) + (Quiz × 0.40))
export interface ModuleEvaluationSummary {
  courseUnitId: string;
  courseUnitCode: string;
  courseUnitTitle: string;
  moduleId: string;
  moduleTitle: string;
  studentId: string;
  studentName: string;
  studentNumber?: string;
  centerId: string;
  centerName?: string;
  groupId: string;
  groupName?: string;
  formationId?: string;
  formationTitle?: string;

  // Volet 1 : Exercices & Travaux Pratiques (Poids : 60%)
  exercisesWeight: number; // 0.60 (60%)
  exercisesPlannedCount: number; // Total exercices prévus pour ce module
  exercisesSubmittedCount: number; // Copies soumises par l'étudiant
  exercisesGradedCount: number; // Copies corrigées par le formateur
  exercisesOfficialPublishedCount: number; // Copies validées et officiellement publiées
  exercisesScores: EvaluationItemScore[]; // Notes officielles retenues
  exercisesAverage20: number | null; // Moyenne arithmétique des notes officielles (/20), null si aucune

  // Volet 2 : Quiz (Poids : 40%)
  quizzesWeight: number; // 0.40 (40%)
  quizzesPlannedCount: number; // Total quiz prévus pour ce module
  quizzesSubmittedCount: number; // Tentatives quiz soumises
  quizzesGradedCount: number; // Quiz corrigés
  quizzesOfficialPublishedCount: number; // Quiz validés et officiellement publiés
  quizzesScores: EvaluationItemScore[]; // Notes officielles des quiz
  quizzesAverage20: number | null; // Moyenne arithmétique des quiz officiels (/20), null si aucun

  // Volet 3 : Résultat pondéré du module
  moduleScore20: number | null; // (Moyenne exercices × 0.60) + (Moyenne quiz × 0.40), null si en attente
  calculationState: ModuleCalculationState;
  calculationStateLabel: string; // 'En attente d’évaluations' | 'En attente de toutes les évaluations requises' | 'Résultat disponible' | 'Évaluation complète'
  formulaDisplay: string; // "Note module = (Note exercices × 0,60) + (Note quiz × 0,40)"

  // Suivi des évaluations requises (DE & Formateur)
  evaluationsTotalPlanned: number; // Total prévu (exercices + quiz)
  evaluationsTotalPublished: number; // Total officiel publié
  evaluationsRemainingCount: number; // Restant à publier
  missingOrPendingItems: string[]; // Détail des éléments non encore publiés
  isCalculationReady: boolean;
}

// Structure rétrocompatible
export interface CourseExercise extends Exercise {}

// ============================================================================
// MOTEUR OFFICIEL DES QUIZ (ÉTAPE 5)
// ============================================================================

export type QuizStatus = 'draft' | 'published' | 'archived';

export type QuizQuestionType = 
  | 'QCM' 
  | 'MULTI_SELECT' 
  | 'TRUE_FALSE' 
  | 'ASSOCIATION' 
  | 'ORDERING' 
  | 'SHORT_ANSWER' 
  | 'LONG_ANSWER';

export interface QuizAssociationPair {
  id: string;
  left: string;
  right: string;
}

export interface QuizQuestion {
  id: string;
  order: number;
  type: QuizQuestionType;
  prompt: string; // Énoncé de la question
  instructions?: string; // Consigne spécifique
  maxPoints: number; // Points maximum
  options?: string[]; // Options pour QCM et MULTI_SELECT
  associationPairs?: QuizAssociationPair[]; // Paires pour ASSOCIATION
  orderingItems?: string[]; // Éléments à classer pour ORDERING
  // RÈGLE ABSOLUE : Même lorsqu'une réponse attendue est enregistrée, cette information
  // ne doit JAMAIS déclencher une attribution automatique de points.
  expectedAnswerSample?: string;
}

export interface Quiz {
  id: string;
  centerId: string;
  formationId: string;
  promotionId: string;
  groupId: string;
  groupIds?: string[];
  courseUnitId: string;
  courseUnitCode?: string;
  courseUnitTitle?: string;
  moduleId: string;
  moduleTitle?: string;
  trainerId: string;
  trainerName?: string;
  title: string;
  description: string;
  generalInstructions?: string;
  durationMinutes?: number;
  openingDate?: string;
  closingDate?: string;
  displayOrder: number;
  status: QuizStatus;
  totalMaxPoints: number;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export type QuizSubmissionStatus = 'pending_result' | 'published';

export interface QuizStudentAnswer {
  questionId: string;
  questionOrder: number;
  questionType: QuizQuestionType;
  questionPrompt: string;
  maxPoints: number;
  // Réponses exactes enregistrées de l'étudiant
  studentAnswer: any;
  // Saisie manuelle exclusive par le formateur habilité (undefined tant que non saisi)
  attributedPoints?: number;
  trainerComment?: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  centerId: string;
  centerName?: string;
  groupId: string;
  groupName?: string;
  formationId: string;
  formationTitle?: string;
  promotionId: string;
  courseUnitId: string;
  courseUnitCode?: string;
  courseUnitTitle?: string;
  moduleId: string;
  moduleTitle?: string;
  trainerId: string;
  answers: QuizStudentAnswer[];
  submittedAt: string;
  
  // Statuts stricts
  status: QuizSubmissionStatus; // 'pending_result' | 'published'
  trainerValidation: boolean; // false tant que non validé
  
  // Résultat officiel (undefined tant que non validé par le formateur)
  officialScore?: number; // Note /20
  officialScore20?: number; // Note /20 (compatibilité avec Étape 6)
  totalPointsAttributed?: number; // Somme des points saisis par le formateur
  totalPointsMax: number; // Somme des points maximum
  
  generalComment?: string;
  validatedAt?: string;
  validatedByTrainerId?: string;
  validatedByTrainerName?: string;
  isDraftSaved?: boolean; // Indique une saisie provisoire en cours par le formateur
  attemptNumber?: number; // Tentative 1 ou 2 (Étape 7)
  revisionHistory?: EvaluationAttemptRevision[]; // Historique de révision officielle
}

export type QuizAuditAction = 'result_saved' | 'official_result_published' | 'result_revised';

export interface QuizAuditLogEntry {
  id: string;
  quizAttemptId: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  trainerId: string;
  trainerName: string;
  centerId: string;
  groupId: string;
  action: QuizAuditAction;
  timestamp: string;
  questionScores: {
    questionId: string;
    maxPoints: number;
    attributedPoints: number;
    comment?: string;
  }[];
  totalPointsAttributed: number;
  totalPointsMax: number;
  officialScore: number; // /20
  previousScore?: number;
  revisionReason?: string; // Motif obligatoire lors d'une révision
  generalComment?: string;
}

export interface QuizTestResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details: string;
}

// Structure rétrocompatible pour CourseQuiz existant
export interface CourseQuiz {
  id: string;
  centerId: string;
  promotionId: string;
  groupIds: string[];
  courseId: string;
  courseCode: string;
  moduleId: string;
  moduleTitle: string;
  trainerId: string;
  trainerName: string;
  title: string;
  description: string;
  questionsCount: number;
  durationMinutes: number;
  passScorePercent: number; // 50% = 10/20
  status: 'published' | 'draft';
  totalPoints: number;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentNumber: string; // ex: "DTECH-2026-0841"
  fullName: string;
  email: string;
  phone: string;
  city: string;
  centerId: string;
  centerName: string;
  // STRICTEMENT UNE SEULE FORMATION ACTIVE
  formationId: string;
  formationTitle: string;
  promotionId: string;
  promotionName: string;
  groupId: string;
  groupName: string;
  enrollmentDate: string;
  registrationFeePaid: boolean;
  registrationReceiptNumber: string;
  status: 'active' | 'graduated' | 'suspended';
  overallProgressPercent: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  courseId: string;
  courseTitle: string;
  groupId: string;
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  trainerId: string;
  trainerName?: string;
  comment?: string;
}

export interface EvaluationRecord {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  groupId: string;
  promotionId: string;
  type: 'devoir' | 'examen_partiel' | 'projet_pratique' | 'examen_final';
  maxScore: number;
  date: string;
  coefficient: number;
}

export interface GradeRecord {
  id: string;
  evaluationId: string;
  evaluationTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  comment?: string;
  enteredByTrainerId: string;
  enteredAt: string;
}

export interface OnlineRegistration {
  id: string;
  dossierNumber: string; // ex: "DOS-2026-0482"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  address?: string;
  idCardType: 'CNI' | 'Passeport' | 'Acte de Naissance' | 'Autre';
  idCardNumber: string;
  centerId: string;
  centerName: string;
  formationId: string;
  formationTitle: string;
  promotionId: string;
  promotionName: string;
  preferredSchedule: 'jour' | 'soir';
  assignedGroupId?: string;
  assignedGroupName?: string;
  registrationFeeFCFA: number; // 25 000 FCFA
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paymentStatus: PaymentStatus;
  receiptNumber: string;
  registrationDate: string;
  status: 'validated' | 'pending' | 'rejected';
}

export interface RegistrationReceipt {
  receiptNumber: string;
  dossierNumber: string;
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  centerName: string;
  centerAddress: string;
  formationTitle: string;
  promotionName: string;
  groupName: string;
  amountFCFA: number; // 25 000 FCFA
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paymentDate: string;
  issuedBy: string;
  officialStamp: string;
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentCity: DTechCity | string;
  centerId?: string;
  centerName?: string;
  courseId: string;
  courseTitle: string;
  promotionId?: string;
  promotionName?: string;
  groupId?: string;
  groupName?: string;
  sessionId: string;
  sessionDetails: string;
  enrollmentDate: string;
  amountFCFA: number; // Frais d'inscription réglés en ligne
  registrationFeeFCFA?: number;
  tuitionFeeTotal?: number;
  tuitionFeeRemaining?: number;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paymentStatus: PaymentStatus;
  progressPercent: number;
  completedModulesCount: number;
  totalModulesCount: number;
  certificateIssued: boolean;
  certificateNumber?: string;
  grade?: string;
}

export interface VerifiedCertificate {
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  completionDate: string;
  grade: string;
  hours: number;
  location: string;
  instructorName: string;
  directorSignature: string;
  qrVerificationUrl: string;
  status: 'valid' | 'revoked';
}

export interface Trainer {
  id: string;
  name: string;
  title: string;
  speciality: string;
  email: string;
  phone: string;
  location: string;
  centerId?: string;
  activeCourses: string[];
  assignedGroups?: string[];
  totalStudentsTrained: number;
  rating: number;
}

export interface DTechNews {
  id: string;
  title: string;
  date: string;
  category: 'Session de formation' | 'Événement' | 'Opportunité' | 'Partenariat' | 'Partenariat International' | string;
  summary: string;
  content: string;
  author: string;
  location: string;
}

export interface AdminStats {
  activeFormations: number;
  totalEnrolledStudents: number;
  monthlyEnrollments: number;
  monthlyRevenueFCFA: number;
  totalRevenueFCFA: number;
  pendingPaymentsCount: number;
  certificatesIssuedCount: number;
  topFormations?: { name: string; enrolled: number; revenueFCFA: number }[];
  activeTrainersCount?: number;
  retentionRatePercent?: number;
}

export interface Formation {
  id: string;
  title: string;
  category?: string;
  categoryLabel?: string;
  level?: string;
  duration: string;
  price: string;
  description: string;
  modalite?: string;
  program?: string[];
  objectives?: string[];
  prerequisites?: string;
  audience?: string;
  targetAudience?: string;
  badge?: string;
  sessions: any[];
  modules?: any[];
  certificate?: string;
}

export interface ServiceExpertise {
  id: string;
  title: string;
  category?: string;
  icon?: string;
  iconName?: string;
  shortDesc: string;
  fullDesc: string;
  target?: string;
  methodology?: string[];
  features?: string[];
  deliverables: string[];
}

export interface CentreInfo {
  id?: string;
  city: string;
  title?: string;
  role?: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email: string;
  hours?: string;
  openingHours?: string;
  coordinates?: string;
  features?: string[];
  servicesAvailable?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  city?: 'Lomé' | 'Kara';
  content?: string;
  comment?: string;
  rating: number;
  service: string;
}

export type NotificationType = 'payment_validated' | 'new_session_opened' | 'certificate_issued' | 'system' | 'new_resource' | 'new_grade';

export interface AppNotification {
  id: string;
  userId?: string;
  targetRole?: 'all' | 'student' | 'trainer' | 'admin' | 'study_director' | 'secretary';
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  linkPath?: string;
  actionUrl?: string;
  metadata?: any;
}

export interface StudentData {
  id?: string;
  name: string;
  studentNumber?: string;
  formationTitle?: string;
  centerName?: string;
  promotionName?: string;
  groupName?: string;
  [key: string]: any;
}

export interface TrainerData {
  id?: string;
  name: string;
  speciality?: string;
  centerName?: string;
  [key: string]: any;
}

export interface SecretaryData {
  id?: string;
  name: string;
  centerName?: string;
  [key: string]: any;
}

export interface StudyDirectorData {
  id?: string;
  name: string;
  centerName?: string;
  [key: string]: any;
}

export interface CenterData {
  id?: string;
  name: string;
  city?: string;
  address?: string;
  [key: string]: any;
}

// ============================================================================
// ÉTAPE 7 — MOTEUR OFFICIEL DES TENTATIVES ET DE L’HISTORIQUE DES RÉSULTATS
// ============================================================================

export type EvaluationType = 'exercise' | 'quiz';

export type EvaluationAttemptStatus = 
  | 'available'
  | 'in_progress'
  | 'submitted'
  | 'pending_result'
  | 'published'
  | 'cancelled';

export interface EvaluationAttemptRevision {
  id: string;
  attemptId: string;
  previousScore: number;
  newScore: number;
  trainerId: string;
  trainerName: string;
  reason: string; // MOTIF OBLIGATOIRE
  timestamp: string;
}

export interface EvaluationAttempt {
  id: string; // ID unique
  attemptId: string;
  studentId: string;
  studentName?: string;
  studentNumber?: string;
  evaluationId: string;
  evaluationTitle: string;
  evaluationType: EvaluationType;
  centerId: string;
  centerName?: string;
  formationId: string;
  formationTitle?: string;
  promotionId: string;
  promotionName?: string;
  groupId: string;
  groupName?: string;
  courseUnitId: string;
  courseUnitCode?: string;
  courseUnitTitle?: string;
  moduleId: string;
  moduleTitle?: string;
  attemptNumber: number; // 1 | 2 (Strictement plafonné à 2)
  status: EvaluationAttemptStatus;
  createdAt: string;
  startedAt?: string;
  submittedAt?: string;

  // Validation humaine
  trainerValidation: boolean; // false tant que non validé par le formateur
  officialScore?: number; // Note officielle sur 20 (undefined tant que non publié)
  totalPointsEarned?: number;
  totalPointsMax?: number;
  
  validatedAt?: string;
  validatedByTrainerId?: string;
  validatedByTrainerName?: string;
  generalComment?: string;
  
  // Données de réponse
  answers?: any;
  revisionHistory?: EvaluationAttemptRevision[];
}

export interface StudentEvaluationAttemptsSummary {
  evaluationId: string;
  evaluationTitle: string;
  evaluationType: EvaluationType;
  courseUnitId: string;
  courseUnitCode?: string;
  courseUnitTitle?: string;
  moduleId: string;
  moduleTitle?: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  centerId: string;
  centerName?: string;
  groupId: string;
  groupName?: string;
  maxAttempts: number; // Toujours 2
  attemptCount: number; // 0, 1, ou 2
  canAttempt: boolean; // attemptCount < 2
  attempts: EvaluationAttempt[];
  officialAttempts: EvaluationAttempt[]; // attempts où trainerValidation === true && status === 'published'
  bestScore?: number; // Meilleure note officielle (/20) parmi les tentatives publiées
  latestScore?: number; // Note officielle (/20) de la dernière tentative publiée
  latestAttemptNumber?: number;
  hasPendingResult: boolean;
}

export interface AttemptAuditEvent {
  id: string;
  action: 'attempt_created' | 'attempt_submitted' | 'result_published' | 'result_revised' | 'attempt_cancelled';
  attemptId: string;
  attemptNumber: number;
  studentId: string;
  studentName: string;
  evaluationId: string;
  evaluationTitle: string;
  evaluationType: EvaluationType;
  centerId: string;
  groupId: string;
  trainerId?: string;
  trainerName?: string;
  previousScore?: number;
  newScore?: number;
  reason?: string;
  timestamp: string;
}

// ============================================================================
// ÉTAPE 8 — VALIDATION OFFICIELLE DES MODULES (RÈGLES 60/40 & BEST SCORE)
// ============================================================================

export type ModuleValidationStatus = 'pending_evaluations' | 'validated' | 'not_validated';

export interface ModuleValidationHistoryEntry {
  id: string;
  action: 'initial_calculation' | 'status_validated' | 'status_unvalidated' | 'score_revised';
  previousStatus?: ModuleValidationStatus;
  newStatus: ModuleValidationStatus;
  previousScore?: number;
  newScore?: number;
  userId: string;
  userName: string;
  userRole?: string;
  reason?: string;
  timestamp: string;
}

export interface ModuleValidationRecord {
  id: string;
  moduleId: string;
  moduleTitle: string;
  moduleOrder?: number;
  courseUnitId: string;
  courseUnitCode?: string;
  courseUnitTitle: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  centerId: string;
  centerName: string;
  formationId: string;
  formationTitle: string;
  promotionId: string;
  promotionName: string;
  groupId: string;
  groupName: string;

  // Notes officielles retenues (règle du Best Score)
  exerciseScore?: number; // Note /20 des exercices/TP (bestScore retenu)
  quizScore?: number;     // Note /20 des quiz (bestScore retenu)
  finalScore?: number;    // Note finale /20 = (exerciseScore * 0.60) + (quizScore * 0.40)

  // Scores de suivi pour l'historique (ne jamais écraser latestScore)
  exerciseLatestScore?: number;
  quizLatestScore?: number;

  status: ModuleValidationStatus;
  statusLabel: 'Module validé' | 'Module non validé' | 'Évaluations en attente';

  validatedAt?: string;
  validatedBy?: string;
  validatedByName?: string;
  resultSource: 'official_evaluation_engine';

  history: ModuleValidationHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ModuleValidationAuditEntry {
  id: string;
  studentId: string;
  studentName?: string;
  moduleId: string;
  moduleTitle?: string;
  centerId: string;
  previousStatus?: ModuleValidationStatus;
  newStatus: ModuleValidationStatus;
  previousScore?: number;
  newScore?: number;
  userId: string;
  userName: string;
  userRole: string;
  action: 'module_evaluated' | 'module_validated' | 'module_not_validated' | 'module_score_revised';
  reason?: string;
  timestamp: string;
}

export interface Step8ModuleValidationTestResult {
  id: string;
  testNumber: number;
  name: string;
  description: string;
  passed: boolean;
  details: string;
}

// ============================================================================
// ÉTAPE 9 — TYPES OFFICIELS DE DIPLÔME (CARTE VISUELLE, ÉLIGIBILITÉ & AUDIT)
// ============================================================================

export type DiplomaStatus = 'partial' | 'final_validated' | 'revoked';

export interface DiplomaModuleCheck {
  moduleId: string;
  moduleTitle: string;
  courseTitle: string;
  courseCode?: string;
  status: ModuleValidationStatus;
  score?: number;
  isValidated: boolean;
}

export interface DiplomaEligibility {
  isEligible: boolean;
  totalModules: number;
  validatedModules: number;
  pendingModules: number;
  failedModules: number;
  missingModulesCount: number;
  overallAverageScore?: number;
  academicMention?: 'Passable' | 'Assez Bien' | 'Bien' | 'Très Bien' | 'Excellent';
  modulesCheck: DiplomaModuleCheck[];
  reasons: string[];
}

export interface DiplomaRecord {
  id: string;
  studentId: string;
  studentFullName: string;
  studentNumber?: string;
  centerId: string;
  centerName: string;
  centerCity: string;
  formationId: string;
  formationTitle: string;
  specialityTitle: string;
  promotionName: string;
  status: DiplomaStatus;
  statusLabel: 'Version Partielle (En cours)' | 'Version Finale Validée' | 'Diplôme Annulé';
  overallAverageScore?: number;
  academicMention?: 'Passable' | 'Assez Bien' | 'Bien' | 'Très Bien' | 'Excellent';
  totalHours?: number;
  issuanceDate: string;
  validatedAt?: string;
  validatedBy?: string;
  validatedByName?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;
  qrVerificationUrl?: string;
  qrCodeDataUrl?: string;
  history: DiplomaAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DiplomaAuditEntry {
  id: string;
  diplomaId: string;
  studentId: string;
  studentName: string;
  centerId: string;
  action: 'partial_viewed' | 'eligibility_checked' | 'final_validated' | 'diploma_revoked';
  previousStatus?: DiplomaStatus;
  newStatus?: DiplomaStatus;
  userId: string;
  userName: string;
  userRole: string;
  reason?: string;
  timestamp: string;
}

export interface Step9DiplomaTestResult {
  id: string;
  testNumber: number;
  name: string;
  description: string;
  passed: boolean;
  details: string;
}


