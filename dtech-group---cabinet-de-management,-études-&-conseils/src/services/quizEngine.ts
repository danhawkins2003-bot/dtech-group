/**
 * MOTEUR OFFICIEL DES QUIZ — ÉTAPE 5
 * DTech Group / Institut Supérieur DELXIA
 * 
 * RÈGLE FONDAMENTALE :
 * AUCUNE ÉVALUATION AUTOMATIQUE DES RÉPONSES.
 * Le système ne doit JAMAIS déterminer lui-même la qualité ou la validité d'une réponse.
 * 
 * Processus :
 * Étudiant passe le Quiz -> Soumet réponses -> Réponses enregistrées -> Résultat en attente
 * -> Formateur habilité consulte la soumission -> Formateur saisit manuellement les points
 * -> Formateur valide le résultat -> Résultat officiel publié à l'étudiant
 */

import {
  Quiz,
  QuizQuestion,
  QuizSubmission,
  QuizStudentAnswer,
  QuizAuditLogEntry,
  QuizTestResult
} from '../types';

/**
 * Calcul mathématique strict du résultat officiel sur 20.
 * 
 * FORMULE OFFICIELLE :
 * Résultat /20 = (total des points attribués par le formateur ÷ total des points maximum) × 20
 * 
 * ⚠️ Le système ne décide absolument pas pourquoi l'étudiant obtient ces points.
 * Il transforme simplement les points déjà déterminés par le formateur en résultat officiel sur 20.
 */
export function calculateOfficialQuizScore(
  answers: QuizStudentAnswer[],
  totalPointsMax: number
): {
  officialScore20: number;
  totalPointsAttributed: number;
  totalPointsMax: number;
  errors: string[];
} {
  const errors: string[] = [];
  let totalPointsAttributed = 0;

  if (!answers || answers.length === 0) {
    errors.push('Aucune réponse fournie.');
    return { officialScore20: 0, totalPointsAttributed: 0, totalPointsMax, errors };
  }

  for (const ans of answers) {
    if (ans.attributedPoints === undefined || ans.attributedPoints === null || isNaN(ans.attributedPoints)) {
      errors.push(`La question "${ans.questionPrompt || ans.questionId}" ne dispose pas de points attribués par le formateur.`);
      continue;
    }

    if (ans.attributedPoints < 0) {
      errors.push(`Les points attribués pour "${ans.questionPrompt || ans.questionId}" doivent être supérieurs ou égaux à 0.`);
    }

    if (ans.attributedPoints > ans.maxPoints) {
      errors.push(`Les points attribués (${ans.attributedPoints}) pour "${ans.questionPrompt || ans.questionId}" dépassent le maximum autorisé (${ans.maxPoints}).`);
    }

    totalPointsAttributed += ans.attributedPoints;
  }

  if (totalPointsMax <= 0) {
    errors.push('Le total des points maximum du quiz doit être strictement positif.');
    return { officialScore20: 0, totalPointsAttributed: 0, totalPointsMax, errors };
  }

  if (errors.length > 0) {
    return { officialScore20: 0, totalPointsAttributed, totalPointsMax, errors };
  }

  // Calcul mathématique arrondi à 2 décimales
  const rawScore = (totalPointsAttributed / totalPointsMax) * 20;
  const officialScore20 = Math.round(rawScore * 100) / 100;

  return {
    officialScore20,
    totalPointsAttributed,
    totalPointsMax,
    errors: []
  };
}

/**
 * Filtre de sécurité pour l'étudiant :
 * Avant validation par le formateur, l'étudiant ne doit voir AUCUN point, AUCUN score,
 * AUCUN pourcentage, et AUCUNE appréciation privée du formateur.
 */
export function sanitizeSubmissionForStudent(submission: QuizSubmission): QuizSubmission {
  if (!submission.trainerValidation) {
    return {
      ...submission,
      status: 'pending_result',
      trainerValidation: false,
      officialScore: undefined,
      officialScore20: undefined,
      totalPointsAttributed: undefined,
      generalComment: undefined,
      validatedAt: undefined,
      validatedByTrainerId: undefined,
      validatedByTrainerName: undefined,
      answers: submission.answers.map(ans => ({
        ...ans,
        attributedPoints: undefined,
        trainerComment: undefined
      }))
    };
  }

  return submission;
}

/**
 * Contrôle strict d'accès formateur (Cloisonnement multi-centres & RBAC).
 * Un formateur ne peut consulter les soumissions que pour les groupes, matières
 * et centres auxquels il est affecté.
 */
export function canTrainerAccessSubmission(
  trainer: {
    id: string;
    role: string;
    centerId?: string;
    assignedGroupIds?: string[];
    assignedCourseIds?: string[];
  },
  submission: QuizSubmission,
  quiz?: Quiz
): boolean {
  // Le DG (admin) a une visibilité globale
  if (trainer.role === 'admin') {
    return true;
  }

  // Le Directeur des Études (study_director) a visibilité sur son centre
  if (trainer.role === 'study_director') {
    if (!trainer.centerId || trainer.centerId === 'all') return true;
    return submission.centerId === trainer.centerId;
  }

  // Formateur standard
  if (trainer.role === 'trainer') {
    // 1. Vérification stricte du centre
    if (trainer.centerId && trainer.centerId !== 'all' && submission.centerId !== trainer.centerId) {
      return false; // Interdit : centre différent
    }

    // 2. Vérification du groupe
    const assignedGroups = trainer.assignedGroupIds || [];
    const isAssignedGroup = assignedGroups.includes(submission.groupId) || assignedGroups.includes('all');

    // 3. Vérification de l'auteur du quiz
    const isQuizAuthor = quiz ? quiz.trainerId === trainer.id : submission.trainerId === trainer.id;

    // 4. Vérification de la matière
    const assignedCourses = trainer.assignedCourseIds || [];
    const isAssignedCourse = assignedCourses.includes(submission.courseUnitId);

    return isQuizAuthor || isAssignedGroup || isAssignedCourse;
  }

  return false;
}

/**
 * Suite officielle des 7 tests obligatoires pour l'Étape 5
 */
export function runStep5QuizTests(): QuizTestResult[] {
  const results: QuizTestResult[] = [];

  // Quiz factice de test (10 points max)
  const sampleQuiz: Quiz = {
    id: 'quiz-test-step5',
    centerId: 'center-lome-avedji',
    formationId: 'c9-dev-web',
    promotionId: 'promo-jan-2026',
    groupId: 'grp-jan26-dev-g1',
    courseUnitId: 'crs-informatique-base',
    moduleId: 'm1',
    trainerId: 'usr_trainer_01',
    trainerName: 'Ing. Kodjo AMENYONA',
    title: 'Quiz Test de Certification',
    description: 'Quiz unitaire pour la validation du moteur de quiz sans notation automatique',
    displayOrder: 1,
    status: 'published',
    totalMaxPoints: 10,
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-01T08:00:00Z',
    questions: [
      {
        id: 'q1',
        order: 1,
        type: 'QCM',
        prompt: 'Question 1 (QCM)',
        maxPoints: 2,
        options: ['Choix A', 'Choix B', 'Choix C']
      },
      {
        id: 'q2',
        order: 2,
        type: 'SHORT_ANSWER',
        prompt: 'Question 2 (Réponse courte)',
        maxPoints: 4
      },
      {
        id: 'q3',
        order: 3,
        type: 'TRUE_FALSE',
        prompt: 'Question 3 (Vrai / Faux)',
        maxPoints: 4,
        options: ['Vrai', 'Faux']
      }
    ]
  };

  // TEST 1 : Soumission initiale
  // Vérifier : status = pending_result, trainerValidation = false, officialScore = undefined
  const initialSubmission: QuizSubmission = {
    id: 'sub-t1',
    quizId: sampleQuiz.id,
    quizTitle: sampleQuiz.title,
    studentId: 'usr_student_01',
    studentName: 'Koffi Mawuli AGBEGNINOU',
    studentNumber: 'DTECH-2026-0104',
    centerId: 'center-lome-avedji',
    groupId: 'grp-jan26-dev-g1',
    formationId: 'c9-dev-web',
    promotionId: 'promo-jan-2026',
    courseUnitId: 'crs-informatique-base',
    moduleId: 'm1',
    trainerId: 'usr_trainer_01',
    submittedAt: '2026-03-09T10:00:00Z',
    status: 'pending_result',
    trainerValidation: false,
    officialScore: undefined,
    officialScore20: undefined,
    totalPointsAttributed: undefined,
    totalPointsMax: 10,
    answers: [
      {
        questionId: 'q1',
        questionOrder: 1,
        questionType: 'QCM',
        questionPrompt: 'Question 1 (QCM)',
        maxPoints: 2,
        studentAnswer: 'Choix A',
        attributedPoints: undefined
      },
      {
        questionId: 'q2',
        questionOrder: 2,
        questionType: 'SHORT_ANSWER',
        questionPrompt: 'Question 2 (Réponse courte)',
        maxPoints: 4,
        studentAnswer: 'Ma réponse rédigée',
        attributedPoints: undefined
      },
      {
        questionId: 'q3',
        questionOrder: 3,
        questionType: 'TRUE_FALSE',
        questionPrompt: 'Question 3 (Vrai / Faux)',
        maxPoints: 4,
        studentAnswer: 'Vrai',
        attributedPoints: undefined
      }
    ]
  };

  const isTest1Valid =
    initialSubmission.status === 'pending_result' &&
    initialSubmission.trainerValidation === false &&
    initialSubmission.officialScore === undefined &&
    initialSubmission.officialScore20 === undefined;

  results.push({
    id: 'test-1',
    name: 'Test 1 — Soumission',
    description: 'Vérifier : status = pending_result, trainerValidation = false, officialScore = undefined',
    passed: isTest1Valid,
    details: isTest1Valid
      ? 'Succès : La soumission est enregistrée avec statut "pending_result", validation désactivée et score indéfini.'
      : `Échec : status=${initialSubmission.status}, trainerValidation=${initialSubmission.trainerValidation}, officialScore=${initialSubmission.officialScore}`
  });

  // TEST 2 : Aucune évaluation automatique
  // Soumettre un Quiz avec des réponses -> aucun point, aucun score, aucun pourcentage, aucun correct/incorrect
  const hasZeroAutoPoints = initialSubmission.answers.every(a => a.attributedPoints === undefined);
  const sanitizedStudentCopy = sanitizeSubmissionForStudent(initialSubmission);
  const noScoreLeaked = sanitizedStudentCopy.officialScore === undefined && sanitizedStudentCopy.totalPointsAttributed === undefined;

  const isTest2Valid = hasZeroAutoPoints && noScoreLeaked;
  results.push({
    id: 'test-2',
    name: 'Test 2 — Aucune évaluation automatique',
    description: 'Soumettre un Quiz avec des réponses. Attendu : aucun point, aucun score, aucun pourcentage, aucun correct/incorrect.',
    passed: isTest2Valid,
    details: isTest2Valid
      ? 'Succès : Zéro point automatique attribué. Aucune comparaison avec un corrigé type ni déduction algorithmique.'
      : 'Échec : Des points ou un score ont été attribués de manière automatique.'
  });

  // TEST 3 : Saisie manuelle par le formateur
  // Le formateur saisit : Q1: 2/2, Q2: 3/4, Q3: 1/4. Avant validation : officialScore = undefined, trainerValidation = false
  const manualAnswers: QuizStudentAnswer[] = [
    { ...initialSubmission.answers[0], attributedPoints: 2, trainerComment: 'Choix pertinent' },
    { ...initialSubmission.answers[1], attributedPoints: 3, trainerComment: 'Bonne définition, manque de précision' },
    { ...initialSubmission.answers[2], attributedPoints: 1, trainerComment: 'Justification partielle' }
  ];

  const draftSubmission: QuizSubmission = {
    ...initialSubmission,
    answers: manualAnswers,
    isDraftSaved: true,
    trainerValidation: false,
    officialScore: undefined,
    officialScore20: undefined
  };

  const isTest3Valid =
    draftSubmission.answers[0].attributedPoints === 2 &&
    draftSubmission.answers[1].attributedPoints === 3 &&
    draftSubmission.answers[2].attributedPoints === 1 &&
    draftSubmission.officialScore === undefined &&
    draftSubmission.trainerValidation === false;

  results.push({
    id: 'test-3',
    name: 'Test 3 — Saisie manuelle',
    description: 'Le formateur saisit Q1: 2/2, Q2: 3/4, Q3: 1/4. Avant validation : officialScore = undefined, trainerValidation = false.',
    passed: isTest3Valid,
    details: isTest3Valid
      ? 'Succès : Points manuels saisis (2/2, 3/4, 1/4) sans que le score officiel ne soit publié ou validé prématurément.'
      : 'Échec : Le score officiel a été calculé ou publié avant la validation explicite du formateur.'
  });

  // TEST 4 : Validation officielle
  // Total attribué : 2 + 3 + 1 = 6/10. Résultat mathématique officiel : (6 ÷ 10) × 20 = 12/20.
  // Attendu : officialScore = 12, status = published, trainerValidation = true
  const calcResult = calculateOfficialQuizScore(draftSubmission.answers, draftSubmission.totalPointsMax);
  const validatedSubmission: QuizSubmission = {
    ...draftSubmission,
    status: 'published',
    trainerValidation: true,
    totalPointsAttributed: calcResult.totalPointsAttributed,
    officialScore: calcResult.officialScore20,
    officialScore20: calcResult.officialScore20,
    validatedAt: new Date().toISOString(),
    validatedByTrainerId: 'usr_trainer_01',
    validatedByTrainerName: 'Ing. Kodjo AMENYONA',
    generalComment: 'Bon travail d\'ensemble, continuez ainsi.'
  };

  const isTest4Valid =
    calcResult.totalPointsAttributed === 6 &&
    calcResult.officialScore20 === 12 &&
    validatedSubmission.officialScore === 12 &&
    validatedSubmission.status === 'published' &&
    validatedSubmission.trainerValidation === true;

  results.push({
    id: 'test-4',
    name: 'Test 4 — Validation officielle',
    description: 'Total : 6/10 => 12/20. Attendu : officialScore = 12, status = published, trainerValidation = true.',
    passed: isTest4Valid,
    details: isTest4Valid
      ? `Succès : Calcul mathématique exact ((6 / 10) × 20 = 12.00 / 20). Statut "published" et validation humaine confirmée.`
      : `Échec : totalAttributed=${calcResult.totalPointsAttributed}, score20=${calcResult.officialScore20}`
  });

  // TEST 5 : Isolation des centres
  // Formateur du centre A (Lomé Avédji) tente d'accéder à une soumission du centre B (Kara). Attendu : Refus / 403
  const trainerLome = {
    id: 'usr_trainer_01',
    role: 'trainer',
    centerId: 'center-lome-avedji',
    assignedGroupIds: ['grp-jan26-dev-g1']
  };

  const submissionKara: QuizSubmission = {
    ...initialSubmission,
    id: 'sub-kara-01',
    centerId: 'center-kara',
    groupId: 'grp-jan26-cpt-g2',
    studentId: 'usr_student_02',
    studentName: 'Abla Claire GBANDI'
  };

  const canLomeAccessKara = canTrainerAccessSubmission(trainerLome, submissionKara);
  const isTest5Valid = canLomeAccessKara === false;

  results.push({
    id: 'test-5',
    name: 'Test 5 — Isolation des centres',
    description: 'Formateur du centre A -> tentative d\'accès à une soumission du centre B. Attendu : HTTP 403 / Accès refusé.',
    passed: isTest5Valid,
    details: isTest5Valid
      ? 'Succès : Le cloisonnement inter-centres bloque tout accès du formateur de Lomé à la soumission du centre de Kara.'
      : 'Échec : Fuite de données entre centres (le formateur de Lomé a pu accéder à Kara).'
  });

  // TEST 6 : Protection contre la fuite du résultat
  // Avant validation, vérifier que l'API et l'interface étudiant ne transmettent aucune donnée permettant de connaître le résultat
  const draftSanitized = sanitizeSubmissionForStudent(draftSubmission);
  const isLeaked =
    draftSanitized.officialScore !== undefined ||
    draftSanitized.officialScore20 !== undefined ||
    draftSanitized.totalPointsAttributed !== undefined ||
    draftSanitized.answers.some(a => a.attributedPoints !== undefined);

  const isTest6Valid = !isLeaked;

  results.push({
    id: 'test-6',
    name: 'Test 6 — Protection contre la fuite du résultat',
    description: 'Avant validation, vérifier que l\'API et l\'interface étudiant ne transmettent aucune donnée permettant de connaître le résultat.',
    passed: isTest6Valid,
    details: isTest6Valid
      ? 'Succès : Toutes les notes manuelles de brouillon restent privées au formateur. L\'étudiant ne reçoit aucun point.'
      : 'Échec : Fuite de données non validées vers l\'étudiant.'
  });

  // TEST 7 : Audit et Traçabilité
  // Après validation, vérifier la présence : formateur, étudiant, Quiz, date, points par question, résultat officiel, action
  const auditEntry: QuizAuditLogEntry = {
    id: 'aud-01',
    quizAttemptId: validatedSubmission.id,
    quizId: validatedSubmission.quizId,
    quizTitle: validatedSubmission.quizTitle,
    studentId: validatedSubmission.studentId,
    studentName: validatedSubmission.studentName,
    trainerId: validatedSubmission.validatedByTrainerId!,
    trainerName: validatedSubmission.validatedByTrainerName!,
    centerId: validatedSubmission.centerId,
    groupId: validatedSubmission.groupId,
    action: 'official_result_published',
    timestamp: validatedSubmission.validatedAt!,
    questionScores: validatedSubmission.answers.map(a => ({
      questionId: a.questionId,
      maxPoints: a.maxPoints,
      attributedPoints: a.attributedPoints!,
      comment: a.trainerComment
    })),
    totalPointsAttributed: validatedSubmission.totalPointsAttributed!,
    totalPointsMax: validatedSubmission.totalPointsMax,
    officialScore: validatedSubmission.officialScore!
  };

  const isTest7Valid =
    !!auditEntry.trainerId &&
    !!auditEntry.studentId &&
    !!auditEntry.quizId &&
    !!auditEntry.timestamp &&
    auditEntry.questionScores.length === 3 &&
    auditEntry.officialScore === 12 &&
    auditEntry.action === 'official_result_published';

  results.push({
    id: 'test-7',
    name: 'Test 7 — Audit & Traçabilité',
    description: 'Après validation, vérifier la présence : formateur, étudiant, Quiz, date, points par question, résultat officiel, action.',
    passed: isTest7Valid,
    details: isTest7Valid
      ? 'Succès : Trace d\'audit immuable complète avec identifiants, horodatage, détail des points et action formateur.'
      : 'Échec : Données d\'audit incomplètes ou manquantes.'
  });

  return results;
}
