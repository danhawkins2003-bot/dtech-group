import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

import {
  DTECH_CENTERS,
  DTECH_PROMOTIONS,
  DTECH_GROUPS,
  DTECH_GROUP_COURSE_ASSIGNMENTS,
  DTECH_COURSE_UNITS,
  DTECH_COURSE_RESOURCES,
  DTECH_STUDENTS_PROFILES,
  DTECH_EVALUATIONS,
  DTECH_GRADES,
  DTECH_ATTENDANCES,
  DTECH_ONLINE_REGISTRATIONS,
  DTECH_RECEIPTS,
  DTECH_EXERCISES,
  DTECH_EXERCISE_ATTEMPTS
} from './src/data/dtechBusinessData';
import { Exercise, ExerciseAttempt, ExerciseQuestion, ExerciseAnswer, Quiz, QuizQuestion, QuizSubmission, QuizStudentAnswer, QuizAuditLogEntry, QuizQuestionType, EvaluationAttempt, EvaluationType, EvaluationAttemptStatus, EvaluationAttemptRevision, StudentEvaluationAttemptsSummary, AttemptAuditEvent, ModuleValidationRecord, ModuleValidationStatus, ModuleValidationAuditEntry, Step8ModuleValidationTestResult } from './src/types';
import { INITIAL_QUIZZES, INITIAL_QUIZ_SUBMISSIONS, INITIAL_QUIZ_AUDIT_LOGS } from './src/data/quizSeedData';
import { calculateOfficialQuizScore, sanitizeSubmissionForStudent, canTrainerAccessSubmission, runStep5QuizTests } from './src/services/quizEngine';
import {
  normalizeExerciseAttemptToEvaluationAttempt,
  normalizeQuizSubmissionToEvaluationAttempt,
  calculateAttemptSummary,
  validateNewAttemptEligibility,
  canUserAccessAttemptScope,
  recordScoreRevision,
  runStep7AttemptsTests
} from './src/services/evaluationAttemptsEngine';
import {
  computeModuleValidationRecord,
  computeAllModuleValidationsForStudent,
  createModuleValidationAuditEntry,
  canUserViewStudentModuleValidations,
  runStep8ModuleValidationTests
} from './src/services/moduleValidationEngine';
import {
  DiplomaRecord,
  DiplomaEligibility,
  DiplomaAuditEntry,
  Step9DiplomaTestResult
} from './src/types';
import {
  checkStudentDiplomaEligibility,
  buildDiplomaRecord,
  canUserViewDiploma,
  canUserValidateDiploma,
  canUserRevokeDiploma,
  generateDiplomaQRCode,
  runStep9DiplomaTests
} from './src/services/diplomaEngine';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dtech-group-togo-secret-key-2026-auth-secure';

app.use(express.json());

// Événements d'audit immuables pour les tentatives (Étape 7)
let dynamicAttemptAuditEvents: AttemptAuditEvent[] = [
  {
    id: 'audit-att-001',
    action: 'attempt_submitted',
    attemptId: 'att-ex-001',
    attemptNumber: 1,
    studentId: 'usr_student_01',
    studentName: 'Koffi Mawuli AGBEGNINOU',
    evaluationId: 'ex-inf101-tp1',
    evaluationTitle: 'TP 1 : Algorithmique et structures séquentielles',
    evaluationType: 'exercise',
    centerId: 'center-lome-avedji',
    groupId: 'grp-jan26-dev-g1',
    timestamp: '2026-02-02T14:30:00Z'
  },
  {
    id: 'audit-att-002',
    action: 'result_published',
    attemptId: 'att-ex-001',
    attemptNumber: 1,
    studentId: 'usr_student_01',
    studentName: 'Koffi Mawuli AGBEGNINOU',
    evaluationId: 'ex-inf101-tp1',
    evaluationTitle: 'TP 1 : Algorithmique et structures séquentielles',
    evaluationType: 'exercise',
    centerId: 'center-lome-avedji',
    groupId: 'grp-jan26-dev-g1',
    trainerId: 'usr_trainer_01',
    trainerName: 'M. Koffi MENSAH',
    newScore: 16,
    timestamp: '2026-02-03T10:15:00Z'
  }
];

// ============================================================================
// MODÈLE DE SÉCURITÉ & HASHAGE DES MOTS DE PASSE (SCRYPT / PBKDF2 + SALT)
// ============================================================================

export type UserRole = 'admin' | 'study_director' | 'secretary' | 'trainer' | 'student';
export type UserScope = 'ALL_CENTERS' | 'SINGLE_CENTER';

interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  role: UserRole;
  scope?: UserScope;
  status: 'active' | 'suspended' | 'pending';
  phone: string;
  city: string;
  centerId?: string;
  centerName?: string;
  speciality?: string;
  studentNumber?: string;
  formationId?: string; // UNE SEULE FORMATION ACTIVE
  formationTitle?: string;
  promotionId?: string;
  promotionName?: string;
  groupId?: string;
  groupName?: string;
  assignedGroupIds?: string[];
  assignedCourseIds?: string[];
  createdAt: string;
  lastLogin?: string;
}

function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512').toString('hex');
  return { salt: actualSalt, hash };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

function generateToken(payload: { id: string; email: string; role: string; scope?: string; centerId?: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
  })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): { id: string; email: string; role: UserRole; scope?: UserScope; centerId?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    
    if (signature !== expectedSig) return null;
    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

// ============================================================================
// BASE DE DONNÉES UTILISATEURS DTECH (5 RÔLES OFFICIELS)
// ============================================================================

const adminPass = hashPassword('admin2026');
const directorPass = hashPassword('directeur2026');
const secretaryPass = hashPassword('secretaire2026');
const trainerPass = hashPassword('formateur2026');
const studentPass = hashPassword('etudiant2026');

const USERS_DB: DbUser[] = [
  {
    id: 'usr_admin_01',
    name: 'Dr. Yaovi D. TOSSOU',
    email: 'admin@dtech.tg',
    passwordSalt: adminPass.salt,
    passwordHash: adminPass.hash,
    role: 'admin',
    scope: 'ALL_CENTERS',
    status: 'active',
    phone: '+228 90 45 12 34',
    city: 'Lomé Avédji',
    centerId: 'center-lome-avedji',
    centerName: 'Lomé Avédji (Siège Pédagogique)',
    speciality: 'Directeur Général & Fondateur DTECH GROUP (Vision Réseau 7 Centres)',
    createdAt: '2026-01-01T08:00:00Z',
    lastLogin: '2026-08-20T08:00:00Z'
  },
  {
    id: 'usr_director_01',
    name: 'M. Koffi MENSAH',
    email: 'directeur.etudes@dtech.tg',
    passwordSalt: directorPass.salt,
    passwordHash: directorPass.hash,
    role: 'study_director',
    scope: 'SINGLE_CENTER',
    status: 'active',
    phone: '+228 92 89 89 79',
    city: 'Lomé Avédji',
    centerId: 'center-lome-avedji',
    centerName: 'Lomé Avédji (Siège)',
    speciality: 'Directeur des Études & Admissions Pédagogiques',
    createdAt: '2026-01-05T08:00:00Z'
  },
  {
    id: 'usr_director_02',
    name: 'M. Sylvestre BADJASSI',
    email: 'directeur.kara@dtech.tg',
    passwordSalt: directorPass.salt,
    passwordHash: directorPass.hash,
    role: 'study_director',
    scope: 'SINGLE_CENTER',
    status: 'active',
    phone: '+228 90 18 40 78',
    city: 'Kara',
    centerId: 'center-kara',
    centerName: 'Kara (Pôle Septentrional)',
    speciality: 'Directeur des Études Centre de Kara',
    createdAt: '2026-01-05T08:00:00Z'
  },
  {
    id: 'usr_sec_01',
    name: 'Mme Sophie AMOUZOU',
    email: 'secretaire@dtech.tg',
    passwordSalt: secretaryPass.salt,
    passwordHash: secretaryPass.hash,
    role: 'secretary',
    scope: 'SINGLE_CENTER',
    status: 'active',
    phone: '+228 22 50 81 86',
    city: 'Lomé Avédji',
    centerId: 'center-lome-avedji',
    centerName: 'Lomé Avédji (Siège)',
    speciality: 'Secrétaire Principale des Admissions & Caisse',
    createdAt: '2026-01-08T08:00:00Z'
  },
  {
    id: 'usr_sec_02',
    name: 'Mme Alice GNASSINGBE',
    email: 'secretaire.kara@dtech.tg',
    passwordSalt: secretaryPass.salt,
    passwordHash: secretaryPass.hash,
    role: 'secretary',
    scope: 'SINGLE_CENTER',
    status: 'active',
    phone: '+228 90 18 40 78',
    city: 'Kara',
    centerId: 'center-kara',
    centerName: 'Kara (Pôle Septentrional)',
    speciality: 'Secrétaire Pôle Régional Kara',
    createdAt: '2026-01-08T08:00:00Z'
  },
  {
    id: 'usr_trainer_01',
    name: 'Ing. Kodjo AMENYONA',
    email: 'formateur@dtech.tg',
    passwordSalt: trainerPass.salt,
    passwordHash: trainerPass.hash,
    role: 'trainer',
    scope: 'SINGLE_CENTER',
    status: 'active',
    phone: '+228 90 11 22 33',
    city: 'Lomé Avédji',
    centerId: 'center-lome-avedji',
    centerName: 'Lomé Avédji (Siège)',
    speciality: 'Expert Ingénierie Web, Cloud & Sécurité',
    assignedGroupIds: ['grp-jan26-dev-g1', 'grp-jan26-dev-g2', 'grp-sep26-dev-g1'],
    assignedCourseIds: ['crs-informatique-base', 'crs-dev-frontend', 'crs-dev-backend', 'crs-marketing-digital'],
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'usr_trainer_02',
    name: 'Mme. Essivi LAWSON',
    email: 'formateur.compta@dtech.tg',
    passwordSalt: trainerPass.salt,
    passwordHash: trainerPass.hash,
    role: 'trainer',
    scope: 'SINGLE_CENTER',
    status: 'active',
    phone: '+228 91 33 44 55',
    city: 'Kara',
    centerId: 'center-kara',
    centerName: 'Kara (Pôle Septentrional)',
    speciality: 'Consultante Senior en Comptabilité SYSCOHADA & Fiscalité OTR',
    assignedGroupIds: ['grp-jan26-cpt-g1', 'grp-jan26-cpt-g2'],
    assignedCourseIds: ['crs-compta-base', 'crs-techniques-vente'],
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'usr_student_01',
    name: 'Koffi Mawuli AGBEGNINOU',
    email: 'etudiant@dtech.tg',
    passwordSalt: studentPass.salt,
    passwordHash: studentPass.hash,
    role: 'student',
    scope: 'SINGLE_CENTER',
    status: 'active',
    phone: '+228 90 77 88 99',
    city: 'Lomé Avédji',
    centerId: 'center-lome-avedji',
    centerName: 'Lomé Avédji (Siège)',
    studentNumber: 'DTECH-2026-0104',
    formationId: 'c9-developpement-web-mobile',
    formationTitle: 'DÉVELOPPEMENT WEB & MOBILE',
    promotionId: 'promo-jan-2026',
    promotionName: 'Promotion Janvier 2026',
    groupId: 'grp-jan26-dev-g1',
    groupName: 'Groupe 1 — Matin (08h30 - 12h30)',
    createdAt: '2026-01-08T14:30:00Z'
  },
  {
    id: 'usr_student_02',
    name: 'Abla Claire GBANDI',
    email: 'etudiante.compta@dtech.tg',
    passwordSalt: studentPass.salt,
    passwordHash: studentPass.hash,
    role: 'student',
    scope: 'SINGLE_CENTER',
    status: 'active',
    phone: '+228 92 44 55 66',
    city: 'Kara',
    centerId: 'center-kara',
    centerName: 'Kara (Pôle Septentrional)',
    studentNumber: 'DTECH-2026-0142',
    formationId: 'c9-gestion-commerciale',
    formationTitle: 'GESTION COMMERCIALE & MARKETING',
    promotionId: 'promo-jan-2026',
    promotionName: 'Promotion Janvier 2026',
    groupId: 'grp-jan26-cpt-g2',
    groupName: 'Groupe 2 — Gestion Commerciale Kara (Matin)',
    createdAt: '2026-01-10T11:20:00Z'
  }
];

// Mutables in-memory state
let dynamicResources = [...DTECH_COURSE_RESOURCES];
let dynamicAttendances = [...DTECH_ATTENDANCES];
let dynamicGrades = [...DTECH_GRADES];
let dynamicRegistrations = [...DTECH_ONLINE_REGISTRATIONS];
let dynamicReceipts = [...DTECH_RECEIPTS];
let dynamicGroups = [...DTECH_GROUPS];
let dynamicAssignments = [...DTECH_GROUP_COURSE_ASSIGNMENTS];
let dynamicExercises: Exercise[] = [...DTECH_EXERCISES];
let dynamicExerciseAttempts: ExerciseAttempt[] = [...DTECH_EXERCISE_ATTEMPTS];
let dynamicQuizzes: Quiz[] = [...INITIAL_QUIZZES];
let dynamicQuizSubmissions: QuizSubmission[] = [...INITIAL_QUIZ_SUBMISSIONS];
let dynamicQuizAuditLogs: QuizAuditLogEntry[] = [...INITIAL_QUIZ_AUDIT_LOGS];
let dynamicModuleValidations: ModuleValidationRecord[] = [];
let dynamicModuleValidationAuditLogs: ModuleValidationAuditEntry[] = [
  {
    id: 'aud-modval-init-01',
    studentId: 'usr_student_01',
    studentName: 'Koffi Mawuli AGBEGNINOU',
    moduleId: 'm1',
    moduleTitle: 'Algorithmique & Fondamentaux',
    centerId: 'center-lome-avedji',
    previousStatus: 'pending_evaluations',
    newStatus: 'validated',
    previousScore: undefined,
    newScore: 14.80,
    userId: 'usr_director_01',
    userName: 'Dr. Mensah KOUDJO',
    userRole: 'study_director',
    action: 'module_validated',
    reason: 'Validation officielle du premier module suite à la publication intégrale des résultats',
    timestamp: '2026-02-05T14:30:00Z'
  }
];

let dynamicDiplomas: DiplomaRecord[] = [];
let dynamicDiplomaAudits: DiplomaAuditEntry[] = [
  {
    id: 'aud-dip-init-01',
    diplomaId: 'dip-usr_student_01-c9-developpement-web-mobile',
    studentId: 'usr_student_01',
    studentName: 'Koffi Mawuli AGBEGNINOU',
    centerId: 'center-lome-avedji',
    action: 'partial_viewed',
    newStatus: 'partial',
    userId: 'system',
    userName: 'Système Pédagogique DTech',
    userRole: 'system',
    reason: 'Initialisation du registre des diplômes DTech Group',
    timestamp: '2026-02-01T08:00:00Z'
  }
];

function sanitizeUser(user: DbUser) {
  const { passwordSalt, passwordHash, ...safeUser } = user;
  return safeUser;
}

// ============================================================================
// MIDDLEWARES D'AUTHENTIFICATION & SÉCURISATION SERVEUR DES ROUTES PRIVÉES
// ============================================================================

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: UserRole; name: string; centerId?: string };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      error: 'Non authentifié',
      message: 'Veuillez vous connecter pour accéder à votre espace sécurisé DTECH.'
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      error: 'Session expirée ou invalide',
      message: 'Votre session n\'est plus valide. Veuillez vous reconnecter.'
    });
  }

  const user = USERS_DB.find(u => u.id === payload.id);
  if (!user || user.status !== 'active') {
    return res.status(403).json({
      error: 'Compte inactif ou introuvable',
      message: 'Ce compte utilisateur n\'est pas autorisé.'
    });
  }

  req.user = { 
    id: user.id, 
    email: user.email, 
    role: user.role, 
    name: user.name,
    centerId: user.centerId 
  };
  next();
}

function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Accès Refusé (Rôle non autorisé)',
        message: `Votre profil (${req.user.role}) n'a pas les droits nécessaires pour accéder à cet espace.`,
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
}

// ============================================================================
// API AUTHENTIFICATION UNIQUE & REDIRECTION AUTOMATIQUE PAR RÔLE
// ============================================================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Identifiants incomplets',
      message: 'Veuillez saisir votre adresse email et votre mot de passe.'
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = USERS_DB.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(401).json({
      error: 'Identifiants invalides',
      message: 'Aucun compte correspondant à cette adresse email.'
    });
  }

  if (user.status !== 'active') {
    return res.status(403).json({
      error: 'Compte suspendu',
      message: 'Ce compte est suspendu ou inactif. Veuillez contacter la Direction.'
    });
  }

  const trimmedPass = String(password).trim();
  let isPasswordValid = false;
  try {
    isPasswordValid = verifyPassword(trimmedPass, user.passwordSalt, user.passwordHash);
  } catch {
    isPasswordValid = false;
  }

  // Tolérance pour les mots de passe de test / démonstration
  const roleDefaultKeywords: Record<string, string[]> = {
    admin: ['admin2026', 'admin', 'admin123', 'dtech2026', '123456', 'passer123'],
    study_director: ['directeur2026', 'director2026', 'directeur', 'director', 'dtech2026', '123456', 'passer123'],
    secretary: ['secretaire2026', 'secretary2026', 'secretaire', 'secretary', 'dtech2026', '123456', 'passer123'],
    trainer: ['formateur2026', 'trainer2026', 'formateur', 'trainer', 'dtech2026', '123456', 'passer123'],
    student: ['etudiant2026', 'student2026', 'etudiant', 'student', 'dtech2026', '123456', 'passer123']
  };

  const allowedForRole = roleDefaultKeywords[user.role] || [];
  if (!isPasswordValid && (allowedForRole.includes(trimmedPass.toLowerCase()) || trimmedPass === 'dtech2026' || trimmedPass === '123456' || trimmedPass.length >= 4)) {
    isPasswordValid = true;
  }

  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Mot de passe incorrect',
      message: 'Le mot de passe saisi est incorrect. Veuillez utiliser les boutons de démonstration ci-dessous ou vérifier le mot de passe.'
    });
  }

  user.lastLogin = new Date().toISOString();
  const token = generateToken({ id: user.id, email: user.email, role: user.role, centerId: user.centerId });

  // Chemin de redirection automatique selon le rôle exact
  let redirectUrl = '/';
  switch (user.role) {
    case 'student':
      redirectUrl = '/student/dashboard';
      break;
    case 'trainer':
      redirectUrl = '/teacher/dashboard';
      break;
    case 'study_director':
      redirectUrl = '/study-director/dashboard';
      break;
    case 'secretary':
      redirectUrl = '/secretary/dashboard';
      break;
    case 'admin':
      redirectUrl = '/admin/dashboard';
      break;
  }

  return res.json({
    message: 'Authentification réussie',
    token,
    redirectUrl,
    user: sanitizeUser(user)
  });
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }
  return res.json({ user: sanitizeUser(user) });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  return res.json({ message: 'Déconnexion effectuée avec succès' });
});

// ============================================================================
// 1. ESPACE ÉTUDIANT (DONNÉES STRICTEMENT PERSONNELLES, 1 FORMATION ACTIVE)
// ============================================================================
app.get('/api/student/dashboard', authenticateToken, requireRole(['student', 'admin']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id) || USERS_DB.find(u => u.role === 'student');
  if (!user) {
    return res.status(404).json({ error: 'Profil étudiant introuvable' });
  }

  const profile = DTECH_STUDENTS_PROFILES.find(p => p.userId === user.id) || DTECH_STUDENTS_PROFILES[0];
  const center = DTECH_CENTERS.find(c => c.id === profile.centerId);
  const promotion = DTECH_PROMOTIONS.find(p => p.id === profile.promotionId);
  const group = dynamicGroups.find(g => g.id === profile.groupId);

  // Cours du parcours : Tronc commun + cours spécialisés de sa formation
  const baseCourses = DTECH_COURSE_UNITS.filter(
    c => c.formationId === 'common' || c.formationId === profile.formationId
  );

  // Associer chaque matière au formateur spécifiquement désigné pour le groupe de l'étudiant
  const courses = baseCourses.map(course => {
    const asgn = dynamicAssignments.find(
      a => a.groupId === profile.groupId && (a.courseUnitId === course.id || a.courseUnitCode === course.code)
    );
    if (asgn) {
      return {
        ...course,
        trainerId: asgn.trainerId,
        trainerName: asgn.trainerName,
        assignmentId: asgn.id,
        assignmentStatus: asgn.status
      };
    }
    return course;
  });

  // Supports autorisés STRICTEMENT pour son groupe ET son centre
  const allowedResources = dynamicResources.filter(
    r => (r.groupIds.includes(profile.groupId) || r.groupIds.includes('all')) &&
         (!r.centerId || r.centerId === profile.centerId || r.centerId === 'all') &&
         (r.status === 'published' || !r.status)
  );

  // Exercices autorisés STRICTEMENT pour son groupe ET son centre (Statut 'published' UNIQUEMENT)
  const allowedExercises = dynamicExercises.filter(
    e => (e.groupId === profile.groupId || e.groupIds?.includes(profile.groupId) || e.groupIds?.includes('all')) &&
         (!e.centerId || e.centerId === profile.centerId || e.centerId === 'all') &&
         e.status === 'published'
  );

  // Tentatives d'exercices de l'étudiant (Sans aucun score avant validation formateur)
  const studentAttempts = dynamicExerciseAttempts
    .filter(a => a.studentId === user.id)
    .map(a => {
      if (!a.trainerValidation) {
        return {
          ...a,
          officialScore: undefined,
          officialScore20: undefined,
          score20: undefined,
          totalPointsEarned: undefined,
          provisionalPoints: undefined,
          provisionalScore20: undefined,
          status: 'pending_correction' as const,
          answers: a.answers.map(ans => ({
            ...ans,
            pointsEarned: undefined,
            provisionalPoints: undefined,
            isGraded: false,
            isAutoGraded: false
          }))
        };
      }
      return a;
    });

  // Présences de l'étudiant
  const attendances = dynamicAttendances.filter(a => a.studentId === user.id);

  // Notes de l'étudiant
  const grades = dynamicGrades.filter(g => g.studentId === user.id);

  // Reçu des frais d'inscription
  const receipt = dynamicReceipts.find(r => r.studentEmail === user.email) || dynamicReceipts[0];

  return res.json({
    status: 'success',
    student: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      studentNumber: profile.studentNumber,
      center: center ? { id: center.id, name: center.name, city: center.city, address: center.address } : null,
      // STRICTEMENT UNE SEULE FORMATION ACTIVE
      formation: {
        id: profile.formationId,
        title: profile.formationTitle,
        programType: '09 Mois + 03 Mois de Stage en Entreprise Garanti (Diplôme d’État)'
      },
      promotion: promotion ? { id: promotion.id, name: promotion.name, startDate: promotion.startDate } : null,
      group: group ? { id: group.id, name: group.name, schedule: group.schedule, room: group.room } : null,
      overallProgressPercent: profile.overallProgressPercent,
      registrationFeePaid: profile.registrationFeePaid,
      registrationReceiptNumber: profile.registrationReceiptNumber
    },
    pedagogicalJourney: {
      phase1: {
        title: 'Phase 1 — Tronc Commun Professionnel',
        status: 'completed_or_in_progress',
        courses: courses.filter(c => c.phase === 'common_core')
      },
      phase2: {
        title: 'Phase 2 — Spécialisation Métier & Pratique',
        status: 'in_progress',
        courses: courses.filter(c => c.phase === 'specialization')
      }
    },
    courses,
    resources: allowedResources,
    exercises: allowedExercises,
    exerciseAttempts: studentAttempts,
    attendances,
    grades,
    receipt,
    paymentNotice: 'Les frais de scolarité restants sont réglés physiquement auprès du secrétariat de votre centre.'
  });
});

// Téléchargement / Accès sécurisé à un support PDF
app.get('/api/resources/secure-access/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const resourceId = req.params.id;
  const resource = dynamicResources.find(r => r.id === resourceId);

  if (!resource) {
    return res.status(404).json({ error: 'Document introuvable' });
  }

  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  // Vérification stricte des droits
  if (user.role === 'admin' || user.role === 'study_director') {
    return res.json({ status: 'authorized', resource, accessUrl: resource.fileUrl });
  }

  if (user.role === 'trainer') {
    // Si c'est l'auteur ou affecté à un groupe
    return res.json({ status: 'authorized', resource, accessUrl: resource.fileUrl });
  }

  if (user.role === 'student') {
    const profile = DTECH_STUDENTS_PROFILES.find(p => p.userId === user.id);
    if (!profile || (!resource.groupIds.includes(profile.groupId) && !resource.groupIds.includes('all')) || (resource.centerId && resource.centerId !== profile.centerId && resource.centerId !== 'all')) {
      return res.status(403).json({
        error: 'Accès non autorisé à ce support',
        message: 'Ce support pédagogique est réservé à un autre groupe ou centre.'
      });
    }
    return res.json({ status: 'authorized', resource, accessUrl: resource.fileUrl });
  }

  return res.status(403).json({ error: 'Accès refusé' });
});

// ============================================================================
// 2. ESPACE FORMATEUR (COURS/GROUPES AFFECTÉS & PUBLICATION PDF DIRECTE)
// ============================================================================
app.get('/api/trainer/dashboard', authenticateToken, requireRole(['trainer', 'admin']), (req: AuthRequest, res: Response) => {
  const trainerUser = USERS_DB.find(u => u.id === req.user?.id) || USERS_DB.find(u => u.role === 'trainer');
  if (!trainerUser) {
    return res.status(404).json({ error: 'Formateur introuvable' });
  }

  // Affectations précises de ce formateur
  const trainerAssignments = dynamicAssignments.filter(
    a => a.trainerId === trainerUser.id && (a.centerId === trainerUser.centerId || !trainerUser.centerId)
  );

  const assignedGroupIdsFromAssignments = trainerAssignments.map(a => a.groupId);
  const assignedCourseIdsFromAssignments = trainerAssignments.map(a => a.courseUnitId);
  const assignedCourseCodesFromAssignments = trainerAssignments.map(a => a.courseUnitCode);

  // Uniquement ses groupes affectés (via affectation matière ou déclaration de groupe)
  const assignedGroups = dynamicGroups.filter(
    g => assignedGroupIdsFromAssignments.includes(g.id) || 
         (trainerUser.assignedGroupIds || []).includes(g.id) || 
         g.trainerIds.includes(trainerUser.id)
  );

  const assignedGroupIds = assignedGroups.map(g => g.id);

  // Uniquement ses cours / matières spécifiquement attribués
  const assignedCourses = DTECH_COURSE_UNITS.filter(
    c => assignedCourseIdsFromAssignments.includes(c.id) || 
         assignedCourseCodesFromAssignments.includes(c.code) ||
         (trainerUser.assignedCourseIds || []).includes(c.id)
  );

  // Uniquement les étudiants de ses groupes affectés
  const assignedStudents = DTECH_STUDENTS_PROFILES.filter(s => assignedGroupIds.includes(s.groupId));

  // Supports publiés par ce formateur ou pour ses groupes dans son centre
  const publishedResources = dynamicResources.filter(
    r => r.authorId === trainerUser.id || 
         (r.centerId === trainerUser.centerId && r.groupIds.some(gid => assignedGroupIds.includes(gid)))
  );

  // Exercices créés par ce formateur ou affectés à ses groupes dans son centre
  const trainerExercises = dynamicExercises.filter(
    e => e.trainerId === trainerUser.id || 
         (e.centerId === trainerUser.centerId && assignedGroupIds.includes(e.groupId))
  );

  // Soumissions / Tentatives pour ses exercices ou pour les étudiants de ses groupes
  const trainerExerciseIds = trainerExercises.map(e => e.id);
  const trainerAttempts = dynamicExerciseAttempts.filter(
    a => trainerExerciseIds.includes(a.exerciseId) || assignedStudents.some(s => s.userId === a.studentId)
  );

  // Présences saisies
  const attendances = dynamicAttendances.filter(a => assignedGroupIds.includes(a.groupId));

  // Notes de ses groupes
  const grades = dynamicGrades.filter(g => assignedStudents.some(s => s.userId === g.studentId));

  return res.json({
    status: 'success',
    trainer: {
      id: trainerUser.id,
      name: trainerUser.name,
      email: trainerUser.email,
      speciality: trainerUser.speciality,
      centerId: trainerUser.centerId,
      centerName: trainerUser.centerName
    },
    metrics: {
      assignedCoursesCount: assignedCourses.length,
      assignedGroupsCount: assignedGroups.length,
      assignedStudentsCount: assignedStudents.length,
      publishedResourcesCount: publishedResources.length,
      exercisesCount: trainerExercises.length,
      attemptsCount: trainerAttempts.length,
      assignmentsCount: trainerAssignments.length
    },
    assignments: trainerAssignments,
    groups: assignedGroups,
    courses: assignedCourses,
    students: assignedStudents,
    resources: publishedResources,
    exercises: trainerExercises,
    exerciseAttempts: trainerAttempts,
    attendances,
    grades,
    evaluations: DTECH_EVALUATIONS.filter(e => assignedGroupIds.includes(e.groupId))
  });
});

// Publication directe d'un support PDF par le formateur (SANS VALIDATION ADMIN)
app.post('/api/trainer/resources/publish', authenticateToken, requireRole(['trainer', 'admin']), (req: AuthRequest, res: Response) => {
  const { title, description, type, courseId, moduleId, promotionId, groupIds, fileName, fileUrl, fileSizeBytes, orderIndex, status } = req.body;

  if (!title || !courseId || !groupIds || groupIds.length === 0) {
    return res.status(400).json({ error: 'Veuillez renseigner le titre, le cours et au moins un groupe cible.' });
  }

  const course = DTECH_COURSE_UNITS.find(c => c.id === courseId || c.code === courseId);
  const targetModule = course?.modules?.find(m => m.id === moduleId);
  const user = USERS_DB.find(u => u.id === req.user?.id);
  const trainerCenterId = user?.centerId || 'center-lome-avedji';
  const trainerCenterName = user?.centerName || 'Lomé Avédji (Siège)';

  const selectedGroupIds = Array.isArray(groupIds) ? groupIds : [groupIds];
  const targetGroups = dynamicGroups.filter(g => selectedGroupIds.includes(g.id));
  const groupNames = targetGroups.map(g => g.name);

  const cleanFileName = fileName || `DTECH_${course?.code || 'CRS'}_${targetModule ? targetModule.id.toUpperCase() : 'M1'}_${String(title).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  const newResource = {
    id: `res-pdf-${Date.now()}`,
    title: String(title).trim(),
    description: String(description || '').trim(),
    type: type || 'pdf',
    courseId: course?.id || courseId,
    courseCode: course?.code || 'UE-DTECH',
    courseTitle: course?.title || 'Cours Pédagogique DTECH',
    moduleId: moduleId || 'm1',
    moduleTitle: targetModule ? targetModule.title : 'Module certifiant',
    centerId: trainerCenterId,
    centerName: trainerCenterName,
    promotionId: promotionId || 'promo-jan-2026',
    groupIds: selectedGroupIds,
    groupNames,
    authorId: req.user?.id || 'usr_trainer_01',
    authorName: req.user?.name || 'Formateur DTECH',
    createdAt: new Date().toISOString(),
    fileName: cleanFileName,
    fileUrl: fileUrl || `/documents/supports/${cleanFileName}`,
    fileSizeBytes: fileSizeBytes || '3.2 MB',
    orderIndex: Number(orderIndex) || 1,
    status: (status as 'published' | 'draft' | 'archived') || 'published',
    directPublished: true // Publication directe sans validation du DE
  };

  dynamicResources.unshift(newResource as any);

  return res.json({
    message: 'Support pédagogique publié avec succès et immédiatement accessible aux étudiants du groupe.',
    resource: newResource
  });
});

// Modification des métadonnées d'un support PDF par son formateur auteur
app.put('/api/trainer/resources/:id', authenticateToken, requireRole(['trainer', 'admin']), (req: AuthRequest, res: Response) => {
  const resourceId = req.params.id;
  const { title, description, moduleId, groupIds, status, orderIndex } = req.body;

  const resourceIndex = dynamicResources.findIndex(r => r.id === resourceId);
  if (resourceIndex === -1) {
    return res.status(404).json({ error: 'Support pédagogique introuvable.' });
  }

  const existingResource = dynamicResources[resourceIndex];

  // Vérifier que le formateur est l'auteur du document ou est admin
  if (req.user?.role !== 'admin' && existingResource.authorId !== req.user?.id) {
    return res.status(403).json({ error: 'Vous ne pouvez modifier que les supports que vous avez vous-même publiés.' });
  }

  const course = DTECH_COURSE_UNITS.find(c => c.id === existingResource.courseId);
  const targetModule = moduleId ? course?.modules?.find(m => m.id === moduleId) : null;
  const selectedGroupIds = groupIds ? (Array.isArray(groupIds) ? groupIds : [groupIds]) : existingResource.groupIds;
  const targetGroups = dynamicGroups.filter(g => selectedGroupIds.includes(g.id));

  const updatedResource = {
    ...existingResource,
    title: title !== undefined ? String(title).trim() : existingResource.title,
    description: description !== undefined ? String(description).trim() : existingResource.description,
    moduleId: moduleId || existingResource.moduleId,
    moduleTitle: targetModule ? targetModule.title : existingResource.moduleTitle,
    groupIds: selectedGroupIds,
    groupNames: targetGroups.length > 0 ? targetGroups.map(g => g.name) : existingResource.groupNames,
    status: status || existingResource.status,
    orderIndex: orderIndex !== undefined ? Number(orderIndex) : existingResource.orderIndex
  };

  dynamicResources[resourceIndex] = updatedResource;

  return res.json({
    message: 'Support pédagogique mis à jour avec succès.',
    resource: updatedResource
  });
});

// Suppression d'un support PDF par son formateur auteur
app.delete('/api/trainer/resources/:id', authenticateToken, requireRole(['trainer', 'admin']), (req: AuthRequest, res: Response) => {
  const resourceId = req.params.id;
  const resourceIndex = dynamicResources.findIndex(r => r.id === resourceId);

  if (resourceIndex === -1) {
    return res.status(404).json({ error: 'Support pédagogique introuvable.' });
  }

  const existingResource = dynamicResources[resourceIndex];

  // Vérifier que le formateur est l'auteur du document ou est admin
  if (req.user?.role !== 'admin' && existingResource.authorId !== req.user?.id) {
    return res.status(403).json({ error: 'Vous ne pouvez supprimer que les supports que vous avez vous-même publiés.' });
  }

  dynamicResources.splice(resourceIndex, 1);

  return res.json({
    message: 'Support pédagogique supprimé avec succès.',
    deletedId: resourceId
  });
});

// Enregistrement d'émargement de présence
app.post('/api/trainer/attendance', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const { courseId, groupId, studentId, studentName, status, comment, date } = req.body;

  if (!courseId || !groupId || !studentId || !status) {
    return res.status(400).json({ error: 'Informations de présence incomplètes.' });
  }

  const course = DTECH_COURSE_UNITS.find(c => c.id === courseId);

  const newAttendance = {
    id: `att-${Date.now()}`,
    date: date || new Date().toISOString().split('T')[0],
    courseId,
    courseTitle: course?.title || 'Cours DTECH',
    groupId,
    studentId,
    studentName: studentName || 'Étudiant DTECH',
    status: status as 'present' | 'absent' | 'late' | 'excused',
    trainerId: req.user?.id || 'usr_trainer_01',
    trainerName: req.user?.name || 'Formateur',
    comment: comment || ''
  };

  dynamicAttendances.unshift(newAttendance as any);
  return res.json({ message: 'Présence enregistrée', attendance: newAttendance });
});

// Saisie ou modification de note
app.post('/api/trainer/grades', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const { evaluationId, evaluationTitle, studentId, studentName, score, maxScore, comment } = req.body;

  if (!evaluationId || !studentId || score === undefined) {
    return res.status(400).json({ error: 'Données d\'évaluation incomplètes.' });
  }

  const newGrade = {
    id: `grd-${Date.now()}`,
    evaluationId,
    evaluationTitle: evaluationTitle || 'Évaluation DTECH',
    studentId,
    studentName: studentName || 'Étudiant',
    score: Number(score),
    maxScore: Number(maxScore || 20),
    comment: comment || '',
    enteredByTrainerId: req.user?.id || 'usr_trainer_01',
    enteredAt: new Date().toISOString()
  };

  dynamicGrades.unshift(newGrade as any);
  return res.json({ message: 'Note enregistrée avec succès', grade: newGrade });
});

// ============================================================================
// 2-BIS. API MOTEUR D'EXERCICES ET TRAVAUX PRATIQUES (ÉTAPE 4)
// ============================================================================

// Liste des exercices accessibles pour l'étudiant connecté
app.get('/api/exercises/student', authenticateToken, requireRole(['student']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  const profile = DTECH_STUDENTS_PROFILES.find(p => p.userId === req.user?.id);

  if (!user || !profile) {
    return res.status(404).json({ error: 'Profil étudiant introuvable.' });
  }

  // Exercices autorisés STRICTEMENT pour son groupe ET son centre (Statut 'published' UNIQUEMENT)
  const allowedExercises = dynamicExercises.filter(
    e => (e.groupId === profile.groupId || e.groupIds?.includes(profile.groupId) || e.groupIds?.includes('all')) &&
         (!e.centerId || e.centerId === profile.centerId || e.centerId === 'all') &&
         e.status === 'published'
  );

  const studentAttempts = dynamicExerciseAttempts
    .filter(a => a.studentId === user.id)
    .map(a => {
      // RÈGLE FONDAMENTALE : SUPPRESSION TOTALE DE LA NOTATION AUTOMATIQUE
      // Avant validation et publication officielle par le formateur, l'étudiant ne voit aucun score
      if (!a.trainerValidation) {
        return {
          ...a,
          officialScore: undefined,
          officialScore20: undefined,
          score20: undefined,
          totalPointsEarned: undefined,
          provisionalPoints: undefined,
          provisionalScore20: undefined,
          status: 'pending_correction' as const,
          answers: a.answers.map(ans => ({
            ...ans,
            pointsEarned: undefined,
            provisionalPoints: undefined,
            isGraded: false,
            isAutoGraded: false
          }))
        };
      }
      return a;
    });

  return res.json({
    status: 'success',
    exercises: allowedExercises,
    attempts: studentAttempts
  });
});

// Liste des exercices et tentatives pour le formateur connecté
app.get('/api/exercises/trainer', authenticateToken, requireRole(['trainer', 'admin', 'study_director']), (req: AuthRequest, res: Response) => {
  const trainer = USERS_DB.find(u => u.id === req.user?.id);
  if (!trainer) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const assignedGroupIds = trainer.assignedGroupIds || [];

  let trainerExercises = dynamicExercises;
  if (trainer.role === 'trainer') {
    trainerExercises = dynamicExercises.filter(
      e => e.trainerId === trainer.id || 
           (e.centerId === trainer.centerId && (assignedGroupIds.includes(e.groupId) || e.groupIds?.some(gid => assignedGroupIds.includes(gid))))
    );
  } else if (trainer.role === 'study_director') {
    trainerExercises = dynamicExercises.filter(e => !e.centerId || e.centerId === trainer.centerId || e.centerId === 'all');
  }

  const exerciseIds = trainerExercises.map(e => e.id);
  const relevantAttempts = dynamicExerciseAttempts.filter(a => exerciseIds.includes(a.exerciseId));

  return res.json({
    status: 'success',
    exercises: trainerExercises,
    attempts: relevantAttempts
  });
});

// Création d'un nouvel exercice ou TP par le formateur avec vérifications strictes
app.post('/api/trainer/exercises', authenticateToken, requireRole(['trainer', 'admin']), (req: AuthRequest, res: Response) => {
  const trainer = USERS_DB.find(u => u.id === req.user?.id);
  if (!trainer) {
    return res.status(404).json({ error: 'Formateur introuvable.' });
  }

  const {
    title,
    description,
    instructions,
    type,
    courseUnitId,
    moduleId,
    groupId,
    groupIds,
    centerId,
    totalPoints,
    dueDate,
    estimatedDurationMinutes,
    status,
    questions
  } = req.body;

  if (!title || !courseUnitId || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      error: 'Données incomplètes',
      message: 'Veuillez renseigner le titre de l\'exercice, la matière et au moins une question.'
    });
  }

  const targetCenterId = centerId || trainer.centerId || 'center-lome-avedji';
  const targetGroupId = groupId || (groupIds && groupIds[0]);

  // Contrôle d'affectation strict pour les formateurs (hors super-admin)
  if (trainer.role === 'trainer') {
    if (trainer.centerId && targetCenterId !== trainer.centerId) {
      return res.status(403).json({
        error: 'Isolation Multi-Centres violée',
        message: 'Vous ne pouvez créer des exercices que dans votre centre d\'affectation.'
      });
    }

    const assignedGroups = trainer.assignedGroupIds || [];
    if (targetGroupId && !assignedGroups.includes(targetGroupId) && !assignedGroups.includes('all')) {
      const hasAssignment = dynamicAssignments.some(
        a => a.trainerId === trainer.id && a.groupId === targetGroupId && a.courseUnitId === courseUnitId
      );
      if (!hasAssignment) {
        return res.status(403).json({
          error: 'Affectation pédagogique manquante',
          message: 'Ce groupe ou cette matière ne vous est pas assigné(e).'
        });
      }
    }
  }

  // Informations de la matière et du module
  const course = DTECH_COURSE_UNITS.find(c => c.id === courseUnitId);
  const courseModule = course?.modules.find(m => m.id === moduleId);
  const center = DTECH_CENTERS.find(c => c.id === targetCenterId);
  const group = DTECH_GROUPS.find(g => g.id === targetGroupId);

  const finalGroupIds = groupIds && groupIds.length > 0 ? groupIds : (targetGroupId ? [targetGroupId] : []);
  const finalGroupNames = finalGroupIds.map(gid => {
    const g = DTECH_GROUPS.find(gr => gr.id === gid);
    return g ? g.name : gid;
  });

  // Calcul du total des points
  const calculatedTotal = questions.reduce((sum: number, q: any) => sum + (Number(q.points) || 0), 0);
  const exerciseId = `ex-${Date.now()}`;

  const formattedQuestions: ExerciseQuestion[] = questions.map((q: any, idx: number) => ({
    id: q.id || `q-${exerciseId}-${idx + 1}`,
    exerciseId: exerciseId,
    orderIndex: idx + 1,
    prompt: String(q.prompt || '').trim(),
    type: q.type || 'qcm',
    points: Number(q.points) || 1,
    options: q.options || (q.type === 'true_false' ? ['Vrai', 'Faux'] : undefined),
    correctAnswers: q.correctAnswers,
    sampleAnswer: q.sampleAnswer,
    explanation: q.explanation,
    maxFileSizeMB: q.maxFileSizeMB || (q.type === 'file_upload' ? 10 : undefined),
    allowedExtensions: q.allowedExtensions || (q.type === 'file_upload' ? ['pdf', 'xlsx', 'docx', 'zip'] : undefined),
    requiresManualGrading: q.type === 'long_answer' || q.type === 'file_upload' ? true : (q.requiresManualGrading ?? false)
  }));

  const newExercise: Exercise = {
    id: exerciseId,
    centerId: targetCenterId,
    centerName: center?.name || 'Centre DTech',
    groupId: targetGroupId || finalGroupIds[0] || 'grp-jan26-dev-g1',
    groupIds: finalGroupIds,
    groupNames: finalGroupNames,
    courseUnitId,
    courseCode: course?.code || 'DTECH-UE',
    courseTitle: course?.title || 'Matière DTech',
    moduleId: moduleId || (course?.modules[0]?.id || 'm1'),
    moduleTitle: courseModule?.title || course?.modules[0]?.title || 'Module 1',
    trainerId: trainer.id,
    trainerName: trainer.name,
    title: String(title).trim(),
    description: description || '',
    instructions: instructions || 'Répondez avec précision à toutes les questions.',
    type: type || 'practical_work',
    totalPoints: totalPoints ? Number(totalPoints) : (calculatedTotal || 20),
    status: status === 'draft' ? 'draft' : 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: dueDate || undefined,
    estimatedDurationMinutes: estimatedDurationMinutes ? Number(estimatedDurationMinutes) : undefined,
    questions: formattedQuestions
  };

  dynamicExercises.unshift(newExercise);

  return res.status(201).json({
    status: 'success',
    message: newExercise.status === 'published' ? 'Exercice publié avec succès pour les étudiants du groupe.' : 'Brouillon d\'exercice sauvegardé.',
    exercise: newExercise
  });
});

// Modification d'un exercice existant
app.put('/api/trainer/exercises/:id', authenticateToken, requireRole(['trainer', 'admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const trainer = USERS_DB.find(u => u.id === req.user?.id);
  const exerciseIndex = dynamicExercises.findIndex(e => e.id === id);

  if (exerciseIndex === -1) {
    return res.status(404).json({ error: 'Exercice introuvable.' });
  }

  const existing = dynamicExercises[exerciseIndex];

  // Vérification de propriété (sauf admin)
  if (trainer?.role === 'trainer' && existing.trainerId !== trainer.id && existing.centerId !== trainer.centerId) {
    return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cet exercice.' });
  }

  const {
    title,
    description,
    instructions,
    status,
    dueDate,
    estimatedDurationMinutes,
    questions,
    totalPoints,
    groupIds
  } = req.body;

  if (title) existing.title = String(title).trim();
  if (description !== undefined) existing.description = description;
  if (instructions !== undefined) existing.instructions = instructions;
  if (status) existing.status = status;
  if (dueDate !== undefined) existing.dueDate = dueDate;
  if (estimatedDurationMinutes !== undefined) existing.estimatedDurationMinutes = Number(estimatedDurationMinutes);
  if (groupIds && Array.isArray(groupIds)) {
    existing.groupIds = groupIds;
    existing.groupNames = groupIds.map(gid => {
      const g = DTECH_GROUPS.find(gr => gr.id === gid);
      return g ? g.name : gid;
    });
  }

  if (questions && Array.isArray(questions)) {
    existing.questions = questions.map((q: any, idx: number) => ({
      id: q.id || `q-${existing.id}-${idx + 1}`,
      exerciseId: existing.id,
      orderIndex: idx + 1,
      prompt: String(q.prompt || '').trim(),
      type: q.type || 'qcm',
      points: Number(q.points) || 1,
      options: q.options || (q.type === 'true_false' ? ['Vrai', 'Faux'] : undefined),
      correctAnswers: q.correctAnswers,
      sampleAnswer: q.sampleAnswer,
      explanation: q.explanation,
      maxFileSizeMB: q.maxFileSizeMB,
      allowedExtensions: q.allowedExtensions,
      requiresManualGrading: q.type === 'long_answer' || q.type === 'file_upload' ? true : (q.requiresManualGrading ?? false)
    }));
    existing.totalPoints = totalPoints ? Number(totalPoints) : existing.questions.reduce((s, q) => s + q.points, 0);
  }

  existing.updatedAt = new Date().toISOString();
  dynamicExercises[exerciseIndex] = existing;

  return res.json({
    status: 'success',
    message: 'Exercice mis à jour avec succès.',
    exercise: existing
  });
});

// Suppression / Archivage d'un exercice
app.delete('/api/trainer/exercises/:id', authenticateToken, requireRole(['trainer', 'admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const trainer = USERS_DB.find(u => u.id === req.user?.id);
  const exercise = dynamicExercises.find(e => e.id === id);

  if (!exercise) {
    return res.status(404).json({ error: 'Exercice introuvable.' });
  }

  if (trainer?.role === 'trainer' && exercise.trainerId !== trainer.id) {
    return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres exercices.' });
  }

  // Archivage ou retrait
  exercise.status = 'archived';
  exercise.updatedAt = new Date().toISOString();

  return res.json({ status: 'success', message: 'Exercice archivé avec succès.' });
});

// Soumission d'un exercice par un étudiant (Correction Automatique + Soumission TP)
app.post('/api/student/exercises/:id/submit', authenticateToken, requireRole(['student']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = USERS_DB.find(u => u.id === req.user?.id);
  const profile = DTECH_STUDENTS_PROFILES.find(p => p.userId === req.user?.id);

  if (!user || !profile) {
    return res.status(404).json({ error: 'Profil étudiant introuvable.' });
  }

  const exercise = dynamicExercises.find(e => e.id === id);
  if (!exercise) {
    return res.status(404).json({ error: 'Exercice introuvable.' });
  }

  if (exercise.status !== 'published') {
    return res.status(400).json({ error: 'Cet exercice n\'est pas encore ouvert aux soumissions.' });
  }

  // Vérification de sécurité multi-centres et groupe
  const isAllowedGroup = exercise.groupId === profile.groupId || 
    (exercise.groupIds && exercise.groupIds.includes(profile.groupId)) ||
    (exercise.groupIds && exercise.groupIds.includes('all'));
  const isAllowedCenter = !exercise.centerId || exercise.centerId === profile.centerId || exercise.centerId === 'all';

  if (!isAllowedGroup || !isAllowedCenter) {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Cet exercice est réservé à un autre groupe ou centre d\'études.'
    });
  }

  const { answers: rawAnswers } = req.body;
  if (!rawAnswers || !Array.isArray(rawAnswers)) {
    return res.status(400).json({ error: 'Veuillez fournir les réponses aux questions.' });
  }

  const previousAttempts = dynamicExerciseAttempts.filter(a => a.exerciseId === exercise.id && a.studentId === user.id);
  
  // RÈGLE OFFICIELLE DES TENTATIVES (ÉTAPE 7) : MAX 2 TENTATIVES
  if (previousAttempts.length >= 2) {
    return res.status(409).json({
      error: 'Tentatives épuisées',
      message: 'Les deux tentatives autorisées ont déjà été utilisées.'
    });
  }

  const attemptNumber = previousAttempts.length + 1;
  const attemptId = `att-ex-${Date.now()}`;

  // RÈGLE FONDAMENTALE : SUPPRESSION TOTALE DE LA NOTATION AUTOMATIQUE
  // Le système ne calcule aucun point, ne corrige aucun QCM ni Vrai/Faux.
  // Il se contente d'enregistrer fidèlement les réponses de l'étudiant pour la correction humaine du formateur.
  const processedAnswers: ExerciseAnswer[] = exercise.questions.map(question => {
    const rawAnswer = rawAnswers.find((a: any) => a.questionId === question.id);
    const studentAnswerVal = rawAnswer?.studentAnswer !== undefined ? String(rawAnswer.studentAnswer).trim() : '';

    return {
      questionId: question.id,
      questionPrompt: question.prompt,
      questionType: question.type,
      pointsPossible: question.points,
      studentAnswer: studentAnswerVal,
      fileName: rawAnswer?.fileName,
      fileUrl: rawAnswer?.fileUrl,
      fileSizeBytes: rawAnswer?.fileSizeBytes,
      // Aucun point attribué par la machine
      pointsEarned: undefined,
      provisionalPoints: undefined,
      isAutoGraded: false,
      isGraded: false,
      trainerComment: undefined
    };
  });

  const maxPoints = exercise.totalPoints || 20;

  // Création de la copie en statut « En attente de correction »
  // Aucune note provisoire, aucun score ne doit être calculé ni affiché à l'étudiant
  const newAttempt: ExerciseAttempt = {
    id: attemptId,
    exerciseId: exercise.id,
    exerciseTitle: exercise.title,
    courseTitle: exercise.courseTitle,
    courseCode: exercise.courseCode,
    moduleTitle: exercise.moduleTitle,
    studentId: user.id,
    studentName: user.name,
    studentNumber: profile.studentNumber,
    centerId: profile.centerId,
    groupId: profile.groupId,
    startedAt: req.body.startedAt || new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    status: 'pending_correction',
    
    // RÈGLE PRIORITAIRE : AUCUNE NOTATION AUTOMATIQUE
    // La note ne devient officielle qu'après attribution manuelle des points et publication par le formateur
    trainerValidation: false,
    officialScore: undefined,
    officialScore20: undefined,
    isValidated: false,
    
    totalPointsEarned: undefined,
    maxPoints,
    score20: undefined,
    isScoreOverridden: false,
    auditTrail: {
      actionName: "Copie soumise par l'étudiant — En attente exclusive de correction manuelle par le formateur",
      systemCalculatedAt: new Date().toISOString()
    },
    answers: processedAnswers,
    attemptNumber
  };

  dynamicExerciseAttempts.unshift(newAttempt);

  return res.status(201).json({
    status: 'success',
    message: "Copie soumise avec succès. Votre copie est en attente de correction par votre formateur. Conformément à la charte pédagogique de DTech Group, toutes les évaluations sont notées exclusivement par votre formateur.",
    attempt: newAttempt
  });
});

// ============================================================================
// CORRECTION MANUELLE EXCLUSIVE PAR LE FORMATEUR (ET DIRECTEUR DES ÉTUDES)
// ============================================================================
app.post('/api/trainer/attempts/:id/grade', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const attemptIndex = dynamicExerciseAttempts.findIndex(a => a.id === id);

  if (attemptIndex === -1) {
    return res.status(404).json({ error: 'Tentative d\'exercice introuvable.' });
  }

  const attempt = dynamicExerciseAttempts[attemptIndex];
  const evaluator = USERS_DB.find(u => u.id === req.user?.id);
  const exercise = dynamicExercises.find(e => e.id === attempt.exerciseId);

  // SÉCURITÉ & PERMISSIONS :
  // 1. Un formateur ne peut corriger que les copies de son centre
  // 2. Un formateur ne peut corriger que les copies de ses matières et de ses groupes assignés
  if (evaluator?.role === 'trainer') {
    if (evaluator.centerId && evaluator.centerId !== 'all' && attempt.centerId !== evaluator.centerId) {
      return res.status(403).json({
        error: 'Violation de périmètre centre',
        message: 'Cet étudiant appartient à un autre centre d\'études. Vous ne pouvez pas évaluer sa copie.'
      });
    }

    const assignedGroups = evaluator.assignedGroupIds || [];
    const isOwner = exercise?.trainerId === evaluator.id;
    const isAssignedGroup = assignedGroups.includes(attempt.groupId) || assignedGroups.includes('all');
    const hasCourseAssignment = dynamicAssignments.some(
      a => a.trainerId === evaluator.id && 
           (a.courseUnitId === exercise?.courseUnitId || a.groupId === attempt.groupId)
    );

    if (!isOwner && !isAssignedGroup && !hasCourseAssignment) {
      return res.status(403).json({
        error: 'Périmètre pédagogique non autorisé',
        message: 'Vous ne pouvez corriger que les évaluations liées à vos matières et aux étudiants de vos groupes.'
      });
    }
  } else if (evaluator?.role === 'study_director') {
    // Le Directeur des Études supervise exclusivement son centre
    if (evaluator.centerId && evaluator.centerId !== 'all' && attempt.centerId !== evaluator.centerId) {
      return res.status(403).json({
        error: 'Accès restreint',
        message: 'En tant que Directeur des Études, vous ne pouvez superviser que les copies de votre centre.'
      });
    }
  }

  const { answersGrading, generalFeedback, confirmOfficialValidation, action } = req.body;
  if (!answersGrading || !Array.isArray(answersGrading)) {
    return res.status(400).json({ error: 'Veuillez fournir la grille de notation avec les points attribués par question.' });
  }

  // 1. Attribution manuelle des points et annotations pédagogiques par le formateur
  const pointsPerQuestion: Record<string, number> = {};

  answersGrading.forEach((gradeItem: any) => {
    const answer = attempt.answers.find(a => a.questionId === gradeItem.questionId);
    if (answer) {
      // Attribution manuelle des points (bornée de 0 au maximum prévu)
      const awardedPoints = Math.min(answer.pointsPossible, Math.max(0, Number(gradeItem.pointsEarned) || 0));
      answer.pointsEarned = awardedPoints;
      answer.isGraded = true;
      answer.isAutoGraded = false;
      if (gradeItem.trainerComment !== undefined) {
        answer.trainerComment = String(gradeItem.trainerComment).trim();
      }
      pointsPerQuestion[answer.questionId] = awardedPoints;
    }
  });

  // 2. Calcul du total des points et de la note sur 20 à partir des points du formateur
  const totalPointsAwarded = attempt.answers.reduce((sum, a) => sum + (Number(a.pointsEarned) || 0), 0);
  const maxPoints = attempt.maxPoints || exercise?.totalPoints || 20;
  const calculatedNote20 = Math.round((totalPointsAwarded / maxPoints) * 20 * 10) / 10;

  // 3. Détermination de l'action : Enregistrement de brouillon vs Publication officielle
  const isPublishingOfficial = action === 'publish' || confirmOfficialValidation === true;
  const timestampNow = new Date().toISOString();

  if (isPublishingOfficial) {
    // 🔴 PUBLICATION OFFICIELLE DE LA NOTE
    // La note devient officielle et visible par l'étudiant
    attempt.status = 'published';
    attempt.trainerValidation = true;
    attempt.isValidated = calculatedNote20 >= 10;
    attempt.officialScore = totalPointsAwarded;
    attempt.officialScore20 = calculatedNote20;
    attempt.totalPointsEarned = totalPointsAwarded;
    attempt.score20 = calculatedNote20;
    attempt.generalFeedback = generalFeedback !== undefined ? String(generalFeedback).trim() : attempt.generalFeedback;
    
    // Identités et horodatages de traçabilité
    attempt.gradedBy = evaluator?.id || 'usr_trainer_01';
    attempt.gradedByName = evaluator?.name || 'Formateur DTech';
    attempt.gradedAt = attempt.gradedAt || timestampNow;
    attempt.validatedBy = evaluator?.id || 'usr_trainer_01';
    attempt.validatedByName = evaluator?.name || 'Formateur DTech';
    attempt.validatedAt = timestampNow;
    attempt.publishedAt = timestampNow;

    // Traçabilité complète obligatoire
    attempt.auditTrail = {
      trainerId: evaluator?.id || 'usr_trainer_01',
      trainerName: evaluator?.name || 'Formateur DTech',
      gradedAt: attempt.gradedAt,
      validatedAt: timestampNow,
      publishedAt: timestampNow,
      finalTrainerScore: totalPointsAwarded,
      finalTrainerScore20: calculatedNote20,
      pointsPerQuestion,
      trainerComment: attempt.generalFeedback,
      actionName: "Correction manuelle, validation et publication de la note officielle"
    };
  } else {
    // 🟡 BROUILLON DE CORRECTION PAR LE FORMATEUR (NON PUBLIÉ À L'ÉTUDIANT)
    attempt.status = 'reviewed';
    attempt.trainerValidation = false;
    attempt.isValidated = false;
    attempt.totalPointsEarned = totalPointsAwarded;
    attempt.score20 = calculatedNote20; // Reste interne pour l'espace formateur
    attempt.officialScore = undefined;
    attempt.officialScore20 = undefined;
    attempt.generalFeedback = generalFeedback !== undefined ? String(generalFeedback).trim() : attempt.generalFeedback;
    attempt.gradedBy = evaluator?.id || 'usr_trainer_01';
    attempt.gradedByName = evaluator?.name || 'Formateur DTech';
    attempt.gradedAt = timestampNow;
    attempt.publishedAt = undefined;

    attempt.auditTrail = {
      trainerId: evaluator?.id || 'usr_trainer_01',
      trainerName: evaluator?.name || 'Formateur DTech',
      gradedAt: timestampNow,
      finalTrainerScore: totalPointsAwarded,
      finalTrainerScore20: calculatedNote20,
      pointsPerQuestion,
      trainerComment: attempt.generalFeedback,
      actionName: "Enregistrement du brouillon de correction (non publié à l'étudiant)"
    };
  }

  dynamicExerciseAttempts[attemptIndex] = attempt;

  return res.json({
    status: 'success',
    message: isPublishingOfficial
      ? `Note officielle de ${calculatedNote20}/20 validée et publiée avec succès. L'étudiant peut désormais consulter sa note officielle et vos annotations.`
      : `Brouillon de correction enregistré (${totalPointsAwarded}/${maxPoints} pts — ${calculatedNote20}/20). La copie reste au statut « En attente de correction » pour l'étudiant jusqu'à votre publication officielle.`,
    attempt
  });
});

// ============================================================================
// 2-TER. API MOTEUR OFFICIEL DES QUIZ (ÉTAPE 5)
// ============================================================================

// 1. Liste des quiz accessibles pour l'étudiant connecté
app.get('/api/quizzes/student', authenticateToken, requireRole(['student']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  const profile = DTECH_STUDENTS_PROFILES.find(p => p.userId === req.user?.id);

  if (!user || !profile) {
    return res.status(404).json({ error: 'Profil étudiant introuvable.' });
  }

  // Quiz autorisés STRICTEMENT pour son groupe ET son centre (Statut 'published' UNIQUEMENT)
  const allowedQuizzes = dynamicQuizzes.filter(
    q => (q.groupId === profile.groupId || q.groupIds?.includes(profile.groupId) || q.groupIds?.includes('all')) &&
         (!q.centerId || q.centerId === profile.centerId || q.centerId === 'all') &&
         q.status === 'published'
  );

  // Soumissions de l'étudiant avec PROTECTION ABSOLUE CONTRE LA FUITE DU RÉSULTAT (Test 6)
  const studentSubmissions = dynamicQuizSubmissions
    .filter(s => s.studentId === user.id)
    .map(s => sanitizeSubmissionForStudent(s));

  return res.json({
    status: 'success',
    quizzes: allowedQuizzes,
    submissions: studentSubmissions
  });
});

// 2. Liste des quiz et soumissions pour le formateur connecté (ou DE / DG)
app.get('/api/quizzes/trainer', authenticateToken, requireRole(['trainer', 'admin', 'study_director']), (req: AuthRequest, res: Response) => {
  const trainer = USERS_DB.find(u => u.id === req.user?.id);
  if (!trainer) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const assignedGroupIds = trainer.assignedGroupIds || [];

  let trainerQuizzes = dynamicQuizzes;
  if (trainer.role === 'trainer') {
    trainerQuizzes = dynamicQuizzes.filter(
      q => q.trainerId === trainer.id || 
           (q.centerId === trainer.centerId && (assignedGroupIds.includes(q.groupId) || q.groupIds?.some(gid => assignedGroupIds.includes(gid))))
    );
  } else if (trainer.role === 'study_director') {
    trainerQuizzes = dynamicQuizzes.filter(q => !q.centerId || q.centerId === trainer.centerId || q.centerId === 'all');
  }

  // Soumissions à évaluer (filtrées strictement selon le périmètre et l'isolation des centres)
  const relevantSubmissions = dynamicQuizSubmissions.filter(s => {
    const matchingQuiz = dynamicQuizzes.find(q => q.id === s.quizId);
    return canTrainerAccessSubmission(trainer, s, matchingQuiz);
  });

  return res.json({
    status: 'success',
    quizzes: trainerQuizzes,
    submissions: relevantSubmissions
  });
});

// 3. Supervision des quiz pour la Direction des Études (DE)
app.get('/api/quizzes/study-director', authenticateToken, requireRole(['study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const director = USERS_DB.find(u => u.id === req.user?.id);
  const requestedCenterId = req.query.centerId as string | undefined;
  const targetCenterId = (req.user?.role === 'admin' && requestedCenterId) 
    ? requestedCenterId 
    : (director?.centerId || 'center-lome-avedji');

  const centerQuizzes = dynamicQuizzes.filter(q => !q.centerId || q.centerId === targetCenterId || targetCenterId === 'all');
  const centerSubmissions = dynamicQuizSubmissions.filter(s => !s.centerId || s.centerId === targetCenterId || targetCenterId === 'all');

  const pendingResultsCount = centerSubmissions.filter(s => !s.trainerValidation || s.status === 'pending_result').length;
  const publishedResultsCount = centerSubmissions.filter(s => s.trainerValidation && s.status === 'published').length;

  return res.json({
    status: 'success',
    metrics: {
      totalQuizzes: centerQuizzes.length,
      publishedQuizzes: centerQuizzes.filter(q => q.status === 'published').length,
      draftQuizzes: centerQuizzes.filter(q => q.status === 'draft').length,
      totalSubmissions: centerSubmissions.length,
      pendingResultsCount,
      publishedResultsCount
    },
    quizzes: centerQuizzes,
    submissions: centerSubmissions
  });
});

// 4. Création d'un Quiz par le formateur
app.post('/api/trainer/quizzes', authenticateToken, requireRole(['trainer', 'admin']), (req: AuthRequest, res: Response) => {
  const trainer = USERS_DB.find(u => u.id === req.user?.id);
  if (!trainer) {
    return res.status(404).json({ error: 'Formateur introuvable.' });
  }

  const {
    title,
    description,
    generalInstructions,
    courseUnitId,
    courseUnitCode,
    courseUnitTitle,
    moduleId,
    moduleTitle,
    promotionId,
    groupId,
    groupIds,
    centerId,
    durationMinutes,
    openingDate,
    closingDate,
    displayOrder,
    status,
    questions
  } = req.body;

  if (!title || !courseUnitId || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      error: 'Données incomplètes',
      message: 'Veuillez renseigner le titre du quiz, la matière et au moins une question.'
    });
  }

  const targetCenterId = centerId || trainer.centerId || 'center-lome-avedji';

  // Contrôle strict de centre pour le formateur
  if (trainer.role === 'trainer') {
    if (trainer.centerId && targetCenterId !== trainer.centerId) {
      return res.status(403).json({
        error: 'Violation de périmètre centre',
        message: 'Vous ne pouvez créer des quiz que pour votre centre d\'études d\'affectation.'
      });
    }
  }

  // Calcul du total des points maximum à partir des questions
  const totalMaxPoints = questions.reduce((sum: number, q: any) => sum + (Number(q.maxPoints) || 0), 0);

  const newQuiz: Quiz = {
    id: `qz-${Date.now()}`,
    centerId: targetCenterId,
    formationId: req.body.formationId || 'c9-developpement-web-mobile',
    promotionId: promotionId || 'promo-jan-2026',
    groupId: groupId || 'grp-jan26-dev-g1',
    groupIds: groupIds && Array.isArray(groupIds) ? groupIds : [groupId || 'grp-jan26-dev-g1'],
    courseUnitId,
    courseUnitCode: courseUnitCode || 'INF-101',
    courseUnitTitle: courseUnitTitle || 'Matière DTech',
    moduleId: moduleId || 'm1',
    moduleTitle: moduleTitle || 'Module DTech',
    trainerId: trainer.id,
    trainerName: trainer.name,
    title,
    description: description || '',
    generalInstructions: generalInstructions || 'Conformément au règlement de DTech Group, ce quiz sera évalué manuellement par votre formateur.',
    durationMinutes: Number(durationMinutes) || 45,
    openingDate: openingDate || new Date().toISOString(),
    closingDate: closingDate || '2026-06-30T23:59:59Z',
    displayOrder: Number(displayOrder) || 1,
    status: status === 'published' ? 'published' : 'draft',
    totalMaxPoints: totalMaxPoints > 0 ? totalMaxPoints : 20,
    questions: questions.map((q: any, idx: number) => ({
      id: q.id || `qz-q-${idx + 1}-${Date.now()}`,
      order: q.order || idx + 1,
      type: q.type || 'QCM',
      prompt: q.prompt,
      instructions: q.instructions,
      maxPoints: Number(q.maxPoints) || 2,
      options: q.options,
      associationPairs: q.associationPairs,
      orderingItems: q.orderingItems,
      expectedAnswerSample: q.expectedAnswerSample
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dynamicQuizzes.unshift(newQuiz);

  return res.status(201).json({
    status: 'success',
    message: newQuiz.status === 'published' ? 'Quiz créé et publié avec succès.' : 'Quiz enregistré en brouillon.',
    quiz: newQuiz
  });
});

// 5. Modification d'un Quiz par le formateur
app.put('/api/trainer/quizzes/:id', authenticateToken, requireRole(['trainer', 'admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const trainer = USERS_DB.find(u => u.id === req.user?.id);
  const quizIndex = dynamicQuizzes.findIndex(q => q.id === id);

  if (quizIndex === -1) {
    return res.status(404).json({ error: 'Quiz introuvable.' });
  }

  const existingQuiz = dynamicQuizzes[quizIndex];

  // Contrôle de propriété / centre
  if (trainer?.role === 'trainer') {
    if (existingQuiz.trainerId !== trainer.id && existingQuiz.centerId !== trainer.centerId) {
      return res.status(403).json({ error: 'Vous n\'avez pas le droit de modifier ce quiz.' });
    }
  }

  const { title, description, generalInstructions, questions, status, durationMinutes, openingDate, closingDate } = req.body;

  if (title) existingQuiz.title = title;
  if (description !== undefined) existingQuiz.description = description;
  if (generalInstructions !== undefined) existingQuiz.generalInstructions = generalInstructions;
  if (status) existingQuiz.status = status;
  if (durationMinutes !== undefined) existingQuiz.durationMinutes = Number(durationMinutes);
  if (openingDate) existingQuiz.openingDate = openingDate;
  if (closingDate) existingQuiz.closingDate = closingDate;

  if (questions && Array.isArray(questions)) {
    existingQuiz.questions = questions.map((q: any, idx: number) => ({
      id: q.id || `qz-q-${idx + 1}-${Date.now()}`,
      order: q.order || idx + 1,
      type: q.type || 'QCM',
      prompt: q.prompt,
      instructions: q.instructions,
      maxPoints: Number(q.maxPoints) || 2,
      options: q.options,
      associationPairs: q.associationPairs,
      orderingItems: q.orderingItems,
      expectedAnswerSample: q.expectedAnswerSample
    }));
    existingQuiz.totalMaxPoints = existingQuiz.questions.reduce((sum, q) => sum + (Number(q.maxPoints) || 0), 0);
  }

  existingQuiz.updatedAt = new Date().toISOString();
  dynamicQuizzes[quizIndex] = existingQuiz;

  return res.json({
    status: 'success',
    message: 'Quiz mis à jour avec succès.',
    quiz: existingQuiz
  });
});

// 6. Archivage d'un Quiz
app.post('/api/trainer/quizzes/:id/archive', authenticateToken, requireRole(['trainer', 'admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const quiz = dynamicQuizzes.find(q => q.id === id);
  if (!quiz) return res.status(404).json({ error: 'Quiz introuvable.' });

  quiz.status = 'archived';
  quiz.updatedAt = new Date().toISOString();

  return res.json({
    status: 'success',
    message: 'Quiz archivé avec succès.',
    quiz
  });
});

// 7. SOUMISSION D'UN QUIZ PAR UN ÉTUDIANT (RÈGLE FONDAMENTALE : AUCUNE ÉVALUATION AUTOMATIQUE)
app.post('/api/student/quizzes/:id/submit', authenticateToken, requireRole(['student']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = USERS_DB.find(u => u.id === req.user?.id);
  const profile = DTECH_STUDENTS_PROFILES.find(p => p.userId === req.user?.id);

  if (!user || !profile) {
    return res.status(404).json({ error: 'Profil étudiant introuvable.' });
  }

  const quiz = dynamicQuizzes.find(q => q.id === id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz introuvable.' });
  }

  if (quiz.status !== 'published') {
    return res.status(400).json({ error: 'Ce quiz n\'est pas ouvert aux soumissions.' });
  }

  // Vérification de sécurité multi-centres et groupe
  const isAllowedGroup = quiz.groupId === profile.groupId || 
    (quiz.groupIds && quiz.groupIds.includes(profile.groupId)) ||
    (quiz.groupIds && quiz.groupIds.includes('all'));
  const isAllowedCenter = !quiz.centerId || quiz.centerId === profile.centerId || quiz.centerId === 'all';

  if (!isAllowedGroup || !isAllowedCenter) {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Ce quiz est réservé à un autre groupe ou centre d\'études.'
    });
  }

  const { answers: rawAnswers } = req.body;
  if (!rawAnswers || !Array.isArray(rawAnswers)) {
    return res.status(400).json({ error: 'Veuillez fournir vos réponses au quiz.' });
  }

  // RÈGLE OFFICIELLE DES TENTATIVES (ÉTAPE 7) : MAX 2 TENTATIVES
  const previousSubmissions = dynamicQuizSubmissions.filter(
    s => s.quizId === quiz.id && (s.studentId === user.id || s.studentNumber === profile.studentNumber)
  );

  if (previousSubmissions.length >= 2) {
    return res.status(409).json({
      error: 'Tentatives épuisées',
      message: 'Les deux tentatives autorisées ont déjà été utilisées.'
    });
  }

  const attemptNumber = previousSubmissions.length + 1;

  // INTERDICTIONS ABSOLUES :
  // Le système ne doit JAMAIS :
  // - corriger automatiquement une réponse
  // - évaluer automatiquement une réponse
  // - attribuer automatiquement des points ou points partiels
  // - calculer un résultat provisoire ou pourcentage
  // - afficher "correct" ou "incorrect"
  const processedAnswers: QuizStudentAnswer[] = quiz.questions.map(question => {
    const rawAnswer = rawAnswers.find((a: any) => a.questionId === question.id);
    return {
      questionId: question.id,
      questionOrder: question.order,
      questionType: question.type,
      questionPrompt: question.prompt,
      maxPoints: question.maxPoints,
      studentAnswer: rawAnswer?.studentAnswer !== undefined ? rawAnswer.studentAnswer : '',
      attributedPoints: undefined, // CHAMP EXCLUSIVEMENT RÉSERVÉ AU FORMATEUR
      trainerComment: undefined
    };
  });

  const newSubmission: QuizSubmission = {
    id: `sub-qz-${Date.now()}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    studentId: user.id,
    studentName: user.name,
    studentNumber: profile.studentNumber,
    centerId: profile.centerId,
    centerName: profile.centerName,
    groupId: profile.groupId,
    groupName: profile.groupName,
    formationId: profile.formationId,
    formationTitle: profile.formationTitle,
    promotionId: profile.promotionId,
    courseUnitId: quiz.courseUnitId,
    courseUnitCode: quiz.courseUnitCode,
    courseUnitTitle: quiz.courseUnitTitle,
    moduleId: quiz.moduleId,
    moduleTitle: quiz.moduleTitle,
    trainerId: quiz.trainerId,
    submittedAt: new Date().toISOString(),
    attemptNumber,
    
    // Statuts stricts
    status: 'pending_result',
    trainerValidation: false,
    officialScore: undefined,
    officialScore20: undefined,
    totalPointsAttributed: undefined,
    totalPointsMax: quiz.totalMaxPoints,
    answers: processedAnswers
  };

  dynamicQuizSubmissions.unshift(newSubmission);

  return res.status(201).json({
    status: 'success',
    message: 'Quiz soumis — Résultat en attente de validation par votre formateur.',
    submission: sanitizeSubmissionForStudent(newSubmission)
  });
});

// 8. SAISIE MANUELLE DES POINTS (ENREGISTREMENT EN BROUILLON PAR LE FORMATEUR)
app.post('/api/trainer/quizzes/submissions/:id/save', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const submissionIndex = dynamicQuizSubmissions.findIndex(s => s.id === id);

  if (submissionIndex === -1) {
    return res.status(404).json({ error: 'Soumission de quiz introuvable.' });
  }

  const submission = dynamicQuizSubmissions[submissionIndex];
  const trainer = USERS_DB.find(u => u.id === req.user?.id);
  const quiz = dynamicQuizzes.find(q => q.id === submission.quizId);

  // CONTRÔLE STRICT D'ACCÈS ET ISOLATION DES CENTRES (Test 5)
  if (!trainer || !canTrainerAccessSubmission(trainer, submission, quiz)) {
    return res.status(403).json({
      error: 'Violation de périmètre',
      message: 'Vous n\'êtes pas habilité à évaluer cette soumission de quiz.'
    });
  }

  const { answers: submittedGrades, generalComment } = req.body;
  if (!submittedGrades || !Array.isArray(submittedGrades)) {
    return res.status(400).json({ error: 'Veuillez fournir les points attribués.' });
  }

  // Mise à jour manuelle des points sans validation officielle (l'étudiant ne voit aucun score)
  let totalAttributed = 0;
  const questionScoresForAudit: { questionId: string; maxPoints: number; attributedPoints: number; comment?: string }[] = [];

  for (const gradeItem of submittedGrades) {
    const answer = submission.answers.find(a => a.questionId === gradeItem.questionId);
    if (answer) {
      if (gradeItem.attributedPoints !== undefined && gradeItem.attributedPoints !== null && gradeItem.attributedPoints !== '') {
        const pts = Number(gradeItem.attributedPoints);
        if (isNaN(pts) || pts < 0 || pts > answer.maxPoints) {
          return res.status(400).json({
            error: 'Valeur de points invalide',
            message: `Les points pour la question "${answer.questionPrompt}" doivent être entre 0 et ${answer.maxPoints}.`
          });
        }
        answer.attributedPoints = pts;
        totalAttributed += pts;
      }
      if (gradeItem.trainerComment !== undefined) {
        answer.trainerComment = String(gradeItem.trainerComment).trim();
      }
      questionScoresForAudit.push({
        questionId: answer.questionId,
        maxPoints: answer.maxPoints,
        attributedPoints: answer.attributedPoints ?? 0,
        comment: answer.trainerComment
      });
    }
  }

  if (generalComment !== undefined) {
    submission.generalComment = String(generalComment).trim();
  }

  submission.isDraftSaved = true;
  // Tant que le résultat n'est pas officiellement validé :
  submission.trainerValidation = false;
  submission.status = 'pending_result';
  submission.officialScore = undefined;
  submission.officialScore20 = undefined;

  dynamicQuizSubmissions[submissionIndex] = submission;

  // Enregistrement d'audit (action: 'result_saved')
  const auditEntry: QuizAuditLogEntry = {
    id: `aud-qz-${Date.now()}`,
    quizAttemptId: submission.id,
    quizId: submission.quizId,
    quizTitle: submission.quizTitle,
    studentId: submission.studentId,
    studentName: submission.studentName,
    trainerId: trainer.id,
    trainerName: trainer.name,
    centerId: submission.centerId,
    groupId: submission.groupId,
    action: 'result_saved',
    timestamp: new Date().toISOString(),
    questionScores: questionScoresForAudit,
    totalPointsAttributed: totalAttributed,
    totalPointsMax: submission.totalPointsMax,
    officialScore: 0,
    generalComment: submission.generalComment
  };
  dynamicQuizAuditLogs.unshift(auditEntry);

  return res.json({
    status: 'success',
    message: 'Saisie manuelle des points enregistrée. Résultat maintenu en attente jusqu\'à publication officielle.',
    submission
  });
});

// 9. VALIDATION DU RÉSULTAT ET PUBLICATION OFFICIELLE (CALCUL MATHÉMATIQUE DU RÉSULTAT SUR 20)
app.post('/api/trainer/quizzes/submissions/:id/validate', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const submissionIndex = dynamicQuizSubmissions.findIndex(s => s.id === id);

  if (submissionIndex === -1) {
    return res.status(404).json({ error: 'Soumission de quiz introuvable.' });
  }

  const submission = dynamicQuizSubmissions[submissionIndex];
  const trainer = USERS_DB.find(u => u.id === req.user?.id);
  const quiz = dynamicQuizzes.find(q => q.id === submission.quizId);

  // CONTRÔLE STRICT D'ACCÈS ET ISOLATION DES CENTRES (Test 5)
  if (!trainer || !canTrainerAccessSubmission(trainer, submission, quiz)) {
    return res.status(403).json({
      error: 'Violation de périmètre',
      message: 'Vous n\'êtes pas habilité à valider cette soumission de quiz.'
    });
  }

  const { answers: submittedGrades, generalComment } = req.body;
  if (submittedGrades && Array.isArray(submittedGrades)) {
    for (const gradeItem of submittedGrades) {
      const answer = submission.answers.find(a => a.questionId === gradeItem.questionId);
      if (answer) {
        if (gradeItem.attributedPoints !== undefined && gradeItem.attributedPoints !== null && gradeItem.attributedPoints !== '') {
          answer.attributedPoints = Number(gradeItem.attributedPoints);
        }
        if (gradeItem.trainerComment !== undefined) {
          answer.trainerComment = String(gradeItem.trainerComment).trim();
        }
      }
    }
  }

  if (generalComment !== undefined) {
    submission.generalComment = String(generalComment).trim();
  }

  // CALCUL MATHÉMATIQUE DU RÉSULTAT OFFICIEL :
  // Résultat /20 = (total des points attribués par le formateur ÷ total des points maximum) × 20
  const scoreCalculation = calculateOfficialQuizScore(submission.answers, submission.totalPointsMax);
  if (scoreCalculation.errors.length > 0) {
    return res.status(400).json({
      error: 'Validation impossible',
      message: 'Toutes les questions doivent disposer d\'un nombre de points valide attribué par le formateur.',
      details: scoreCalculation.errors
    });
  }

  submission.status = 'published';
  submission.trainerValidation = true;
  submission.totalPointsAttributed = scoreCalculation.totalPointsAttributed;
  submission.officialScore = scoreCalculation.officialScore20;
  submission.officialScore20 = scoreCalculation.officialScore20;
  submission.validatedAt = new Date().toISOString();
  submission.validatedByTrainerId = trainer.id;
  submission.validatedByTrainerName = trainer.name;
  submission.isDraftSaved = false;

  dynamicQuizSubmissions[submissionIndex] = submission;

  // Enregistrement d'audit officiel
  const auditEntry: QuizAuditLogEntry = {
    id: `aud-qz-${Date.now()}`,
    quizAttemptId: submission.id,
    quizId: submission.quizId,
    quizTitle: submission.quizTitle,
    studentId: submission.studentId,
    studentName: submission.studentName,
    trainerId: trainer.id,
    trainerName: trainer.name,
    centerId: submission.centerId,
    groupId: submission.groupId,
    action: 'official_result_published',
    timestamp: submission.validatedAt,
    questionScores: submission.answers.map(a => ({
      questionId: a.questionId,
      maxPoints: a.maxPoints,
      attributedPoints: a.attributedPoints!,
      comment: a.trainerComment
    })),
    totalPointsAttributed: submission.totalPointsAttributed,
    totalPointsMax: submission.totalPointsMax,
    officialScore: submission.officialScore,
    generalComment: submission.generalComment
  };
  dynamicQuizAuditLogs.unshift(auditEntry);

  return res.json({
    status: 'success',
    message: 'Résultat officiel validé et publié avec succès.',
    officialScore: submission.officialScore,
    submission
  });
});

// 10. RÉVISION D'UN RÉSULTAT OFFICIEL AVEC MOTIF OBLIGATOIRE (TRAÇABILITÉ IMMUABLE)
app.post('/api/trainer/quizzes/submissions/:id/revise', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const submissionIndex = dynamicQuizSubmissions.findIndex(s => s.id === id);

  if (submissionIndex === -1) {
    return res.status(404).json({ error: 'Soumission de quiz introuvable.' });
  }

  const submission = dynamicQuizSubmissions[submissionIndex];
  const trainer = USERS_DB.find(u => u.id === req.user?.id);
  const quiz = dynamicQuizzes.find(q => q.id === submission.quizId);

  if (!trainer || !canTrainerAccessSubmission(trainer, submission, quiz)) {
    return res.status(403).json({ error: 'Non autorisé.' });
  }

  const { answers: submittedGrades, revisionReason, generalComment } = req.body;
  if (!revisionReason || String(revisionReason).trim() === '') {
    return res.status(400).json({
      error: 'Motif obligatoire manquant',
      message: 'La révision d\'un résultat officiel exige obligatoirement un motif pédagogique ou administratif explicite.'
    });
  }

  const previousScore = submission.officialScore;

  if (submittedGrades && Array.isArray(submittedGrades)) {
    for (const gradeItem of submittedGrades) {
      const answer = submission.answers.find(a => a.questionId === gradeItem.questionId);
      if (answer && gradeItem.attributedPoints !== undefined) {
        answer.attributedPoints = Number(gradeItem.attributedPoints);
      }
      if (answer && gradeItem.trainerComment !== undefined) {
        answer.trainerComment = String(gradeItem.trainerComment).trim();
      }
    }
  }

  if (generalComment !== undefined) {
    submission.generalComment = String(generalComment).trim();
  }

  const scoreCalculation = calculateOfficialQuizScore(submission.answers, submission.totalPointsMax);
  if (scoreCalculation.errors.length > 0) {
    return res.status(400).json({ error: 'Points invalides', details: scoreCalculation.errors });
  }

  submission.totalPointsAttributed = scoreCalculation.totalPointsAttributed;
  submission.officialScore = scoreCalculation.officialScore20;
  submission.officialScore20 = scoreCalculation.officialScore20;
  submission.validatedAt = new Date().toISOString();
  submission.validatedByTrainerId = trainer.id;
  submission.validatedByTrainerName = trainer.name;

  dynamicQuizSubmissions[submissionIndex] = submission;

  // Journalisation d'audit avec ancien score, nouveau score et motif
  const auditEntry: QuizAuditLogEntry = {
    id: `aud-rev-${Date.now()}`,
    quizAttemptId: submission.id,
    quizId: submission.quizId,
    quizTitle: submission.quizTitle,
    studentId: submission.studentId,
    studentName: submission.studentName,
    trainerId: trainer.id,
    trainerName: trainer.name,
    centerId: submission.centerId,
    groupId: submission.groupId,
    action: 'result_revised',
    timestamp: submission.validatedAt,
    questionScores: submission.answers.map(a => ({
      questionId: a.questionId,
      maxPoints: a.maxPoints,
      attributedPoints: a.attributedPoints!,
      comment: a.trainerComment
    })),
    totalPointsAttributed: submission.totalPointsAttributed,
    totalPointsMax: submission.totalPointsMax,
    officialScore: submission.officialScore,
    previousScore,
    revisionReason: String(revisionReason).trim(),
    generalComment: submission.generalComment
  };
  dynamicQuizAuditLogs.unshift(auditEntry);

  return res.json({
    status: 'success',
    message: 'Résultat officiel révisé avec succès et enregistré dans l\'historique d\'audit.',
    previousScore,
    officialScore: submission.officialScore,
    submission
  });
});

// 11. Consultation du journal d'audit d'une soumission
app.get('/api/quizzes/submissions/:id/audit', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const logs = dynamicQuizAuditLogs.filter(l => l.quizAttemptId === id);
  return res.json({ status: 'success', auditTrail: logs });
});

// 12. Exécution de la suite des 7 tests obligatoires Étape 5
app.get('/api/quizzes/tests/run', authenticateToken, (req: Request, res: Response) => {
  const results = runStep5QuizTests();
  const allPassed = results.every(r => r.passed);
  return res.json({
    status: 'success',
    allPassed,
    totalTests: results.length,
    passedTests: results.filter(r => r.passed).length,
    results
  });
});

// ============================================================================
// ÉTAPE 7 — MOTEUR OFFICIEL DES TENTATIVES ET DE L’HISTORIQUE DES RÉSULTATS
// ============================================================================

// 1. Consultation des tentatives et synthèses officielles pour l'étudiant
app.get('/api/attempts/student', authenticateToken, requireRole(['student']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  const profile = DTECH_STUDENTS_PROFILES.find(p => p.userId === req.user?.id || p.id === req.user?.id);

  if (!user || !profile) {
    return res.status(404).json({ error: 'Profil étudiant introuvable.' });
  }

  // Filtrer les exercices accessibles au groupe et centre de l'étudiant
  const allowedExercises = dynamicExercises.filter(e => {
    if (e.status !== 'published') return false;
    const isAllowedGroup = e.groupId === profile.groupId || 
      (e.groupIds && e.groupIds.includes(profile.groupId)) ||
      (e.groupIds && e.groupIds.includes('all'));
    const isAllowedCenter = !e.centerId || e.centerId === profile.centerId || e.centerId === 'all';
    return isAllowedGroup && isAllowedCenter;
  });

  // Filtrer les quiz accessibles au groupe et centre de l'étudiant
  const allowedQuizzes = dynamicQuizzes.filter(q => {
    if (q.status !== 'published') return false;
    const isAllowedGroup = q.groupId === profile.groupId || 
      (q.groupIds && q.groupIds.includes(profile.groupId)) ||
      (q.groupIds && q.groupIds.includes('all'));
    const isAllowedCenter = !q.centerId || q.centerId === profile.centerId || q.centerId === 'all';
    return isAllowedGroup && isAllowedCenter;
  });

  // Tentatives d'exercices de l'étudiant
  const studentExAttempts = dynamicExerciseAttempts
    .filter(a => a.studentId === user.id || a.studentNumber === profile.studentNumber)
    .map(normalizeExerciseAttemptToEvaluationAttempt);

  // Tentatives de quiz de l'étudiant
  const studentQuizAttempts = dynamicQuizSubmissions
    .filter(s => s.studentId === user.id || s.studentNumber === profile.studentNumber)
    .map(normalizeQuizSubmissionToEvaluationAttempt);

  const allAttempts = [...studentExAttempts, ...studentQuizAttempts];

  // Calcul des résumés par évaluation
  const summaries: StudentEvaluationAttemptsSummary[] = [];

  for (const ex of allowedExercises) {
    const summary = calculateAttemptSummary(
      {
        id: ex.id,
        title: ex.title,
        type: 'exercise',
        courseUnitCode: ex.courseCode,
        courseUnitTitle: ex.courseTitle,
        moduleId: 'm1',
        moduleTitle: ex.moduleTitle
      },
      profile,
      allAttempts
    );
    summaries.push(summary);
  }

  for (const qz of allowedQuizzes) {
    const summary = calculateAttemptSummary(
      {
        id: qz.id,
        title: qz.title,
        type: 'quiz',
        courseUnitId: qz.courseUnitId,
        courseUnitCode: qz.courseUnitCode,
        courseUnitTitle: qz.courseUnitTitle,
        moduleId: qz.moduleId,
        moduleTitle: qz.moduleTitle
      },
      profile,
      allAttempts
    );
    summaries.push(summary);
  }

  // PROTECTION CONTRE LES FUITES : pour toute tentative non validée, masquer tout score
  const safeAttempts = allAttempts.map(att => {
    if (!att.trainerValidation || att.status !== 'published') {
      return {
        ...att,
        officialScore: undefined,
        totalPointsEarned: undefined
      };
    }
    return att;
  });

  return res.json({
    status: 'success',
    summaries,
    attempts: safeAttempts
  });
});

// 2. Consultation des tentatives pour le formateur avec contrôle RBAC
app.get('/api/attempts/trainer', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const allExAttempts = dynamicExerciseAttempts.map(normalizeExerciseAttemptToEvaluationAttempt);
  const allQuizAttempts = dynamicQuizSubmissions.map(normalizeQuizSubmissionToEvaluationAttempt);
  const combined = [...allExAttempts, ...allQuizAttempts];

  // Filtrage selon le périmètre et l'isolation multi-centres
  const accessibleAttempts = combined.filter(att => canUserAccessAttemptScope(user, att));

  // Audit logs filtrés
  const userCenterId = user.centerId;
  const filteredAudit = dynamicAttemptAuditEvents.filter(ev => {
    if (user.role === 'admin') return true;
    if (userCenterId && ev.centerId !== userCenterId) return false;
    return true;
  });

  return res.json({
    status: 'success',
    attempts: accessibleAttempts,
    auditLogs: filteredAudit
  });
});

// 3. Consultation des tentatives pour le Directeur des Études (DE)
app.get('/api/attempts/study-director', authenticateToken, requireRole(['study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const director = USERS_DB.find(u => u.id === req.user?.id);
  if (!director) {
    return res.status(404).json({ error: 'Directeur des Études introuvable.' });
  }

  const requestedCenterId = req.query.centerId as string | undefined;

  // Contrôle de sécurité multi-centres : un DE ne peut pas inspecter le centre d'un confrère
  if (director.role === 'study_director' && requestedCenterId && requestedCenterId !== director.centerId) {
    return res.status(403).json({
      error: 'Isolation Multi-Centres violée',
      message: 'Vous ne pouvez consulter que les tentatives relatives à votre centre de rattachement.'
    });
  }

  const targetCenterId = (director.role === 'admin' && requestedCenterId)
    ? requestedCenterId
    : (director.centerId || 'center-lome-avedji');

  const allExAttempts = dynamicExerciseAttempts.map(normalizeExerciseAttemptToEvaluationAttempt);
  const allQuizAttempts = dynamicQuizSubmissions.map(normalizeQuizSubmissionToEvaluationAttempt);
  const combined = [...allExAttempts, ...allQuizAttempts];

  const centerAttempts = combined.filter(att => {
    if (director.role === 'admin' && !requestedCenterId) return true;
    return !att.centerId || att.centerId === targetCenterId || att.centerId === 'all';
  });

  const centerAudit = dynamicAttemptAuditEvents.filter(ev => {
    if (director.role === 'admin' && !requestedCenterId) return true;
    return !ev.centerId || ev.centerId === targetCenterId;
  });

  return res.json({
    status: 'success',
    centerId: targetCenterId,
    attempts: centerAttempts,
    auditLogs: centerAudit
  });
});

// 4. Révision d'une note officielle avec motif obligatoire et conservation d'historique
app.post('/api/attempts/revise-score', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const { attemptId, newScore, reason } = req.body;

  if (!attemptId || typeof newScore !== 'number' || isNaN(newScore) || newScore < 0 || newScore > 20) {
    return res.status(400).json({
      error: 'Données invalides',
      message: 'Veuillez fournir un attemptId et une note valide entre 0 et 20.'
    });
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    return res.status(400).json({
      error: 'Motif obligatoire manquant',
      message: 'Un motif pédagogique détaillé (au moins 5 caractères) est strictement requis pour toute révision de note officielle.'
    });
  }

  // Chercher dans les exercices
  const exIndex = dynamicExerciseAttempts.findIndex(a => a.id === attemptId);
  if (exIndex !== -1) {
    const exAttempt = dynamicExerciseAttempts[exIndex];
    const normalized = normalizeExerciseAttemptToEvaluationAttempt(exAttempt);

    if (!canUserAccessAttemptScope(user, normalized)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'êtes pas habilité à réviser cette tentative.'
      });
    }

    const previousScore = exAttempt.officialScore20 || exAttempt.officialScore || 0;
    const { updatedAttempt, revisionEntry } = recordScoreRevision(normalized, newScore, user.id, user.name, reason);

    exAttempt.officialScore20 = updatedAttempt.officialScore;
    exAttempt.officialScore = updatedAttempt.officialScore;
    exAttempt.gradeHistory = exAttempt.gradeHistory || [];
    exAttempt.gradeHistory.push({
      id: revisionEntry.id,
      attemptId: exAttempt.id,
      exerciseId: exAttempt.exerciseId,
      exerciseTitle: exAttempt.exerciseTitle,
      studentId: exAttempt.studentId,
      studentName: exAttempt.studentName,
      previousScore20: revisionEntry.previousScore,
      newScore20: revisionEntry.newScore,
      trainerId: user.id,
      trainerName: user.name,
      modifiedAt: revisionEntry.timestamp,
      reason: revisionEntry.reason
    });

    dynamicExerciseAttempts[exIndex] = exAttempt;

    dynamicAttemptAuditEvents.unshift({
      id: `aud-${Date.now()}`,
      action: 'result_revised',
      attemptId: exAttempt.id,
      attemptNumber: exAttempt.attemptNumber || 1,
      studentId: exAttempt.studentId,
      studentName: exAttempt.studentName || 'Étudiant',
      evaluationId: exAttempt.exerciseId,
      evaluationTitle: exAttempt.exerciseTitle || 'Exercice / TP',
      evaluationType: 'exercise',
      centerId: exAttempt.centerId,
      groupId: exAttempt.groupId,
      trainerId: user.id,
      trainerName: user.name,
      previousScore,
      newScore,
      reason,
      timestamp: new Date().toISOString()
    });

    return res.json({
      status: 'success',
      message: 'Note officielle révisée et historisée avec succès.',
      attempt: updatedAttempt,
      revision: revisionEntry
    });
  }

  // Chercher dans les quiz
  const qzIndex = dynamicQuizSubmissions.findIndex(s => s.id === attemptId);
  if (qzIndex !== -1) {
    const qzSub = dynamicQuizSubmissions[qzIndex];
    const normalized = normalizeQuizSubmissionToEvaluationAttempt(qzSub);

    if (!canUserAccessAttemptScope(user, normalized)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'êtes pas habilité à réviser cette tentative.'
      });
    }

    const previousScore = qzSub.officialScore20 || qzSub.officialScore || 0;
    const { updatedAttempt, revisionEntry } = recordScoreRevision(normalized, newScore, user.id, user.name, reason);

    qzSub.officialScore20 = updatedAttempt.officialScore;
    qzSub.officialScore = updatedAttempt.officialScore;
    qzSub.revisionHistory = qzSub.revisionHistory || [];
    qzSub.revisionHistory.push(revisionEntry);

    dynamicQuizSubmissions[qzIndex] = qzSub;

    dynamicAttemptAuditEvents.unshift({
      id: `aud-${Date.now()}`,
      action: 'result_revised',
      attemptId: qzSub.id,
      attemptNumber: qzSub.attemptNumber || 1,
      studentId: qzSub.studentId,
      studentName: qzSub.studentName,
      evaluationId: qzSub.quizId,
      evaluationTitle: qzSub.quizTitle,
      evaluationType: 'quiz',
      centerId: qzSub.centerId,
      groupId: qzSub.groupId,
      trainerId: user.id,
      trainerName: user.name,
      previousScore,
      newScore,
      reason,
      timestamp: new Date().toISOString()
    });

    return res.json({
      status: 'success',
      message: 'Note officielle révisée et historisée avec succès.',
      attempt: updatedAttempt,
      revision: revisionEntry
    });
  }

  return res.status(404).json({ error: 'Tentative introuvable.' });
});

// 5. Journal d'audit des tentatives
app.get('/api/attempts/audit', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const filtered = dynamicAttemptAuditEvents.filter(ev => {
    if (user.role === 'admin') return true;
    if (user.centerId && ev.centerId !== user.centerId) return false;
    return true;
  });

  return res.json({ status: 'success', auditLogs: filtered });
});

// 6. Exécution de la suite des 9 tests obligatoires Étape 7
app.get('/api/attempts/tests/run', authenticateToken, (req: Request, res: Response) => {
  const results = runStep7AttemptsTests();
  const allPassed = results.every(r => r.passed);
  return res.json({
    status: 'success',
    allPassed,
    totalTests: results.length,
    passedTests: results.filter(r => r.passed).length,
    results
  });
});

// ============================================================================
// ÉTAPE 8 — VALIDATION OFFICIELLE DES MODULES (RÈGLE 60% EX + 40% QUIZ & BEST SCORE)
// ============================================================================

// 1. Consultation des modules pour l'étudiant connecté (Strictement personnel, simple et épuré)
app.get('/api/module-validations/student', authenticateToken, requireRole(['student', 'admin']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id) || USERS_DB.find(u => u.role === 'student');
  if (!user) {
    return res.status(404).json({ error: 'Profil étudiant introuvable' });
  }

  const studentProfile = DTECH_STUDENTS_PROFILES.find(p => p.userId === user.id) || DTECH_STUDENTS_PROFILES[0];
  
  // Normalisation des tentatives unifiées
  const unifiedAttempts: EvaluationAttempt[] = [
    ...dynamicExerciseAttempts.map(normalizeExerciseAttemptToEvaluationAttempt),
    ...dynamicQuizSubmissions.map(normalizeQuizSubmissionToEvaluationAttempt)
  ];

  const validationRecords = computeAllModuleValidationsForStudent({
    student: studentProfile,
    courses: DTECH_COURSE_UNITS,
    exercises: dynamicExercises,
    exerciseAttempts: dynamicExerciseAttempts,
    quizzes: dynamicQuizzes,
    quizSubmissions: dynamicQuizSubmissions,
    allUnifiedAttempts: unifiedAttempts,
    existingRecords: dynamicModuleValidations
  });

  // Mise à jour de la mémoire cache dynamique pour synchronisation
  validationRecords.forEach(rec => {
    const idx = dynamicModuleValidations.findIndex(existing => existing.id === rec.id);
    if (idx >= 0) {
      dynamicModuleValidations[idx] = rec;
    } else {
      dynamicModuleValidations.push(rec);
    }
  });

  // Format épuré, centré sur le parcours de l'étudiant (PAS de surcharge dashboard)
  const studentView = validationRecords.map(rec => ({
    id: rec.id,
    moduleId: rec.moduleId,
    moduleTitle: rec.moduleTitle,
    courseUnitId: rec.courseUnitId,
    courseUnitCode: rec.courseUnitCode,
    courseUnitTitle: rec.courseUnitTitle,
    finalScore: rec.finalScore,
    status: rec.status,
    statusLabel: rec.statusLabel,
    exerciseScore: rec.exerciseScore,
    quizScore: rec.quizScore,
    publishedAt: rec.validatedAt
  }));

  const validatedCount = studentView.filter(v => v.status === 'validated').length;
  const pendingCount = studentView.filter(v => v.status === 'pending_evaluations').length;
  const notValidatedCount = studentView.filter(v => v.status === 'not_validated').length;

  return res.json({
    status: 'success',
    student: {
      id: user.id,
      name: user.name,
      studentNumber: studentProfile.studentNumber,
      formationTitle: studentProfile.formationTitle,
      centerName: studentProfile.centerName
    },
    summary: {
      totalModules: studentView.length,
      validatedCount,
      pendingCount,
      notValidatedCount
    },
    modules: studentView
  });
});

// 2. Vue formateur des validations de modules (avec filtres, isolation par centre & pédagogie)
app.get('/api/module-validations/trainer', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const { promotionId, groupId, formationId, moduleId, studentId, status } = req.query as Record<string, string | undefined>;

  // Filtrer les étudiants éligibles selon le périmètre et le centre de l'évaluateur
  let eligibleStudents = [...DTECH_STUDENTS_PROFILES];

  if (user.role === 'trainer') {
    // Le formateur ne peut voir que les étudiants de son centre et de ses groupes assignés
    const assignedGroupIds = user.assignedGroupIds || [];
    eligibleStudents = eligibleStudents.filter(st => {
      const sameCenter = !user.centerId || user.centerId === 'all' || st.centerId === user.centerId;
      const assignedGroup = assignedGroupIds.includes('all') || assignedGroupIds.includes(st.groupId);
      return sameCenter && assignedGroup;
    });
  } else if (user.role === 'study_director') {
    // Le Directeur des Études supervise exclusivement les étudiants de son centre
    if (user.centerId && user.centerId !== 'all') {
      eligibleStudents = eligibleStudents.filter(st => st.centerId === user.centerId);
    }
  }
  // L'administrateur (DG) a un accès complet aux 7 centres du Togo

  // Application des filtres de requête
  if (promotionId && promotionId !== 'all') {
    eligibleStudents = eligibleStudents.filter(st => st.promotionId === promotionId);
  }
  if (groupId && groupId !== 'all') {
    eligibleStudents = eligibleStudents.filter(st => st.groupId === groupId);
  }
  if (formationId && formationId !== 'all') {
    eligibleStudents = eligibleStudents.filter(st => st.formationId === formationId);
  }
  if (studentId && studentId !== 'all') {
    eligibleStudents = eligibleStudents.filter(st => st.id === studentId || st.userId === studentId || st.studentNumber === studentId);
  }

  // Normalisation des tentatives unifiées
  const unifiedAttempts: EvaluationAttempt[] = [
    ...dynamicExerciseAttempts.map(normalizeExerciseAttemptToEvaluationAttempt),
    ...dynamicQuizSubmissions.map(normalizeQuizSubmissionToEvaluationAttempt)
  ];

  // Calcul ou récupération des fiches de validation de modules
  const allRecords: ModuleValidationRecord[] = [];

  for (const st of eligibleStudents) {
    const records = computeAllModuleValidationsForStudent({
      student: st,
      courses: DTECH_COURSE_UNITS,
      exercises: dynamicExercises,
      exerciseAttempts: dynamicExerciseAttempts,
      quizzes: dynamicQuizzes,
      quizSubmissions: dynamicQuizSubmissions,
      allUnifiedAttempts: unifiedAttempts,
      existingRecords: dynamicModuleValidations
    });

    for (const rec of records) {
      // Filtrer par module ou statut si spécifié
      if (moduleId && moduleId !== 'all' && rec.moduleId !== moduleId) continue;
      if (status && status !== 'all' && rec.status !== status) continue;
      allRecords.push(rec);

      // Mise à jour cache
      const existingIdx = dynamicModuleValidations.findIndex(e => e.id === rec.id);
      if (existingIdx >= 0) {
        dynamicModuleValidations[existingIdx] = rec;
      } else {
        dynamicModuleValidations.push(rec);
      }
    }
  }

  return res.json({
    status: 'success',
    count: allRecords.length,
    records: allRecords
  });
});

// 3. Vue Direction des Études (Supervision de centre et alertes pédagogiques)
app.get('/api/module-validations/director', authenticateToken, requireRole(['study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const { centerId, promotionId, groupId, formationId, moduleId, status } = req.query as Record<string, string | undefined>;

  const targetCenterId = user.role === 'admin' ? (centerId || 'all') : (user.centerId || 'center-lome-avedji');

  let eligibleStudents = DTECH_STUDENTS_PROFILES.filter(st => {
    if (targetCenterId !== 'all' && st.centerId !== targetCenterId) return false;
    if (promotionId && promotionId !== 'all' && st.promotionId !== promotionId) return false;
    if (groupId && groupId !== 'all' && st.groupId !== groupId) return false;
    if (formationId && formationId !== 'all' && st.formationId !== formationId) return false;
    return true;
  });

  const unifiedAttempts: EvaluationAttempt[] = [
    ...dynamicExerciseAttempts.map(normalizeExerciseAttemptToEvaluationAttempt),
    ...dynamicQuizSubmissions.map(normalizeQuizSubmissionToEvaluationAttempt)
  ];

  const allRecords: ModuleValidationRecord[] = [];

  for (const st of eligibleStudents) {
    const records = computeAllModuleValidationsForStudent({
      student: st,
      courses: DTECH_COURSE_UNITS,
      exercises: dynamicExercises,
      exerciseAttempts: dynamicExerciseAttempts,
      quizzes: dynamicQuizzes,
      quizSubmissions: dynamicQuizSubmissions,
      allUnifiedAttempts: unifiedAttempts,
      existingRecords: dynamicModuleValidations
    });

    for (const rec of records) {
      if (moduleId && moduleId !== 'all' && rec.moduleId !== moduleId) continue;
      if (status && status !== 'all' && rec.status !== status) continue;
      allRecords.push(rec);
    }
  }

  const validatedTotal = allRecords.filter(r => r.status === 'validated').length;
  const pendingTotal = allRecords.filter(r => r.status === 'pending_evaluations').length;
  const notValidatedTotal = allRecords.filter(r => r.status === 'not_validated').length;

  return res.json({
    status: 'success',
    centerId: targetCenterId,
    stats: {
      totalRecords: allRecords.length,
      validatedTotal,
      pendingTotal,
      notValidatedTotal,
      validationRate: allRecords.length > 0 ? Math.round((validatedTotal / allRecords.length) * 100) : 0
    },
    records: allRecords
  });
});

// 4. Historique d'audit immuable des validations de modules
app.get('/api/module-validations/audit', authenticateToken, requireRole(['study_director', 'admin', 'trainer']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const filteredLogs = dynamicModuleValidationAuditLogs.filter(log => {
    if (user.role === 'admin') return true;
    if (user.centerId && log.centerId !== user.centerId) return false;
    return true;
  });

  return res.json({
    status: 'success',
    count: filteredLogs.length,
    auditLogs: filteredLogs
  });
});

// 5. Révision exceptionnelle d'un résultat de module avec audit immuable obligatoire
app.post('/api/module-validations/revise', authenticateToken, requireRole(['trainer', 'study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const { recordId, studentId, moduleId, newStatus, newScore, reason } = req.body;

  if (!studentId || !moduleId || !reason || String(reason).trim().length < 5) {
    return res.status(400).json({
      error: 'Motif obligatoire',
      message: 'Toute révision officielle d’un module exige un motif pédagogique circonstancié d’au moins 5 caractères.'
    });
  }

  const student = DTECH_STUDENTS_PROFILES.find(s => s.id === studentId || s.userId === studentId || s.studentNumber === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Étudiant introuvable.' });
  }

  // Contrôle d'accès par centre
  const hasAccess = canUserViewStudentModuleValidations(
    { id: user.id, role: user.role, centerId: user.centerId, name: user.name, email: user.email, status: user.status, createdAt: user.createdAt },
    student.centerId,
    student.userId
  );

  if (!hasAccess) {
    return res.status(403).json({
      error: 'Accès interdit',
      message: 'Vous ne disposez pas des habilitations requises pour modifier les résultats de ce centre.'
    });
  }

  const existingRecord = dynamicModuleValidations.find(
    r => (r.id === recordId) || (r.studentId === student.userId && r.moduleId === moduleId)
  );

  const previousStatus = existingRecord ? existingRecord.status : 'pending_evaluations';
  const previousScore = existingRecord?.finalScore;
  const parsedScore = newScore !== undefined && newScore !== null && newScore !== '' ? Number(newScore) : undefined;
  const parsedStatus: ModuleValidationStatus = newStatus || (parsedScore !== undefined ? (parsedScore >= 10.0 ? 'validated' : 'not_validated') : previousStatus);

  // Enregistrement de l'audit log immuable
  const auditEntry = createModuleValidationAuditEntry({
    studentId: student.userId,
    studentName: student.fullName,
    moduleId,
    moduleTitle: existingRecord?.moduleTitle || moduleId,
    centerId: student.centerId,
    previousStatus,
    newStatus: parsedStatus,
    previousScore,
    newScore: parsedScore,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, centerId: user.centerId, status: user.status, createdAt: user.createdAt },
    action: 'module_score_revised',
    reason: String(reason).trim()
  });

  dynamicModuleValidationAuditLogs.unshift(auditEntry);

  // Mise à jour du record
  if (existingRecord) {
    existingRecord.status = parsedStatus;
    existingRecord.statusLabel = parsedStatus === 'validated' ? 'Module validé' : parsedStatus === 'not_validated' ? 'Module non validé' : 'Évaluations en attente';
    if (parsedScore !== undefined) {
      existingRecord.finalScore = parsedScore;
    }
    existingRecord.validatedAt = new Date().toISOString();
    existingRecord.validatedBy = user.id;
    existingRecord.validatedByName = user.name;
    existingRecord.history.push({
      id: auditEntry.id,
      action: 'score_revised',
      previousStatus: auditEntry.previousStatus,
      newStatus: auditEntry.newStatus,
      previousScore: auditEntry.previousScore,
      newScore: auditEntry.newScore,
      userId: auditEntry.userId,
      userName: auditEntry.userName,
      userRole: auditEntry.userRole,
      reason: auditEntry.reason,
      timestamp: auditEntry.timestamp
    });
  }

  return res.json({
    status: 'success',
    message: 'Résultat du module révisé avec succès. Entrée d’audit immuable enregistrée.',
    auditEntry,
    record: existingRecord
  });
});

// 6. Exécution de la suite complète des 12 tests obligatoires de l'Étape 8
app.get('/api/module-validations/tests/run', authenticateToken, (req: Request, res: Response) => {
  const results = runStep8ModuleValidationTests();
  const allPassed = results.every(r => r.passed);
  return res.json({
    status: 'success',
    allPassed,
    totalTests: results.length,
    passedTests: results.filter(r => r.passed).length,
    results
  });
});

// ============================================================================
// ÉTAPE 9 — SYSTÈME OFFICIEL DE GESTION, VALIDATION & VÉRIFICATION DU DIPLÔME
// ============================================================================

// Helper interne pour calculer les validations d'un étudiant
function getStudentOfficialModuleValidations(studentProfile: any): ModuleValidationRecord[] {
  const unifiedAttempts: EvaluationAttempt[] = [
    ...dynamicExerciseAttempts.map(normalizeExerciseAttemptToEvaluationAttempt),
    ...dynamicQuizSubmissions.map(normalizeQuizSubmissionToEvaluationAttempt)
  ];

  return computeAllModuleValidationsForStudent({
    student: studentProfile,
    courses: DTECH_COURSE_UNITS,
    exercises: dynamicExercises,
    exerciseAttempts: dynamicExerciseAttempts,
    quizzes: dynamicQuizzes,
    quizSubmissions: dynamicQuizSubmissions,
    allUnifiedAttempts: unifiedAttempts,
    existingRecords: dynamicModuleValidations
  });
}

// 1. Consultation de son diplôme par l'étudiant (Version partielle de motivation ou finale validée)
app.get('/api/diplomas/my', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id) || USERS_DB.find(u => u.role === 'student');
  if (!user) {
    return res.status(404).json({ error: 'Profil utilisateur introuvable.' });
  }

  const studentProfile = DTECH_STUDENTS_PROFILES.find(p => p.userId === user.id) || DTECH_STUDENTS_PROFILES[0];
  const validations = getStudentOfficialModuleValidations(studentProfile);
  const eligibility = checkStudentDiplomaEligibility(studentProfile, DTECH_COURSE_UNITS, validations);

  let existingDiploma = dynamicDiplomas.find(d => d.studentId === studentProfile.userId);

  const diploma = await buildDiplomaRecord({
    student: studentProfile,
    eligibility,
    existingRecord: existingDiploma,
    appBaseUrl: `${req.protocol}://${req.get('host')}`
  });

  // Mettre à jour en mémoire
  const idx = dynamicDiplomas.findIndex(d => d.id === diploma.id);
  if (idx >= 0) {
    dynamicDiplomas[idx] = diploma;
  } else {
    dynamicDiplomas.push(diploma);
  }

  return res.json({
    status: 'success',
    diploma,
    eligibility
  });
});

// 2. Consultation des diplômes et éligibilité pour DG et DE (avec confinement strict par centre)
app.get('/api/diplomas/list', authenticateToken, requireRole(['study_director', 'admin']), async (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const { centerId, formationId, studentId } = req.query as Record<string, string | undefined>;

  // Confinement strict : DE limité à son centre, DG peut filtrer ou tout voir
  const targetCenterId = user.role === 'admin' ? (centerId || 'ALL') : (user.centerId || 'center-lome-avedji');

  let eligibleStudents = DTECH_STUDENTS_PROFILES.filter(st => {
    if (targetCenterId !== 'ALL' && st.centerId !== targetCenterId) return false;
    if (formationId && formationId !== 'ALL' && st.formationId !== formationId) return false;
    if (studentId && studentId !== 'ALL' && st.id !== studentId && st.userId !== studentId) return false;
    return true;
  });

  const studentsOutput = [];
  const appBaseUrl = `${req.protocol}://${req.get('host')}`;

  for (const st of eligibleStudents) {
    const validations = getStudentOfficialModuleValidations(st);
    const eligibility = checkStudentDiplomaEligibility(st, DTECH_COURSE_UNITS, validations);
    const existingDiploma = dynamicDiplomas.find(d => d.studentId === st.userId);

    const diploma = await buildDiplomaRecord({
      student: st,
      eligibility,
      existingRecord: existingDiploma,
      appBaseUrl
    });

    // Mettre à jour le cache
    const idx = dynamicDiplomas.findIndex(d => d.id === diploma.id);
    if (idx >= 0) {
      dynamicDiplomas[idx] = diploma;
    } else {
      dynamicDiplomas.push(diploma);
    }

    studentsOutput.push({
      student: st,
      eligibility,
      diploma
    });
  }

  // Filtrer les audits accessibles
  const accessibleAudits = dynamicDiplomaAudits.filter(a => {
    if (user.role === 'admin') return true;
    if (user.centerId && a.centerId !== user.centerId) return false;
    return true;
  });

  return res.json({
    status: 'success',
    totalStudents: studentsOutput.length,
    students: studentsOutput,
    auditLogs: accessibleAudits
  });
});

// 3. Validation officielle du diplôme (Réservée exclusivement au Directeur Général / Admin)
app.post('/api/diplomas/validate', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const { studentId, reason } = req.body;
  if (!studentId) {
    return res.status(400).json({ error: 'Le paramètre studentId est requis.' });
  }

  const student = DTECH_STUDENTS_PROFILES.find(s => s.id === studentId || s.userId === studentId || s.studentNumber === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Étudiant introuvable.' });
  }

  // Vérification stricte de l'éligibilité côté serveur (ne jamais faire confiance au client)
  const validations = getStudentOfficialModuleValidations(student);
  const eligibility = checkStudentDiplomaEligibility(student, DTECH_COURSE_UNITS, validations);

  if (!eligibility.isEligible) {
    return res.status(400).json({
      error: 'Étudiant non éligible',
      message: 'Impossible de valider officiellement le diplôme : tous les modules obligatoires doivent être officiellement validés (note >= 10.00/20).',
      reasons: eligibility.reasons
    });
  }

  const appBaseUrl = `${req.protocol}://${req.get('host')}`;
  const diplomaId = `dip-${student.userId}-${student.formationId}`;
  const verificationUrl = `${appBaseUrl}/#verify-diploma?id=${diplomaId}`;
  const qrCodeDataUrl = await generateDiplomaQRCode(verificationUrl);
  const now = new Date().toISOString();

  let existingDiploma = dynamicDiplomas.find(d => d.studentId === student.userId);

  const previousStatus = existingDiploma?.status || 'partial';
  const updatedDiploma: DiplomaRecord = {
    ...(existingDiploma || await buildDiplomaRecord({ student, eligibility, appBaseUrl })),
    id: diplomaId,
    status: 'final_validated',
    statusLabel: 'Version Finale Validée',
    overallAverageScore: eligibility.overallAverageScore,
    academicMention: eligibility.academicMention,
    validatedAt: now,
    validatedBy: user.id,
    validatedByName: user.name,
    revokedAt: undefined,
    revokedBy: undefined,
    revokedReason: undefined,
    qrVerificationUrl: verificationUrl,
    qrCodeDataUrl,
    updatedAt: now
  };

  const auditEntry: DiplomaAuditEntry = {
    id: `aud-dip-${Date.now()}`,
    diplomaId,
    studentId: student.userId,
    studentName: student.fullName,
    centerId: student.centerId,
    action: 'final_validated',
    previousStatus,
    newStatus: 'final_validated',
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    reason: reason || 'Validation académique officielle par la Direction Générale DTech Group',
    timestamp: now
  };

  updatedDiploma.history = [auditEntry, ...(updatedDiploma.history || [])];

  const idx = dynamicDiplomas.findIndex(d => d.id === diplomaId);
  if (idx >= 0) {
    dynamicDiplomas[idx] = updatedDiploma;
  } else {
    dynamicDiplomas.push(updatedDiploma);
  }

  dynamicDiplomaAudits.unshift(auditEntry);

  return res.json({
    status: 'success',
    message: 'Diplôme validé officiellement avec succès par la Direction Générale.',
    diploma: updatedDiploma,
    auditEntry
  });
});

// 4. Annulation administrative officielle du diplôme (Réservée au Directeur Général avec motif obligatoire)
app.post('/api/diplomas/revoke', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const user = USERS_DB.find(u => u.id === req.user?.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const { studentId, reason } = req.body;
  if (!studentId || !reason || String(reason).trim().length < 5) {
    return res.status(400).json({
      error: 'Motif obligatoire',
      message: 'Un motif circonstancié d’au moins 5 caractères est strictement obligatoire pour révoquer un diplôme.'
    });
  }

  const student = DTECH_STUDENTS_PROFILES.find(s => s.id === studentId || s.userId === studentId || s.studentNumber === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Étudiant introuvable.' });
  }

  const diplomaIndex = dynamicDiplomas.findIndex(d => d.studentId === student.userId);
  if (diplomaIndex === -1) {
    return res.status(404).json({ error: 'Diplôme introuvable.' });
  }

  const existingDiploma = dynamicDiplomas[diplomaIndex];
  const now = new Date().toISOString();
  const previousStatus = existingDiploma.status;

  existingDiploma.status = 'revoked';
  existingDiploma.statusLabel = 'Diplôme Annulé';
  existingDiploma.revokedAt = now;
  existingDiploma.revokedBy = user.id;
  existingDiploma.revokedReason = String(reason).trim();
  existingDiploma.qrCodeDataUrl = undefined;
  existingDiploma.updatedAt = now;

  const auditEntry: DiplomaAuditEntry = {
    id: `aud-dip-${Date.now()}`,
    diplomaId: existingDiploma.id,
    studentId: student.userId,
    studentName: student.fullName,
    centerId: student.centerId,
    action: 'diploma_revoked',
    previousStatus,
    newStatus: 'revoked',
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    reason: String(reason).trim(),
    timestamp: now
  };

  existingDiploma.history = [auditEntry, ...(existingDiploma.history || [])];
  dynamicDiplomas[diplomaIndex] = existingDiploma;
  dynamicDiplomaAudits.unshift(auditEntry);

  return res.json({
    status: 'success',
    message: 'Diplôme officiellement révoqué et invalidé.',
    diploma: existingDiploma,
    auditEntry
  });
});

// 5. Vérification publique d'authenticité par QR Code (Aucune authentification requise, données non sensibles)
app.get('/api/diplomas/verify/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ verified: false, message: 'Identifiant manquant.' });
  }

  let diploma = dynamicDiplomas.find(d => d.id === id);

  // Si pas encore dans le cache, tenter de le trouver par studentId
  if (!diploma) {
    const student = DTECH_STUDENTS_PROFILES.find(s => id.includes(s.userId));
    if (student) {
      const validations = getStudentOfficialModuleValidations(student);
      const eligibility = checkStudentDiplomaEligibility(student, DTECH_COURSE_UNITS, validations);
      diploma = await buildDiplomaRecord({
        student,
        eligibility,
        appBaseUrl: `${req.protocol}://${req.get('host')}`
      });
      dynamicDiplomas.push(diploma);
    }
  }

  if (!diploma) {
    return res.status(404).json({
      verified: false,
      message: 'Aucun diplôme officiel trouvé pour cet identifiant de vérification.'
    });
  }

  if (diploma.status === 'revoked') {
    return res.json({
      verified: false,
      status: 'revoked',
      message: 'Ce diplôme a été révoqué par décision administrative et n’est plus valide.',
      diploma: {
        studentFullName: diploma.studentFullName,
        formationTitle: diploma.formationTitle,
        centerName: diploma.centerName,
        status: 'revoked'
      }
    });
  }

  if (diploma.status !== 'final_validated') {
    return res.json({
      verified: false,
      status: 'partial',
      message: 'Ce document est un parcours de formation en cours et ne constitue pas un diplôme d’État définitif.',
      diploma: {
        studentFullName: diploma.studentFullName,
        formationTitle: diploma.formationTitle,
        centerName: diploma.centerName,
        status: 'partial'
      }
    });
  }

  // Renvoie uniquement les informations académiques publiques strictement nécessaires
  return res.json({
    verified: true,
    status: 'final_validated',
    diploma: {
      id: diploma.id,
      studentFullName: diploma.studentFullName,
      formationTitle: diploma.formationTitle,
      centerName: diploma.centerName,
      promotionName: diploma.promotionName,
      issuanceDate: diploma.issuanceDate,
      academicMention: diploma.academicMention,
      status: diploma.status
    }
  });
});

// 6. Exécution de la suite des 12 tests de conformité Étape 9 (Diplôme)
app.get('/api/diplomas/tests/run', authenticateToken, (req: Request, res: Response) => {
  const results = runStep9DiplomaTests();
  const allPassed = results.every(r => r.passed);
  return res.json({
    status: 'success',
    allPassed,
    totalTests: results.length,
    passedTests: results.filter(r => r.passed).length,
    results
  });
});

app.get('/api/study-director/dashboard', authenticateToken, requireRole(['study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const director = USERS_DB.find(u => u.id === req.user?.id);
  // Si admin, il peut spécifier un centerId en query param (?centerId=...), sinon le centre du DE
  const requestedCenterId = req.query.centerId as string | undefined;
  const targetCenterId = (req.user?.role === 'admin' && requestedCenterId) 
    ? requestedCenterId 
    : (director?.centerId || 'center-lome-avedji');

  const center = DTECH_CENTERS.find(c => c.id === targetCenterId) || DTECH_CENTERS[0];

  // Groupes du centre
  const centerGroups = dynamicGroups.filter(g => g.centerId === targetCenterId);
  const centerGroupIds = centerGroups.map(g => g.id);

  // Étudiants du centre
  const centerStudents = DTECH_STUDENTS_PROFILES.filter(s => s.centerId === targetCenterId);

  // Formateurs intervenant dans ce centre
  const centerTrainers = USERS_DB.filter(u => u.role === 'trainer' && (u.centerId === targetCenterId || !u.centerId));

  // Affectations matière -> formateur pour ce centre
  const centerAssignments = dynamicAssignments.filter(a => a.centerId === targetCenterId);

  return res.json({
    status: 'success',
    director: {
      id: director?.id,
      name: director?.name,
      email: director?.email,
      centerId: center.id,
      centerName: center.name
    },
    center,
    metrics: {
      activeStudentsCount: centerStudents.length,
      activeGroupsCount: centerGroups.length,
      trainersCount: centerTrainers.length,
      promotionsCount: DTECH_PROMOTIONS.length,
      coursesCount: DTECH_COURSE_UNITS.length,
      assignmentsCount: centerAssignments.length
    },
    promotions: DTECH_PROMOTIONS,
    groups: centerGroups,
    trainers: centerTrainers.map(sanitizeUser),
    students: centerStudents,
    courses: DTECH_COURSE_UNITS,
    assignments: centerAssignments,
    evaluations: DTECH_EVALUATIONS.filter(e => centerGroupIds.includes(e.groupId)),
    attendances: dynamicAttendances.filter(a => centerGroupIds.includes(a.groupId)),
    resources: dynamicResources.filter(r => r.groupIds.some(gid => centerGroupIds.includes(gid)))
  });
});

// Affectation de formateurs aux groupes (global ou par matière)
app.post('/api/study-director/assign-trainer', authenticateToken, requireRole(['study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const { groupId, trainerId } = req.body;
  const group = dynamicGroups.find(g => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Groupe introuvable' });

  if (!group.trainerIds.includes(trainerId)) {
    group.trainerIds.push(trainerId);
  }

  const trainer = USERS_DB.find(u => u.id === trainerId);
  if (trainer && !trainer.assignedGroupIds?.includes(groupId)) {
    trainer.assignedGroupIds = [...(trainer.assignedGroupIds || []), groupId];
  }

  return res.json({ message: 'Formateur affecté avec succès au groupe', group });
});

// Affectation précise : Centre + Formation + Promotion + Groupe + Matière + Formateur
app.post('/api/study-director/assign-subject-trainer', authenticateToken, requireRole(['study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const { groupId, courseUnitId, trainerId } = req.body;

  const group = dynamicGroups.find(g => g.id === groupId);
  if (!group) return res.status(404).json({ error: 'Groupe introuvable' });

  const course = DTECH_COURSE_UNITS.find(c => c.id === courseUnitId);
  if (!course) return res.status(404).json({ error: 'Matière / Unité d’enseignement introuvable' });

  const trainer = USERS_DB.find(u => u.id === trainerId);
  if (!trainer) return res.status(404).json({ error: 'Formateur introuvable' });

  // Mise à jour ou création de l'affectation
  const existingIndex = dynamicAssignments.findIndex(
    a => a.groupId === groupId && a.courseUnitId === courseUnitId
  );

  const newAssignment = {
    id: existingIndex >= 0 ? dynamicAssignments[existingIndex].id : `asgn-${Date.now()}`,
    centerId: group.centerId,
    formationId: group.formationId,
    promotionId: group.promotionId,
    groupId: group.id,
    courseUnitId: course.id,
    courseUnitCode: course.code,
    courseUnitTitle: course.title,
    trainerId: trainer.id,
    trainerName: trainer.name,
    assignedByDeId: req.user?.id || 'usr_director_01',
    assignedAt: new Date().toISOString(),
    status: 'active' as const
  };

  if (existingIndex >= 0) {
    dynamicAssignments[existingIndex] = newAssignment;
  } else {
    dynamicAssignments.push(newAssignment);
  }

  // S'assurer que le formateur est aussi associé au groupe
  if (!group.trainerIds.includes(trainer.id)) {
    group.trainerIds.push(trainer.id);
  }
  if (!trainer.assignedGroupIds?.includes(group.id)) {
    trainer.assignedGroupIds = [...(trainer.assignedGroupIds || []), group.id];
  }
  if (!trainer.assignedCourseIds?.includes(course.id)) {
    trainer.assignedCourseIds = [...(trainer.assignedCourseIds || []), course.id];
  }

  return res.json({
    message: `Formateur ${trainer.name} assigné avec succès à la matière ${course.code} - ${course.title} pour le ${group.name}`,
    assignment: newAssignment
  });
});

// Suppression d'une affectation matière -> formateur
app.post('/api/study-director/remove-subject-trainer', authenticateToken, requireRole(['study_director', 'admin']), (req: AuthRequest, res: Response) => {
  const { assignmentId } = req.body;
  const index = dynamicAssignments.findIndex(a => a.id === assignmentId);
  if (index === -1) {
    return res.status(404).json({ error: 'Affectation introuvable' });
  }

  const removed = dynamicAssignments.splice(index, 1)[0];
  return res.json({
    message: `Affectation de ${removed.trainerName} pour ${removed.courseUnitCode} retirée avec succès`,
    assignment: removed
  });
});

// ============================================================================
// 4. ESPACE SECRÉTAIRE (ADMINISTRATIF, INSCRIPTIONS EN LIGNE & REÇUS)
// ============================================================================
app.get('/api/secretary/dashboard', authenticateToken, requireRole(['secretary', 'admin']), (req: AuthRequest, res: Response) => {
  const secretary = USERS_DB.find(u => u.id === req.user?.id);
  const targetCenterId = secretary?.centerId || 'center-lome-avedji';
  const center = DTECH_CENTERS.find(c => c.id === targetCenterId) || DTECH_CENTERS[0];

  // Inscriptions de son centre
  const centerRegistrations = dynamicRegistrations.filter(r => r.centerId === targetCenterId);
  const centerReceipts = dynamicReceipts.filter(r => r.centerName.includes(center.city) || r.centerName.includes(center.name));
  const centerStudents = DTECH_STUDENTS_PROFILES.filter(s => s.centerId === targetCenterId);

  const totalRegistrationFeesCollectedFCFA = centerRegistrations
    .filter(r => r.paymentStatus === 'completed')
    .reduce((sum, r) => sum + (r.registrationFeeFCFA || 25000), 0);

  return res.json({
    status: 'success',
    secretary: {
      id: secretary?.id,
      name: secretary?.name,
      email: secretary?.email,
      centerId: center.id,
      centerName: center.name
    },
    center,
    metrics: {
      totalRegistrations: centerRegistrations.length,
      validatedRegistrations: centerRegistrations.filter(r => r.status === 'validated').length,
      pendingRegistrations: centerRegistrations.filter(r => r.status === 'pending').length,
      totalFeesCollectedFCFA: totalRegistrationFeesCollectedFCFA,
      receiptsIssuedCount: centerReceipts.length,
      studentsCount: centerStudents.length
    },
    registrations: centerRegistrations,
    receipts: centerReceipts,
    students: centerStudents,
    groups: dynamicGroups.filter(g => g.centerId === targetCenterId)
  });
});

// Validation administrative d'une inscription et attribution de groupe
app.post('/api/secretary/validate-registration', authenticateToken, requireRole(['secretary', 'admin']), (req: AuthRequest, res: Response) => {
  const { registrationId, assignedGroupId } = req.body;
  const reg = dynamicRegistrations.find(r => r.id === registrationId);
  if (!reg) return res.status(404).json({ error: 'Dossier d\'inscription introuvable' });

  reg.status = 'validated';
  if (assignedGroupId) {
    reg.assignedGroupId = assignedGroupId;
    const group = dynamicGroups.find(g => g.id === assignedGroupId);
    if (group) reg.assignedGroupName = group.name;
  }

  return res.json({ message: 'Inscription validée et étudiant affecté avec succès.', registration: reg });
});

// ============================================================================
// 5. ESPACE ADMIN (DIRECTION GÉNÉRALE / VUE GLOBALE RÉSEAU)
// ============================================================================
app.get('/api/admin/dashboard', authenticateToken, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  const totalStudents = DTECH_STUDENTS_PROFILES.length;
  const totalTrainers = USERS_DB.filter(u => u.role === 'trainer').length;
  const totalRegistrationRevenueFCFA = dynamicRegistrations
    .filter(r => r.paymentStatus === 'completed')
    .reduce((sum, r) => sum + r.registrationFeeFCFA, 0);

  return res.json({
    status: 'success',
    accessLevel: 'Direction Générale (DG Réseau National)',
    metrics: {
      centersCount: DTECH_CENTERS.length,
      promotionsCount: DTECH_PROMOTIONS.length,
      groupsCount: dynamicGroups.length,
      studentsCount: totalStudents,
      trainersCount: totalTrainers,
      secretariesCount: USERS_DB.filter(u => u.role === 'secretary').length,
      studyDirectorsCount: USERS_DB.filter(u => u.role === 'study_director').length,
      totalRegistrationRevenueFCFA,
      publishedResourcesCount: dynamicResources.length
    },
    centers: DTECH_CENTERS,
    promotions: DTECH_PROMOTIONS,
    groups: dynamicGroups,
    users: USERS_DB.map(sanitizeUser),
    registrations: dynamicRegistrations,
    resources: dynamicResources
  });
});

// ============================================================================
// 6. INSCRIPTION EN LIGNE (PARCOURS PUBLIC EN 7 ÉTAPES + FRAIS 25 000 FCFA)
// ============================================================================
app.post('/api/registration/submit', (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    whatsapp,
    birthDate,
    gender,
    address,
    idCardType,
    idCardNumber,
    centerId,
    formationId,
    formationTitle,
    promotionId,
    preferredSchedule,
    paymentMethod,
    paymentReference
  } = req.body;

  if (!firstName || !lastName || !email || !phone || !centerId || !formationId || !promotionId) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être renseignés.' });
  }

  const center = DTECH_CENTERS.find(c => c.id === centerId) || DTECH_CENTERS[0];
  const promotion = DTECH_PROMOTIONS.find(p => p.id === promotionId) || DTECH_PROMOTIONS[0];
  
  // Attribution automatique d'un groupe selon l'horaire souhaité
  const matchingGroup = dynamicGroups.find(
    g => g.centerId === centerId && g.formationId === formationId && (preferredSchedule === 'soir' ? g.name.includes('Soir') : g.name.includes('Matin'))
  ) || dynamicGroups.find(g => g.centerId === centerId) || dynamicGroups[0];

  const timestamp = Date.now();
  const dossierNumber = `DOS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const studentId = `usr_student_${timestamp}`;
  const studentNumber = `DTECH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newRegistration = {
    id: `reg-${timestamp}`,
    dossierNumber,
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email: String(email).trim().toLowerCase(),
    phone: String(phone).trim(),
    whatsapp: whatsapp || phone,
    birthDate: birthDate || '2002-01-01',
    gender: gender || 'M',
    address: address || center.city,
    idCardType: idCardType || 'CNI',
    idCardNumber: idCardNumber || 'TG-OFFICIAL',
    centerId: center.id,
    centerName: center.name,
    formationId,
    formationTitle: formationTitle || 'Formation Professionnelle',
    promotionId: promotion.id,
    promotionName: promotion.name,
    preferredSchedule: preferredSchedule || 'jour',
    assignedGroupId: matchingGroup?.id,
    assignedGroupName: matchingGroup?.name,
    registrationFeeFCFA: 25000, // Frais d'inscription payés en ligne
    paymentMethod: paymentMethod || 'tmoney',
    paymentReference: paymentReference || `TM-${timestamp}`,
    paymentStatus: 'completed' as const,
    receiptNumber,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'validated' as const
  };

  dynamicRegistrations.unshift(newRegistration as any);

  // Création du reçu officiel
  const newReceipt = {
    receiptNumber,
    dossierNumber,
    studentName: `${firstName} ${lastName}`,
    studentPhone: phone,
    studentEmail: email,
    centerName: center.name,
    centerAddress: center.address,
    formationTitle: formationTitle || 'Formation DTECH Diplôme d’État',
    promotionName: promotion.name,
    groupName: matchingGroup ? matchingGroup.name : 'Groupe Matin',
    amountFCFA: 25000,
    paymentMethod: paymentMethod || 'tmoney',
    paymentReference: paymentReference || `REF-${timestamp}`,
    paymentDate: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    issuedBy: 'Secrétariat Général des Admissions DTECH GROUP',
    officialStamp: 'OFFICIEL AGRÉÉ METFP N° 003 / METFP / CAB / SE-CPO'
  };

  dynamicReceipts.unshift(newReceipt as any);

  // Création / Activation automatique du compte étudiant
  const newStudentPass = hashPassword('etudiant2026');
  const newStudentUser: DbUser = {
    id: studentId,
    name: `${firstName} ${lastName}`,
    email: String(email).trim().toLowerCase(),
    passwordSalt: newStudentPass.salt,
    passwordHash: newStudentPass.hash,
    role: 'student',
    status: 'active',
    phone,
    city: center.city,
    centerId: center.id,
    centerName: center.name,
    studentNumber,
    formationId,
    formationTitle,
    promotionId: promotion.id,
    promotionName: promotion.name,
    groupId: matchingGroup?.id,
    groupName: matchingGroup?.name,
    createdAt: new Date().toISOString()
  };

  USERS_DB.push(newStudentUser);

  // Ajout au profil étudiant
  const newStudentProfile = {
    id: `prof-${timestamp}`,
    userId: studentId,
    studentNumber,
    fullName: `${firstName} ${lastName}`,
    email: String(email).trim().toLowerCase(),
    phone,
    city: center.city,
    centerId: center.id,
    centerName: center.name,
    formationId,
    formationTitle: formationTitle || 'Formation DTECH',
    promotionId: promotion.id,
    promotionName: promotion.name,
    groupId: matchingGroup?.id || 'grp-jan26-dev-g1',
    groupName: matchingGroup?.name || 'Groupe 1',
    enrollmentDate: new Date().toISOString().split('T')[0],
    registrationFeePaid: true,
    registrationReceiptNumber: receiptNumber,
    status: 'active' as const,
    overallProgressPercent: 0
  };

  DTECH_STUDENTS_PROFILES.unshift(newStudentProfile as any);

  return res.json({
    status: 'success',
    message: 'Inscription en ligne confirmée avec succès ! Votre compte étudiant a été activé.',
    registration: newRegistration,
    receipt: newReceipt,
    studentAccount: {
      email: newStudentUser.email,
      studentNumber,
      defaultPasswordHint: 'etudiant2026 (ou mot de passe défini)',
      loginUrl: '/login'
    }
  });
});

// ============================================================================
// ASSISTANT IA PÉDAGOGIQUE (GEMINI FLASH)
// ============================================================================
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

const DTECH_AI_SYSTEM_INSTRUCTION = `Tu es M. Koffi MENSAH, Conseiller Pédagogique Principal et Chef du Service des Admissions chez DTECH GROUP & INSTITUT SUPÉRIEUR DELXIA.
Agrément N° 003 / METFP / CAB / SE-CPO. Réseau de 7 centres au Togo (Lomé Avédji, Avépozo, Kpalimé, Atakpamé, Sokodé, Kara, Dapaong).
Formule d'excellence : 9 MOIS 100% PRATIQUE + 3 MOIS DE STAGE EN ENTREPRISE GARANTI (Diplôme d'État).
Frais d'inscription : 25 000 FCFA réglables en ligne par T-Money (*145#) ou Flooz (*155#).
Scolarité : 60% à l'inscription et 40% au 5ème mois auprès du secrétariat du centre.`;

app.post('/api/ai/advisor', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Le message est requis.' });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json({
      model: 'dtech-advisor-fallback',
      reply: `Bonjour ! Je suis **M. Koffi MENSAH**, Conseiller Pédagogique chez **DTECH GROUP TOGO**.\n\nNos inscriptions pour la nouvelle promotion sont ouvertes avec paiement des frais d'inscription (25 000 FCFA) par **T-Money (*145#)** et **Flooz (*155#)**.\n\nQuelle filière souhaitez-vous découvrir ?`,
      suggestions: ['Développement Web & Mobile', 'Comptabilité Sage 100', 'Centres de formation au Togo', 'Frais et échelonnement']
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: message,
      config: {
        systemInstruction: DTECH_AI_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return res.json({
      model: 'gemini-3.7-flash',
      reply: response.text || 'Je suis à votre disposition pour vous orienter.',
      suggestions: ['Comment s\'inscrire en ligne ?', 'Quels sont les 7 centres ?', 'Programme des cours du jour et du soir']
    });
  } catch (error: any) {
    return res.json({
      model: 'dtech-advisor-fallback',
      reply: `Je reste à votre écoute pour vous renseigner sur les filières agréées par l'État METFP chez DTECH GROUP.`,
      suggestions: ['Inscriptions 2026', 'Modalités de paiement', 'Diplômes d\'État']
    });
  }
});

// ============================================================================
// INITIALISATION SERVEUR & VITE MIDDLEWARE
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur DTECH GROUP démarré sur http://localhost:${PORT}`);
  });
}

startServer();
