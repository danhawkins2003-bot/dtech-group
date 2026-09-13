import {
  StudentProfile,
  CourseUnit,
  Exercise,
  ExerciseAttempt,
  Quiz,
  QuizSubmission,
  EvaluationAttempt,
  ModuleValidationRecord,
  ModuleValidationStatus,
  ModuleValidationAuditEntry,
  Step8ModuleValidationTestResult,
  AuthUser
} from '../types';
import { calculateModuleEvaluation } from './moduleEvaluationEngine';
import {
  normalizeExerciseAttemptToEvaluationAttempt,
  normalizeQuizSubmissionToEvaluationAttempt,
  calculateAttemptSummary
} from './evaluationAttemptsEngine';

/**
 * MOTEUR OFFICIEL DE VALIDATION DES MODULES — ÉTAPE 8
 * 
 * RÈGLES PÉDAGOGIQUES OFFICIELLES DTECH GROUP :
 * 1. Note finale = (Exercices/TP × 60%) + (Quiz × 40%)
 * 2. Seuls les résultats OFFICIELS publiés sont pris en compte (trainerValidation === true && status === 'published')
 * 3. Règle des tentatives : BEST SCORE retenu (resultatRetenu = bestScore). latestScore reste conservé pour l'historique.
 * 4. Validation :
 *    - Note finale >= 10.00/20 => status = 'validated' ("Module validé")
 *    - Note finale < 10.00/20  => status = 'not_validated' ("Module non validé")
 *    - Seuil : 10.00 inclus (10 = validé, 9.99 = non validé)
 * 5. Évaluations manquantes :
 *    - Si toutes les évaluations obligatoires ne disposent pas d'un résultat officiel publié :
 *      status = 'pending_evaluations' ("Évaluations en attente")
 *      finalScore = undefined (JAMAIS calculé arbitrairement à 0)
 * 6. Ne déclenche AUCUNE génération de diplôme (réservé à l'Étape 9).
 */

export interface CalculateModuleValidationParams {
  student: StudentProfile;
  courseUnit: CourseUnit;
  module: { id: string; title: string; order?: number };
  exercises: Exercise[];
  exerciseAttempts: ExerciseAttempt[];
  quizzes?: Quiz[];
  quizSubmissions?: QuizSubmission[];
  allUnifiedAttempts?: EvaluationAttempt[];
  existingRecord?: ModuleValidationRecord;
}

export function computeModuleValidationRecord(
  params: CalculateModuleValidationParams
): ModuleValidationRecord {
  const {
    student,
    courseUnit,
    module,
    exercises,
    exerciseAttempts,
    quizzes = [],
    quizSubmissions = [],
    allUnifiedAttempts = [],
    existingRecord
  } = params;

  // Réutilisation directe du moteur de l'Étape 6 avec l'option attemptSelectionRule: 'best'
  const summary = calculateModuleEvaluation(
    courseUnit,
    module,
    student,
    exercises,
    exerciseAttempts,
    {
      attemptSelectionRule: 'best',
      quizzes,
      quizSubmissions
    }
  );

  // Recherche des tentatives unifiées pour extraire les latestScore
  const studentTargetId = student.userId || student.id;
  const relevantUnified = allUnifiedAttempts.filter(
    a => (a.studentId === studentTargetId || a.studentNumber === student.studentNumber) &&
         (a.moduleId === module.id || a.courseUnitId === courseUnit.id)
  );

  let latestExerciseScore: number | undefined = undefined;
  let latestQuizScore: number | undefined = undefined;

  if (relevantUnified.length > 0) {
    const publishedEx = relevantUnified.filter(a => a.evaluationType === 'exercise' && a.trainerValidation && a.status === 'published');
    if (publishedEx.length > 0) {
      const sortedEx = [...publishedEx].sort((a, b) => new Date(b.validatedAt || b.createdAt).getTime() - new Date(a.validatedAt || a.createdAt).getTime());
      latestExerciseScore = sortedEx[0].officialScore;
    }

    const publishedQz = relevantUnified.filter(a => a.evaluationType === 'quiz' && a.trainerValidation && a.status === 'published');
    if (publishedQz.length > 0) {
      const sortedQz = [...publishedQz].sort((a, b) => new Date(b.validatedAt || b.createdAt).getTime() - new Date(a.validatedAt || a.createdAt).getTime());
      latestQuizScore = sortedQz[0].officialScore;
    }
  }

  // Détermination stricte du statut de validation
  let status: ModuleValidationStatus = 'pending_evaluations';
  let statusLabel: 'Module validé' | 'Module non validé' | 'Évaluations en attente' = 'Évaluations en attente';
  let validatedAt: string | undefined = undefined;
  let validatedBy: string | undefined = undefined;
  let finalScore: number | undefined = undefined;

  // RÈGLE : Si toutes les évaluations obligatoires ne disposent pas d'un résultat officiel publié,
  // status = 'pending_evaluations' et NE PAS calculer de note finale définitive (jamais de zéro pour une note manquante)
  if (summary.isCalculationReady && summary.moduleScore20 !== null && summary.evaluationsRemainingCount === 0) {
    finalScore = summary.moduleScore20;
    if (finalScore >= 10.00) {
      status = 'validated';
      statusLabel = 'Module validé';
      validatedAt = existingRecord?.validatedAt || new Date().toISOString();
      validatedBy = existingRecord?.validatedBy || 'Commission Pédagogique DTech';
    } else {
      status = 'not_validated';
      statusLabel = 'Module non validé';
      validatedAt = existingRecord?.validatedAt || new Date().toISOString();
      validatedBy = existingRecord?.validatedBy || 'Commission Pédagogique DTech';
    }
  } else {
    status = 'pending_evaluations';
    statusLabel = 'Évaluations en attente';
    finalScore = undefined; // Ne pas fixer de note finale tant que des évaluations manquent
  }

  const now = new Date().toISOString();
  const recordId = existingRecord?.id || `modval-${student.userId}-${module.id}`;

  const history = existingRecord ? [...existingRecord.history] : [];
  if (existingRecord && (existingRecord.status !== status || existingRecord.finalScore !== finalScore)) {
    history.push({
      id: `mvh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action: status === 'validated' ? 'status_validated' : (status === 'not_validated' ? 'status_unvalidated' : 'initial_calculation'),
      previousStatus: existingRecord.status,
      newStatus: status,
      previousScore: existingRecord.finalScore,
      newScore: finalScore,
      userId: 'system_engine',
      userName: 'Moteur Officiel Étape 8',
      timestamp: now
    });
  }

  return {
    id: recordId,
    moduleId: module.id,
    moduleTitle: module.title,
    moduleOrder: module.order,
    courseUnitId: courseUnit.id,
    courseUnitCode: courseUnit.code,
    courseUnitTitle: courseUnit.title,
    studentId: student.userId || student.id,
    studentName: student.fullName,
    studentNumber: student.studentNumber,
    centerId: student.centerId,
    centerName: student.centerName,
    formationId: student.formationId,
    formationTitle: student.formationTitle,
    promotionId: student.promotionId,
    promotionName: student.promotionName,
    groupId: student.groupId,
    groupName: student.groupName,

    exerciseScore: summary.exercisesAverage20 ?? undefined,
    quizScore: summary.quizzesAverage20 ?? undefined,
    finalScore,

    exerciseLatestScore: latestExerciseScore ?? (summary.exercisesAverage20 ?? undefined),
    quizLatestScore: latestQuizScore ?? (summary.quizzesAverage20 ?? undefined),

    status,
    statusLabel,
    validatedAt,
    validatedBy,
    resultSource: 'official_evaluation_engine',

    history,
    createdAt: existingRecord?.createdAt || now,
    updatedAt: now
  };
}

export interface ComputeAllModuleValidationsOptions {
  student: StudentProfile;
  courses: CourseUnit[];
  exercises: Exercise[];
  exerciseAttempts: ExerciseAttempt[];
  quizzes?: Quiz[];
  quizSubmissions?: QuizSubmission[];
  allUnifiedAttempts?: EvaluationAttempt[];
  existingRecords?: ModuleValidationRecord[];
}

/**
 * Calculateur de validation pour l'ensemble des modules du parcours d'un étudiant
 */
export function computeAllModuleValidationsForStudent(
  studentOrOptions: StudentProfile | ComputeAllModuleValidationsOptions,
  courses?: CourseUnit[],
  exercises?: Exercise[],
  exerciseAttempts?: ExerciseAttempt[],
  quizzes: Quiz[] = [],
  quizSubmissions: QuizSubmission[] = [],
  allUnifiedAttempts: EvaluationAttempt[] = [],
  existingRecords: ModuleValidationRecord[] = []
): ModuleValidationRecord[] {
  let student: StudentProfile;
  let finalCourses: CourseUnit[];
  let finalExercises: Exercise[];
  let finalAttempts: ExerciseAttempt[];
  let finalQuizzes: Quiz[] = quizzes;
  let finalQuizSubs: QuizSubmission[] = quizSubmissions;
  let finalUnified: EvaluationAttempt[] = allUnifiedAttempts;
  let finalExisting: ModuleValidationRecord[] = existingRecords;

  if ('student' in studentOrOptions) {
    const opts = studentOrOptions as ComputeAllModuleValidationsOptions;
    student = opts.student;
    finalCourses = opts.courses;
    finalExercises = opts.exercises;
    finalAttempts = opts.exerciseAttempts;
    finalQuizzes = opts.quizzes || [];
    finalQuizSubs = opts.quizSubmissions || [];
    finalUnified = opts.allUnifiedAttempts || [];
    finalExisting = opts.existingRecords || [];
  } else {
    student = studentOrOptions;
    finalCourses = courses || [];
    finalExercises = exercises || [];
    finalAttempts = exerciseAttempts || [];
  }

  const records: ModuleValidationRecord[] = [];

  // Filtrer les cours de la filière de l'étudiant
  const relevantCourses = finalCourses.filter(
    c => c.formationId === 'common' || c.formationId === student.formationId
  );

  let orderIndex = 1;
  for (const course of relevantCourses) {
    const modules = (course.modules && course.modules.length > 0)
      ? course.modules
      : [{ id: `${course.id}-m1`, title: course.title, orderIndex: 1 }];

    for (const mod of modules) {
      const existing = finalExisting.find(
        r => r.studentId === student.userId && (r.moduleId === mod.id || r.courseUnitId === course.id)
      );

      const record = computeModuleValidationRecord({
        student,
        courseUnit: course,
        module: { id: mod.id, title: mod.title, order: mod.orderIndex || orderIndex },
        exercises: finalExercises,
        exerciseAttempts: finalAttempts,
        quizzes: finalQuizzes,
        quizSubmissions: finalQuizSubs,
        allUnifiedAttempts: finalUnified,
        existingRecord: existing
      });

      records.push(record);
      orderIndex++;
    }
  }

  return records;
}

/**
 * Création d'une trace d'audit officielle lors d'une validation ou révision de module
 */
export function createModuleValidationAuditEntry(
  params: {
    studentId: string;
    studentName?: string;
    moduleId: string;
    moduleTitle?: string;
    centerId: string;
    previousStatus?: ModuleValidationStatus;
    newStatus: ModuleValidationStatus;
    previousScore?: number;
    newScore?: number;
    user: AuthUser;
    action?: 'module_evaluated' | 'module_validated' | 'module_not_validated' | 'module_score_revised';
    reason?: string;
  }
): ModuleValidationAuditEntry {
  const {
    studentId,
    studentName,
    moduleId,
    moduleTitle,
    centerId,
    previousStatus,
    newStatus,
    previousScore,
    newScore,
    user,
    action = newStatus === 'validated' ? 'module_validated' : 'module_not_validated',
    reason
  } = params;

  return {
    id: `aud-modval-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    studentId,
    studentName,
    moduleId,
    moduleTitle,
    centerId,
    previousStatus,
    newStatus,
    previousScore,
    newScore,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    reason: reason || 'Validation officielle issue du calcul pondéré 60/40',
    timestamp: new Date().toISOString()
  };
}

/**
 * CONTRÔLE D'ACCÈS STRICT PAR RÔLE ET CENTRE (RBAC DTECH TOGO)
 */
export function canUserViewStudentModuleValidations(
  user: AuthUser,
  studentCenterId: string,
  targetStudentUserId: string
): boolean {
  // DG / Admin général : accès complet à tous les 7 centres officiels
  if (user.role === 'admin') {
    return true;
  }

  // Étudiant : accès strictement limité à son propre compte
  if (user.role === 'student') {
    return user.id === targetStudentUserId;
  }

  // DE / Directeur des Études : accès limité à son propre centre
  if (user.role === 'study_director') {
    return !user.centerId || user.centerId === 'all' || user.centerId === studentCenterId;
  }

  // Formateur : accès limité à son centre d'intervention
  if (user.role === 'trainer') {
    return !user.centerId || user.centerId === 'all' || user.centerId === studentCenterId;
  }

  return false;
}

// ============================================================================
// SUITE DES 12 TESTS OBLIGATOIRES ÉTAPE 8
// ============================================================================

export function runStep8ModuleValidationTests(): Step8ModuleValidationTestResult[] {
  const tests: Step8ModuleValidationTestResult[] = [];

  // Données de base pour les tests
  const dummyStudentLome: StudentProfile = {
    id: 'stu-t8-lome',
    userId: 'usr_student_01',
    studentNumber: 'DTECH-2026-0104',
    fullName: 'Koffi Mawuli AGBEGNINOU',
    email: 'koffi.agbegninou@dtech.tg',
    phone: '+228 90 00 00 01',
    city: 'Lomé',
    centerId: 'center-lome-avedji',
    centerName: 'Lomé Avédji (Siège Pédagogique)',
    formationId: 'c9-dev-web',
    formationTitle: 'DÉVELOPPEMENT WEB FULL-STACK & MOBILE',
    promotionId: 'promo-jan-2026',
    promotionName: 'Promotion Janvier 2026',
    groupId: 'grp-jan26-dev-g1',
    groupName: 'Groupe 1 — Matin',
    enrollmentDate: '2026-01-15',
    registrationFeePaid: true,
    registrationReceiptNumber: 'REC-2026-001',
    status: 'active',
    overallProgressPercent: 75
  };

  const dummyStudentKara: StudentProfile = {
    id: 'stu-t8-kara',
    userId: 'usr_student_02',
    studentNumber: 'DTECH-2026-0210',
    fullName: 'Akossiwa Bernadette KPONVI',
    email: 'akossiwa.kponvi@dtech.tg',
    phone: '+228 90 00 00 02',
    city: 'Kara',
    centerId: 'center-kara',
    centerName: 'Centre de Kara',
    formationId: 'c9-dev-web',
    formationTitle: 'DÉVELOPPEMENT WEB FULL-STACK & MOBILE',
    promotionId: 'promo-jan-2026',
    promotionName: 'Promotion Janvier 2026',
    groupId: 'grp-jan26-dev-g1',
    groupName: 'Groupe 1 — Matin',
    enrollmentDate: '2026-01-15',
    registrationFeePaid: true,
    registrationReceiptNumber: 'REC-2026-002',
    status: 'active',
    overallProgressPercent: 70
  };

  const dummyCourse: CourseUnit = {
    id: 'UE-INF-101',
    code: 'INF-101',
    title: 'Algorithmique & Programmation Web',
    formationId: 'c9-dev-web',
    phase: 'common_core',
    phaseTitle: 'Tronc Commun',
    hours: 60,
    description: 'Algorithmique et Programmation Web',
    modules: [
      { id: 'mod-algo', title: 'Algorithmique Fondamentale', orderIndex: 1 }
    ]
  };

  const dummyModule = { id: 'mod-algo', title: 'Algorithmique Fondamentale', order: 1 };

  const makeEx = (data: Partial<Exercise> & { id: string; title: string; type: 'exercise' | 'quiz'; centerId: string; groupId: string }): Exercise => ({
    description: 'Description test',
    instructions: 'Consignes test',
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-01-20T08:00:00.000Z',
    courseUnitId: 'UE-INF-101',
    moduleId: 'mod-algo',
    trainerId: 'usr_trainer_01',
    totalPoints: 20,
    status: 'published',
    questions: [],
    ...data
  });

  const makeAtt = (data: Partial<ExerciseAttempt> & { id: string; exerciseId: string; studentId: string; centerId: string; groupId: string; officialScore20?: number }): ExerciseAttempt => ({
    startedAt: '2026-01-22T09:00:00.000Z',
    submittedAt: '2026-01-22T10:00:00.000Z',
    attemptNumber: 1,
    isValidated: true,
    trainerValidation: true,
    status: 'published',
    maxPoints: 20,
    answers: [],
    publishedAt: '2026-01-23T10:00:00.000Z',
    ...data
  });

  // TEST 1 : Module avec toutes les évaluations officielles → calcul correct (60% ex + 40% quiz)
  // Exercice officiel = 14/20, Quiz officiel = 16/20 => (14 * 0.6) + (16 * 0.4) = 8.4 + 6.4 = 14.80/20
  const ex1: Exercise[] = [
    makeEx({ id: 'ex-t1', title: 'TP Algorithmique', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', type: 'exercise' }),
    makeEx({ id: 'qz-t1', title: 'Quiz Algorithmique', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', type: 'quiz' })
  ];

  const att1: ExerciseAttempt[] = [
    makeAtt({ id: 'att-ex-t1', exerciseId: 'ex-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 14.0 }),
    makeAtt({ id: 'att-qz-t1', exerciseId: 'qz-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 16.0 })
  ];

  const res1 = computeModuleValidationRecord({
    student: dummyStudentLome,
    courseUnit: dummyCourse,
    module: dummyModule,
    exercises: ex1,
    exerciseAttempts: att1
  });

  tests.push({
    id: 'test-1',
    testNumber: 1,
    name: 'Module avec toutes les évaluations officielles',
    description: 'Vérifie que la formule 60% Exercices + 40% Quiz s’applique avec exactitude lorsque toutes les évaluations sont publiées.',
    passed: res1.finalScore === 14.80 && res1.status === 'validated' && res1.exerciseScore === 14.0 && res1.quizScore === 16.0,
    details: `Note finale calculée : ${res1.finalScore ?? 'N/A'}/20 (Attendu: 14.80). Statut : ${res1.status}.`
  });

  // TEST 2 : Une évaluation non publiée → module en attente, jamais 0
  // Exercice officiel = 15/20, Quiz soumis mais non validé (trainerValidation === false)
  const att2: ExerciseAttempt[] = [
    makeAtt({ id: 'att-ex-t2', exerciseId: 'ex-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 15.0 }),
    makeAtt({
      id: 'att-qz-t2',
      exerciseId: 'qz-t1',
      studentId: 'usr_student_01',
      centerId: 'center-lome-avedji',
      groupId: 'grp-jan26-dev-g1',
      status: 'submitted',
      trainerValidation: false,
      isValidated: false,
      officialScore20: undefined,
      publishedAt: undefined
    })
  ];

  const res2 = computeModuleValidationRecord({
    student: dummyStudentLome,
    courseUnit: dummyCourse,
    module: dummyModule,
    exercises: ex1,
    exerciseAttempts: att2
  });

  tests.push({
    id: 'test-2',
    testNumber: 2,
    name: 'Évaluation non publiée → module en attente, jamais 0',
    description: 'Une évaluation en cours de correction ne doit jamais être transformée en zéro ni entraîner un échec prématuré.',
    passed: res2.status === 'pending_evaluations' && res2.finalScore === undefined && res2.quizScore === undefined,
    details: `Statut : ${res2.status} ("${res2.statusLabel}"), Note finale : ${res2.finalScore ?? 'Non calculée (attente)'}.`
  });

  // TEST 3 : Note finale = 10/20 → module validé (seuil inclus)
  // Exercice = 10/20, Quiz = 10/20 => final = (10*0.6) + (10*0.4) = 10.00 / 20
  const att3: ExerciseAttempt[] = [
    makeAtt({ id: 'att-ex-t3', exerciseId: 'ex-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 10.0 }),
    makeAtt({ id: 'att-qz-t3', exerciseId: 'qz-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 10.0 })
  ];

  const res3 = computeModuleValidationRecord({
    student: dummyStudentLome,
    courseUnit: dummyCourse,
    module: dummyModule,
    exercises: ex1,
    exerciseAttempts: att3
  });

  tests.push({
    id: 'test-3',
    testNumber: 3,
    name: 'Note finale = 10.00/20 → module validé',
    description: 'La valeur seuil 10/20 est strictement incluse : un module à 10.00/20 est officiellement validé.',
    passed: res3.finalScore === 10.00 && res3.status === 'validated' && res3.statusLabel === 'Module validé',
    details: `Note finale : ${res3.finalScore}/20, Statut : ${res3.statusLabel}.`
  });

  // TEST 4 : Note finale = 9.99/20 → module non validé
  // Exercice = 9.99/20, Quiz = 9.99/20 => final = 9.99 / 20
  const att4: ExerciseAttempt[] = [
    makeAtt({ id: 'att-ex-t4', exerciseId: 'ex-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 9.99 }),
    makeAtt({ id: 'att-qz-t4', exerciseId: 'qz-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 9.99 })
  ];

  const res4 = computeModuleValidationRecord({
    student: dummyStudentLome,
    courseUnit: dummyCourse,
    module: dummyModule,
    exercises: ex1,
    exerciseAttempts: att4
  });

  tests.push({
    id: 'test-4',
    testNumber: 4,
    name: 'Note finale = 9.99/20 → module non validé',
    description: 'Une note inférieure à 10.00 (ex: 9.99/20) entraîne le statut non validé sans complaisance.',
    passed: res4.finalScore === 9.99 && res4.status === 'not_validated' && res4.statusLabel === 'Module non validé',
    details: `Note finale : ${res4.finalScore}/20, Statut : ${res4.statusLabel}.`
  });

  // TEST 5 : Tentative 1 = 8, tentative 2 = 13 → bestScore 13 utilisé
  // Exercice att1 = 8, att2 = 13. Quiz = 10.
  // Best score exercice = 13. Quiz = 10. => Final = (13*0.6) + (10*0.4) = 7.8 + 4.0 = 11.80/20
  const att5: ExerciseAttempt[] = [
    makeAtt({ id: 'att-ex-t5-1', exerciseId: 'ex-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', attemptNumber: 1, officialScore20: 8.0 }),
    makeAtt({ id: 'att-ex-t5-2', exerciseId: 'ex-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', attemptNumber: 2, officialScore20: 13.0 }),
    makeAtt({ id: 'att-qz-t5', exerciseId: 'qz-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 10.0 })
  ];

  const res5 = computeModuleValidationRecord({
    student: dummyStudentLome,
    courseUnit: dummyCourse,
    module: dummyModule,
    exercises: ex1,
    exerciseAttempts: att5
  });

  tests.push({
    id: 'test-5',
    testNumber: 5,
    name: 'Tentative 1 = 8, Tentative 2 = 13 → bestScore 13 utilisé',
    description: 'Lorsque la seconde tentative est supérieure, le Best Score (13/20) est retenu pour le calcul du module.',
    passed: res5.exerciseScore === 13.0 && res5.finalScore === 11.80 && res5.status === 'validated',
    details: `Note exercice retenue : ${res5.exerciseScore}/20 (Attendu: 13.0), Note finale : ${res5.finalScore}/20.`
  });

  // TEST 6 : Tentative 1 = 14, tentative 2 = 11 → bestScore 14 utilisé
  // Exercice att1 = 14, att2 = 11. Quiz = 10.
  // Best score exercice = 14. Quiz = 10. => Final = (14*0.6) + (10*0.4) = 8.4 + 4.0 = 12.40/20
  const att6: ExerciseAttempt[] = [
    makeAtt({ id: 'att-ex-t6-1', exerciseId: 'ex-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', attemptNumber: 1, officialScore20: 14.0 }),
    makeAtt({ id: 'att-ex-t6-2', exerciseId: 'ex-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', attemptNumber: 2, officialScore20: 11.0 }),
    makeAtt({ id: 'att-qz-t6', exerciseId: 'qz-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 10.0 })
  ];

  const res6 = computeModuleValidationRecord({
    student: dummyStudentLome,
    courseUnit: dummyCourse,
    module: dummyModule,
    exercises: ex1,
    exerciseAttempts: att6
  });

  tests.push({
    id: 'test-6',
    testNumber: 6,
    name: 'Tentative 1 = 14, Tentative 2 = 11 → bestScore 14 utilisé',
    description: 'Lorsque la seconde tentative est inférieure, le Best Score initial (14/20) reste conservé pour protéger l’étudiant.',
    passed: res6.exerciseScore === 14.0 && res6.finalScore === 12.40 && res6.status === 'validated',
    details: `Note exercice retenue : ${res6.exerciseScore}/20 (Attendu: 14.0), Note finale : ${res6.finalScore}/20.`
  });

  // TEST 7 : latestScore reste conservé même lorsque bestScore est utilisé
  // Pour att6 : bestScore = 14, latestScore = 11.
  const unifiedAtt6 = att6.map(normalizeExerciseAttemptToEvaluationAttempt);
  const res7 = computeModuleValidationRecord({
    student: dummyStudentLome,
    courseUnit: dummyCourse,
    module: dummyModule,
    exercises: ex1,
    exerciseAttempts: att6,
    allUnifiedAttempts: unifiedAtt6
  });

  tests.push({
    id: 'test-7',
    testNumber: 7,
    name: 'latestScore reste conservé même avec bestScore actif',
    description: 'Vérifie que la dernière tentative (11/20) reste consignée dans les métadonnées sans écraser le Best Score (14/20).',
    passed: res7.exerciseScore === 14.0 && res7.exerciseLatestScore === 11.0,
    details: `Best score retenu : ${res7.exerciseScore}/20, Latest score conservé : ${res7.exerciseLatestScore}/20.`
  });

  // TEST 8 : Une révision de note conserve l'ancien résultat dans l'audit
  const mockAuditUser: AuthUser = {
    id: 'trainer-01',
    name: 'M. Mensah',
    email: 'mensah@dtech.tg',
    role: 'trainer',
    centerId: 'center-lome-avedji',
    status: 'active',
    createdAt: '2026-01-01'
  };

  const auditEntry = createModuleValidationAuditEntry({
    studentId: 'usr_student_01',
    studentName: 'Koffi Mawuli AGBEGNINOU',
    moduleId: 'mod-algo',
    moduleTitle: 'Algorithmique Fondamentale',
    centerId: 'center-lome-avedji',
    previousStatus: 'not_validated',
    newStatus: 'validated',
    previousScore: 9.5,
    newScore: 12.0,
    user: mockAuditUser,
    action: 'module_score_revised',
    reason: 'Réévaluation d’une question suite à réclamation pédagogique'
  });

  tests.push({
    id: 'test-8',
    testNumber: 8,
    name: 'Une révision de note conserve l’ancien résultat dans l’audit',
    description: 'La trace d’audit immuable conserve l’ancienne note (9.5), la nouvelle (12.0), le motif et l’auteur.',
    passed: auditEntry.previousScore === 9.5 &&
            auditEntry.newScore === 12.0 &&
            auditEntry.previousStatus === 'not_validated' &&
            auditEntry.newStatus === 'validated' &&
            Boolean(auditEntry.reason) &&
            auditEntry.userId === 'trainer-01',
    details: `Audit généré : ${auditEntry.previousScore}/20 → ${auditEntry.newScore}/20 par ${auditEntry.userName}. Motif : ${auditEntry.reason}.`
  });

  // TEST 9 : Un formateur d'un centre ne peut pas accéder aux données d'un autre centre
  const trainerLome: AuthUser = {
    id: 'tr-lome',
    name: 'Formateur Lomé',
    email: 'tr.lome@dtech.tg',
    role: 'trainer',
    centerId: 'center-lome-avedji',
    status: 'active',
    createdAt: '2026-01-01'
  };

  const canAccessSameCenter = canUserViewStudentModuleValidations(trainerLome, 'center-lome-avedji', 'usr_student_01');
  const canAccessOtherCenter = canUserViewStudentModuleValidations(trainerLome, 'center-kara', 'usr_student_02');

  tests.push({
    id: 'test-9',
    testNumber: 9,
    name: 'Isolation des données formateur par centre',
    description: 'Un formateur de Lomé Avédji a accès à ses étudiants mais est strictement bloqué pour le centre de Kara.',
    passed: canAccessSameCenter === true && canAccessOtherCenter === false,
    details: `Accès même centre : ${canAccessSameCenter ? 'Autorisé' : 'Refusé'}, Accès autre centre : ${canAccessOtherCenter ? 'Autorisé' : 'Bloqué (conforme)'}.`
  });

  // TEST 10 : Un étudiant ne peut voir que ses propres résultats
  const student1: AuthUser = {
    id: 'usr_student_01',
    name: 'Koffi',
    email: 'koffi@dtech.tg',
    role: 'student',
    centerId: 'center-lome-avedji',
    status: 'active',
    createdAt: '2026-01-01'
  };

  const studentOwnAccess = canUserViewStudentModuleValidations(student1, 'center-lome-avedji', 'usr_student_01');
  const studentOtherAccess = canUserViewStudentModuleValidations(student1, 'center-lome-avedji', 'usr_student_02');

  tests.push({
    id: 'test-10',
    testNumber: 10,
    name: 'Étudiant confiné à ses propres résultats',
    description: 'L’étudiant consulte ses validations de modules personnelles et ne peut jamais lire celles d’un pair.',
    passed: studentOwnAccess === true && studentOtherAccess === false,
    details: `Consultation personnelle : ${studentOwnAccess ? 'Oui' : 'Non'}, Consultation pair : ${studentOtherAccess ? 'Violation' : 'Bloqué (conforme)'}.`
  });

  // TEST 11 : Le DG peut consulter les données des 7 centres officiels
  const dgUser: AuthUser = {
    id: 'usr_dg_01',
    name: 'Direction Générale DTech',
    email: 'dg@dtech.tg',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-01'
  };

  const official7Centers = [
    'center-lome-avedji',
    'center-avepozo',
    'center-kpalime',
    'center-atakpame',
    'center-sokode',
    'center-kara',
    'center-dapaong'
  ];

  const dgAccessAll = official7Centers.every(cId => canUserViewStudentModuleValidations(dgUser, cId, 'any-student'));

  tests.push({
    id: 'test-11',
    testNumber: 11,
    name: 'Le DG peut consulter les données des 7 centres',
    description: 'La Direction Générale dispose d’une vue consolidée sur Lomé Avédji, Avépozo, Kpalimé, Atakpamé, Sokodé, Kara et Dapaong.',
    passed: dgAccessAll === true,
    details: `Validation d’accès confirmée sur l’ensemble des 7 centres territoriaux DTech Togo.`
  });

  // TEST 12 : Aucune génération de diplôme n'est déclenchée dans cette étape
  // Vérifie que le résultat de validation ne contient aucun numéro de diplôme, ni certificat délivré, ni QR code
  const recordHasNoDiploma = 
    (res1 as any).diplomaNumber === undefined &&
    (res1 as any).qrCodeUrl === undefined &&
    (res1 as any).certificateDelivered === undefined &&
    (res1 as any).revocationUrl === undefined;

  tests.push({
    id: 'test-12',
    testNumber: 12,
    name: 'Aucune génération de diplôme déclenchée (réservé Étape 9)',
    description: 'L’Étape 8 prépare fidèlement les statuts officiels sans émettre de diplôme, certificat ou QR code anticipé.',
    passed: recordHasNoDiploma === true,
    details: `Absence totale de génération de diplôme confirmée. Données prêtes pour l’Étape 9.`
  });

  return tests;
}
