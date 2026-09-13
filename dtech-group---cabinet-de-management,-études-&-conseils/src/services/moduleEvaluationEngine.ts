import {
  CourseUnit,
  CourseModule,
  StudentProfile,
  Exercise,
  ExerciseAttempt,
  ModuleEvaluationSummary,
  EvaluationItemScore,
  ModuleCalculationState,
  GradeModificationEntry,
  Quiz,
  QuizSubmission
} from '../types';

export interface ModuleEvaluationEngineOptions {
  attemptSelectionRule?: 'latest' | 'best';
  gradeModifications?: GradeModificationEntry[];
  quizzes?: Quiz[];
  quizSubmissions?: QuizSubmission[];
}

/**
 * MOTEUR OFFICIEL DE CALCUL DE L'ÉVALUATION DU MODULE (ÉTAPE 6)
 * 
 * RÈGLE FONDAMENTALE :
 * Le moteur ne corrige ni ne note jamais une copie.
 * Il applique exclusivement les pondérations pédagogiques sur les notes
 * OFFICIELLES déjà validées et publiées par les formateurs.
 * 
 * PONDÉRATION :
 * - Exercices & Travaux Pratiques : 60 % (0.60)
 * - Quiz : 40 % (0.40)
 * Formule : Note module = (Moyenne exercices × 0.60) + (Moyenne quiz × 0.40)
 * Résultat exprimé sur 20 (arrondi à 2 décimales).
 */
export function calculateModuleEvaluation(
  courseUnit: CourseUnit,
  module: { id: string; title: string },
  student: StudentProfile,
  exercises: Exercise[],
  attempts: ExerciseAttempt[],
  options: ModuleEvaluationEngineOptions = { attemptSelectionRule: 'latest' }
): ModuleEvaluationSummary {
  // 1. Identification de toutes les évaluations prévues et publiées pour ce module et ce groupe/centre
  const relevantEvaluations = exercises.filter(ex => {
    // Vérification de l'UE
    if (ex.courseUnitId !== courseUnit.id) return false;

    // Vérification du module (par ID ou titre)
    const matchesModule = ex.moduleId === module.id || ex.moduleTitle === module.title;
    if (!matchesModule) return false;

    // Seuls les exercices avec statut 'published' sont prévus pour les étudiants
    if (ex.status !== 'published') return false;

    // Filtrage strict par groupe
    const matchesGroup = 
      ex.groupId === student.groupId || 
      ex.groupIds?.includes(student.groupId) || 
      ex.groupIds?.includes('all') ||
      ex.groupId === 'all';
    if (!matchesGroup) return false;

    // Filtrage strict par centre
    const matchesCenter = 
      !ex.centerId || 
      ex.centerId === student.centerId || 
      ex.centerId === 'all';
    if (!matchesCenter) return false;

    return true;
  });

  // Séparation Exercices/TP (60%) vs Quiz (40%)
  const plannedExercises = relevantEvaluations.filter(
    e => e.type === 'exercise' || e.type === 'practical_work' || e.type === 'evaluation'
  );
  const plannedQuizzes = relevantEvaluations.filter(e => e.type === 'quiz');

  // 2. Traitement des tentatives pour les Exercices & TPs
  let exercisesSubmittedCount = 0;
  let exercisesGradedCount = 0;
  let exercisesOfficialPublishedCount = 0;
  const exercisesScores: EvaluationItemScore[] = [];
  const missingOrPendingItems: string[] = [];

  for (const ex of plannedExercises) {
    // Toutes les tentatives soumises par cet étudiant pour cet exercice
    const studentAttempts = attempts.filter(
      a => (a.studentId === student.userId || a.studentId === student.id) && a.exerciseId === ex.id
    );

    if (studentAttempts.length > 0) {
      exercisesSubmittedCount++;
      
      const gradedAttempts = studentAttempts.filter(
        a => a.trainerValidation || a.status === 'graded' || a.status === 'reviewed' || a.status === 'published'
      );
      if (gradedAttempts.length > 0) {
        exercisesGradedCount++;
      }

      // RÈGLE IMPÉRATIVE : Seules les tentatives officiellement validées et publiées sont retenues
      const officialAttempts = studentAttempts.filter(
        a => a.trainerValidation === true && 
             a.status === 'published' && 
             typeof a.officialScore20 === 'number' && 
             !isNaN(a.officialScore20)
      );

      if (officialAttempts.length > 0) {
        exercisesOfficialPublishedCount++;

        // Sélection selon la règle (dernière tentative publiée par défaut)
        let selectedAttempt = officialAttempts[0];
        if (options.attemptSelectionRule === 'best') {
          selectedAttempt = officialAttempts.reduce((prev, curr) => 
            (curr.officialScore20! > prev.officialScore20!) ? curr : prev
          );
        } else {
          // 'latest'
          selectedAttempt = officialAttempts.reduce((prev, curr) => {
            const dateA = new Date(prev.publishedAt || prev.submittedAt || 0).getTime();
            const dateB = new Date(curr.publishedAt || curr.submittedAt || 0).getTime();
            return dateB >= dateA ? curr : prev;
          });
        }

        let officialScore = selectedAttempt.officialScore20!;
        if (options.gradeModifications && options.gradeModifications.length > 0) {
          const mod = options.gradeModifications.find(m => m.attemptId === selectedAttempt.id);
          if (mod && typeof mod.newScore20 === 'number') {
            officialScore = mod.newScore20;
          }
        }

        exercisesScores.push({
          evaluationId: ex.id,
          title: ex.title,
          type: ex.type as any,
          officialScore20: officialScore,
          publishedAt: selectedAttempt.publishedAt || selectedAttempt.submittedAt,
          attemptId: selectedAttempt.id,
          attemptNumber: selectedAttempt.attemptNumber || 1,
          trainerName: selectedAttempt.validatedByName || selectedAttempt.gradedByName
        });
      } else {
        missingOrPendingItems.push(`Exercice "${ex.title}" : Copie en attente de correction ou de publication par le formateur`);
      }
    } else {
      missingOrPendingItems.push(`Exercice "${ex.title}" : Évaluation non encore soumise par l'étudiant`);
    }
  }

  // 3. Traitement des tentatives pour les Quiz
  let quizzesSubmittedCount = 0;
  let quizzesGradedCount = 0;
  let quizzesOfficialPublishedCount = 0;
  const quizzesScores: EvaluationItemScore[] = [];

  for (const qz of plannedQuizzes) {
    const studentAttempts = attempts.filter(
      a => (a.studentId === student.userId || a.studentId === student.id) && a.exerciseId === qz.id
    );

    if (studentAttempts.length > 0) {
      quizzesSubmittedCount++;
      
      const gradedAttempts = studentAttempts.filter(
        a => a.trainerValidation || a.status === 'graded' || a.status === 'reviewed' || a.status === 'published'
      );
      if (gradedAttempts.length > 0) {
        quizzesGradedCount++;
      }

      const officialAttempts = studentAttempts.filter(
        a => a.trainerValidation === true && 
             a.status === 'published' && 
             typeof a.officialScore20 === 'number' && 
             !isNaN(a.officialScore20)
      );

      if (officialAttempts.length > 0) {
        quizzesOfficialPublishedCount++;

        let selectedAttempt = officialAttempts[0];
        if (options.attemptSelectionRule === 'best') {
          selectedAttempt = officialAttempts.reduce((prev, curr) => 
            (curr.officialScore20! > prev.officialScore20!) ? curr : prev
          );
        } else {
          selectedAttempt = officialAttempts.reduce((prev, curr) => {
            const dateA = new Date(prev.publishedAt || prev.submittedAt || 0).getTime();
            const dateB = new Date(curr.publishedAt || curr.submittedAt || 0).getTime();
            return dateB >= dateA ? curr : prev;
          });
        }

        let officialScore = selectedAttempt.officialScore20!;
        if (options.gradeModifications && options.gradeModifications.length > 0) {
          const mod = options.gradeModifications.find(m => m.attemptId === selectedAttempt.id);
          if (mod && typeof mod.newScore20 === 'number') {
            officialScore = mod.newScore20;
          }
        }

        quizzesScores.push({
          evaluationId: qz.id,
          title: qz.title,
          type: 'quiz',
          officialScore20: officialScore,
          publishedAt: selectedAttempt.publishedAt || selectedAttempt.submittedAt,
          attemptId: selectedAttempt.id,
          attemptNumber: selectedAttempt.attemptNumber || 1,
          trainerName: selectedAttempt.validatedByName || selectedAttempt.gradedByName
        });
      } else {
        missingOrPendingItems.push(`Quiz "${qz.title}" : Copie en attente de validation ou de publication officielle`);
      }
    } else {
      missingOrPendingItems.push(`Quiz "${qz.title}" : Quiz non encore composé par l'étudiant`);
    }
  }

  // Traitement complémentaire des Quiz officiels Étape 5 (options.quizzes)
  if (options.quizzes && options.quizzes.length > 0) {
    const step5Quizzes = options.quizzes.filter(qz => {
      const matchCourse = qz.courseUnitCode === courseUnit.code || qz.courseUnitTitle === courseUnit.title;
      const matchModule = qz.moduleId === module.id || qz.moduleTitle === module.title;
      if (!matchCourse || !matchModule) return false;
      if (qz.status !== 'published') return false;
      const matchGroup = !qz.groupId || qz.groupId === student.groupId || qz.groupId === 'all';
      const matchCenter = !qz.centerId || qz.centerId === student.centerId || qz.centerId === 'all';
      return matchGroup && matchCenter;
    });

    for (const qz of step5Quizzes) {
      // Éviter les doublons si déjà compté dans plannedQuizzes
      if (plannedQuizzes.some(pq => pq.id === qz.id || pq.title === qz.title)) continue;

      const sub = (options.quizSubmissions || []).find(
        s => (s.studentId === student.userId || s.studentId === student.id || s.studentNumber === student.studentNumber) && s.quizId === qz.id
      );

      if (sub) {
        quizzesSubmittedCount++;
        if (sub.trainerValidation || sub.isDraftSaved) quizzesGradedCount++;

        // Seuls les résultats validés et publiés sont retenus pour la note officielle
        const score = typeof sub.officialScore20 === 'number' ? sub.officialScore20 : sub.officialScore;
        if (sub.trainerValidation && sub.status === 'published' && typeof score === 'number') {
          quizzesOfficialPublishedCount++;
          quizzesScores.push({
            evaluationId: qz.id,
            title: qz.title,
            type: 'quiz',
            officialScore20: score,
            publishedAt: sub.validatedAt || sub.submittedAt,
            attemptId: sub.id,
            attemptNumber: 1,
            trainerName: sub.validatedByTrainerName || 'Formateur DTech'
          });
        } else {
          missingOrPendingItems.push(`Quiz officiel "${qz.title}" : Résultat en attente de validation humaine par le formateur`);
        }
      } else {
        missingOrPendingItems.push(`Quiz officiel "${qz.title}" : Non encore composé par l'étudiant`);
      }
    }
  }

  // 4. Calcul de la moyenne officielle des exercices (/20)
  // RÈGLE : Ne jamais convertir une évaluation manquante en 0.
  // La moyenne est calculée STRICTEMENT sur les notes officiellement publiées.
  let exercisesAverage20: number | null = null;
  if (exercisesScores.length > 0) {
    const sum = exercisesScores.reduce((acc, curr) => acc + curr.officialScore20, 0);
    exercisesAverage20 = Number((sum / exercisesScores.length).toFixed(2));
  }

  // 5. Calcul de la moyenne officielle des quiz (/20)
  let quizzesAverage20: number | null = null;
  if (quizzesScores.length > 0) {
    const sum = quizzesScores.reduce((acc, curr) => acc + curr.officialScore20, 0);
    quizzesAverage20 = Number((sum / quizzesScores.length).toFixed(2));
  }

  // 6. Détermination du statut de calcul et du résultat pondéré
  let moduleScore20: number | null = null;
  let calculationState: ModuleCalculationState = 'waiting_evaluations';
  let calculationStateLabel = "En attente d’évaluations";

  const totalPlanned = plannedExercises.length + plannedQuizzes.length;
  const totalPublished = exercisesOfficialPublishedCount + quizzesOfficialPublishedCount;
  const evaluationsRemainingCount = totalPlanned - totalPublished;

  const hasAnyOfficialNote = exercisesScores.length > 0 || quizzesScores.length > 0;

  if (!hasAnyOfficialNote) {
    // CAS 7 : Aucune note officielle n'est disponible
    // RÈGLE : Afficher « En attente d'évaluations » et JAMAIS 0/20
    calculationState = 'waiting_evaluations';
    calculationStateLabel = "En attente d’évaluations";
    moduleScore20 = null;
  } else if (exercisesAverage20 !== null && quizzesAverage20 !== null) {
    // Formule 60/40 : (Note exercices × 0.60) + (Note quiz × 0.40)
    const rawWeighted = (exercisesAverage20 * 0.60) + (quizzesAverage20 * 0.40);
    moduleScore20 = Number(rawWeighted.toFixed(2));

    if (evaluationsRemainingCount === 0 && totalPlanned > 0) {
      calculationState = 'complete';
      calculationStateLabel = "Évaluation complète";
    } else {
      // CAS 4 : Notes officielles partielles disponibles, certaines évaluations prévues non encore corrigées
      // RÈGLE : Ne jamais pénaliser par un zéro les exercices en cours de correction
      calculationState = 'waiting_required_evaluations';
      calculationStateLabel = "En attente de toutes les évaluations requises";
    }
  } else {
    // Des notes officielles existent dans un volet (ex: exercices uniquement ou quiz uniquement), mais l'autre volet est en attente
    calculationState = 'waiting_required_evaluations';
    if (exercisesAverage20 !== null && quizzesAverage20 === null) {
      calculationStateLabel = "En attente de toutes les évaluations requises (Quiz en attente)";
    } else {
      calculationStateLabel = "En attente de toutes les évaluations requises (Exercices en attente)";
    }
    moduleScore20 = null;
  }

  return {
    courseUnitId: courseUnit.id,
    courseUnitCode: courseUnit.code || courseUnit.id,
    courseUnitTitle: courseUnit.title,
    moduleId: module.id,
    moduleTitle: module.title,
    studentId: student.userId,
    studentName: student.fullName,
    studentNumber: student.studentNumber,
    centerId: student.centerId,
    centerName: student.centerName,
    groupId: student.groupId,
    groupName: student.groupName,
    formationId: student.formationId,
    formationTitle: student.formationTitle,

    exercisesWeight: 0.60,
    exercisesPlannedCount: plannedExercises.length,
    exercisesSubmittedCount,
    exercisesGradedCount,
    exercisesOfficialPublishedCount,
    exercisesScores,
    exercisesAverage20,

    quizzesWeight: 0.40,
    quizzesPlannedCount: plannedQuizzes.length,
    quizzesSubmittedCount,
    quizzesGradedCount,
    quizzesOfficialPublishedCount,
    quizzesScores,
    quizzesAverage20,

    moduleScore20,
    calculationState,
    calculationStateLabel,
    formulaDisplay: "Note module = (Note exercices × 0,60) + (Note quiz × 0,40)",

    evaluationsTotalPlanned: totalPlanned,
    evaluationsTotalPublished: totalPublished,
    evaluationsRemainingCount: Math.max(0, evaluationsRemainingCount),
    missingOrPendingItems,
    isCalculationReady: calculationState === 'complete'
  };
}

/**
 * Calculateur multi-modules pour un étudiant donné
 */
export function calculateAllModulesForStudent(
  student: StudentProfile,
  courses: CourseUnit[],
  exercises: Exercise[],
  attempts: ExerciseAttempt[],
  options?: ModuleEvaluationEngineOptions
): ModuleEvaluationSummary[] {
  const summaries: ModuleEvaluationSummary[] = [];

  for (const course of courses) {
    // Vérifier si le cours concerne la formation de l'étudiant ou le tronc commun
    const matchesFormation = 
      course.formationId === 'common' || 
      course.formationId === student.formationId;

    if (!matchesFormation) continue;

    const modules = course.modules && course.modules.length > 0
      ? course.modules
      : [{ id: 'm1', title: course.title }];

    for (const mod of modules) {
      const summary = calculateModuleEvaluation(
        course,
        mod,
        student,
        exercises,
        attempts,
        options
      );
      summaries.push(summary);
    }
  }

  return summaries;
}

/**
 * Suite de validation des 5 cas de test spécifiés pour l'Étape 6
 */
export function runStep6TestCases() {
  const dummyStudentLome: StudentProfile = {
    id: 'stu-test-lome',
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
    id: 'stu-test-kara',
    userId: 'usr_student_02',
    studentNumber: 'DTECH-2026-0210',
    fullName: 'Akossiwa Bernadette KPONVI',
    email: 'akossiwa.kponvi@dtech.tg',
    phone: '+228 90 00 00 02',
    city: 'Kara',
    centerId: 'center-kara',
    centerName: 'Kara (Pôle Septentrional)',
    formationId: 'c9-gestion-commerciale',
    formationTitle: 'GESTION COMMERCIALE & MARKETING',
    promotionId: 'promo-jan-2026',
    promotionName: 'Promotion Janvier 2026',
    groupId: 'grp-jan26-cpt-g2',
    groupName: 'Groupe 2 — Kara',
    enrollmentDate: '2026-01-15',
    registrationFeePaid: true,
    registrationReceiptNumber: 'REC-2026-002',
    status: 'active',
    overallProgressPercent: 80
  };

  const dummyCourse: CourseUnit = {
    id: 'crs-test',
    code: 'TEST-101',
    title: 'Module Test Étape 6',
    description: 'Unité d’enseignement de test pour le moteur de calcul du module',
    phase: 'common_core',
    phaseTitle: 'Tronc Commun',
    hours: 30,
    formationId: 'c9-dev-web',
    modules: [{ id: 'm1', title: 'Module Étape 6' }]
  };

  const dummyModule = dummyCourse.modules![0];

  const makeEx = (data: Partial<Exercise> & { id: string; title: string; type: 'exercise' | 'quiz'; centerId: string; groupId: string }): Exercise => ({
    description: 'Test description',
    instructions: 'Test instructions',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
    courseUnitId: 'crs-test',
    moduleId: 'm1',
    trainerId: 'usr_trainer_01',
    totalPoints: 20,
    status: 'published',
    questions: [],
    ...data
  });

  const makeAtt = (data: Partial<ExerciseAttempt> & { id: string; exerciseId: string; studentId: string; centerId: string; groupId: string; officialScore20: number }): ExerciseAttempt => ({
    startedAt: '2026-01-15T09:00:00.000Z',
    submittedAt: '2026-01-15T10:00:00.000Z',
    attemptNumber: 1,
    isValidated: true,
    trainerValidation: true,
    status: 'published',
    maxPoints: 20,
    answers: [],
    publishedAt: '2026-01-15T12:00:00.000Z',
    ...data
  });

  // TEST 1 : 1 exercice (14/20) + 1 quiz (16/20) => (14×0.6) + (16×0.4) = 8.4 + 6.4 = 14.80 / 20
  const exT1: Exercise[] = [
    makeEx({ id: 'ex-t1', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', title: 'Exercice T1', type: 'exercise' }),
    makeEx({ id: 'qz-t1', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', title: 'Quiz T1', type: 'quiz' })
  ];

  const attT1: ExerciseAttempt[] = [
    makeAtt({ id: 'att-ex-t1', exerciseId: 'ex-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 14.0 }),
    makeAtt({ id: 'att-qz-t1', exerciseId: 'qz-t1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 16.0 })
  ];

  const res1 = calculateModuleEvaluation(dummyCourse, dummyModule, dummyStudentLome, exT1, attT1);

  // TEST 2 : 1 exercice (15/20) + quiz en attente => Note exercice = 15/20, Statut "En attente d'évaluations"
  const exT2: Exercise[] = [
    makeEx({ id: 'ex-t2', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', title: 'Exercice T2', type: 'exercise' }),
    makeEx({ id: 'qz-t2', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', title: 'Quiz T2', type: 'quiz' })
  ];

  const attT2: ExerciseAttempt[] = [
    makeAtt({ id: 'att-ex-t2', exerciseId: 'ex-t2', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 15.0 })
  ];

  const res2 = calculateModuleEvaluation(dummyCourse, dummyModule, dummyStudentLome, exT2, attT2);

  // TEST 3 : 2 exercices (13/20 et 15/20) + 1 quiz (16/20) => Moyenne ex = 14/20, Quiz = 16/20 => 14.80/20
  const exT3: Exercise[] = [
    makeEx({ id: 'ex-t3-1', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', title: 'Ex 1', type: 'exercise' }),
    makeEx({ id: 'ex-t3-2', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', title: 'Ex 2', type: 'exercise' }),
    makeEx({ id: 'qz-t3', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', title: 'Quiz 1', type: 'quiz' })
  ];

  const attT3: ExerciseAttempt[] = [
    makeAtt({ id: 'a-ex-t3-1', exerciseId: 'ex-t3-1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 13.0 }),
    makeAtt({ id: 'a-ex-t3-2', exerciseId: 'ex-t3-2', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 15.0 }),
    makeAtt({ id: 'a-qz-t3', exerciseId: 'qz-t3', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 16.0 })
  ];

  const res3 = calculateModuleEvaluation(dummyCourse, dummyModule, dummyStudentLome, exT3, attT3);

  // TEST 4 : 1 exercice (14/20) + 2 quiz (15/20 et 17/20) => Moyenne quiz = 16/20 => 14.80/20
  const exT4: Exercise[] = [
    makeEx({ id: 'ex-t4', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', title: 'Ex', type: 'exercise' }),
    makeEx({ id: 'qz-t4-1', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', title: 'Qz 1', type: 'quiz' }),
    makeEx({ id: 'qz-t4-2', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', title: 'Qz 2', type: 'quiz' })
  ];

  const attT4: ExerciseAttempt[] = [
    makeAtt({ id: 'a-ex-t4', exerciseId: 'ex-t4', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 14.0 }),
    makeAtt({ id: 'a-qz-t4-1', exerciseId: 'qz-t4-1', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 15.0 }),
    makeAtt({ id: 'a-qz-t4-2', exerciseId: 'qz-t4-2', studentId: 'usr_student_01', centerId: 'center-lome-avedji', groupId: 'grp-jan26-dev-g1', officialScore20: 17.0 })
  ];

  const res4 = calculateModuleEvaluation(dummyCourse, dummyModule, dummyStudentLome, exT4, attT4);

  // TEST 5 : Isolation multi-centres (Centre Lomé vs Centre Kara)
  const exT5: Exercise[] = [
    makeEx({ id: 'ex-kara', centerId: 'center-kara', groupId: 'grp-jan26-cpt-g2', title: 'Ex Kara', type: 'exercise' }),
    makeEx({ id: 'qz-kara', centerId: 'center-kara', groupId: 'grp-jan26-cpt-g2', title: 'Qz Kara', type: 'quiz' })
  ];

  const attT5: ExerciseAttempt[] = [
    makeAtt({ id: 'a-ex-k', exerciseId: 'ex-kara', studentId: 'usr_student_02', centerId: 'center-kara', groupId: 'grp-jan26-cpt-g2', officialScore20: 17.5 }),
    makeAtt({ id: 'a-qz-k', exerciseId: 'qz-kara', studentId: 'usr_student_02', centerId: 'center-kara', groupId: 'grp-jan26-cpt-g2', officialScore20: 18.0 })
  ];

  // Calcul pour étudiant Kara : (17.5 × 0.6) + (18.0 × 0.4) = 10.5 + 7.2 = 17.70 / 20
  const res5Kara = calculateModuleEvaluation(dummyCourse, dummyModule, dummyStudentKara, exT5, attT5);
  // Calcul pour étudiant Lomé avec le set Kara : les exercices Kara ne doivent pas impacter Lomé !
  const res5Lome = calculateModuleEvaluation(dummyCourse, dummyModule, dummyStudentLome, exT5, attT5);

  return {
    cases: [
      {
        id: 'test-1',
        name: 'Cas de test 1 : 1 exercice (14/20) + 1 quiz (16/20)',
        description: 'Calcul pondéré 60/40 classique avec 1 note officielle dans chaque volet.',
        expected: '14.80 / 20',
        actual: res1.moduleScore20 !== null ? `${res1.moduleScore20.toFixed(2)} / 20` : 'N/A',
        state: res1.calculationState,
        passed: res1.moduleScore20 === 14.80 && res1.calculationState === 'complete'
      },
      {
        id: 'test-2',
        name: 'Cas de test 2 : 1 exercice (15/20) + quiz en attente',
        description: 'Le quiz manquant n\'est JAMAIS mis à 0. Statut « En attente d\'évaluations » sans note finale erronée.',
        expected: 'Note ex = 15/20, Quiz = En attente, Module = En attente',
        actual: `Note ex = ${res2.exercisesAverage20 ?? 'N/A'}/20, Quiz = ${res2.quizzesAverage20 ?? 'En attente'}, Module = ${res2.moduleScore20 ?? 'En attente'}`,
        state: res2.calculationStateLabel,
        passed: res2.exercisesAverage20 === 15.0 && res2.quizzesAverage20 === null && res2.moduleScore20 === null
      },
      {
        id: 'test-3',
        name: 'Cas de test 3 : 2 exercices (13/20 et 15/20) + 1 quiz (16/20)',
        description: 'Moyenne arithmétique des exercices = (13+15)/2 = 14/20. Note module = (14×0.6)+(16×0.4) = 14.80/20.',
        expected: 'Moyenne ex = 14.00/20, Module = 14.80/20',
        actual: `Moyenne ex = ${res3.exercisesAverage20?.toFixed(2)}/20, Module = ${res3.moduleScore20?.toFixed(2)}/20`,
        state: res3.calculationState,
        passed: res3.exercisesAverage20 === 14.00 && res3.moduleScore20 === 14.80
      },
      {
        id: 'test-4',
        name: 'Cas de test 4 : 1 exercice (14/20) + 2 quiz (15/20 et 17/20)',
        description: 'Moyenne arithmétique des quiz = (15+17)/2 = 16/20. Note module = (14×0.6)+(16×0.4) = 14.80/20.',
        expected: 'Moyenne quiz = 16.00/20, Module = 14.80/20',
        actual: `Moyenne quiz = ${res4.quizzesAverage20?.toFixed(2)}/20, Module = ${res4.moduleScore20?.toFixed(2)}/20`,
        state: res4.calculationState,
        passed: res4.quizzesAverage20 === 16.00 && res4.moduleScore20 === 14.80
      },
      {
        id: 'test-5',
        name: 'Cas de test 5 : Isolation multi-centres (Centre Lomé vs Centre Kara)',
        description: 'L\'étudiant du centre de Kara est évalué sur ses exercices propres (17.70/20), tandis que Lomé n\'a pas accès aux données de Kara.',
        expected: 'Kara = 17.70/20 (isolé), Lomé = Aucun exercice Kara comptabilisé',
        actual: `Kara = ${res5Kara.moduleScore20?.toFixed(2)}/20, Lomé count = ${res5Lome.exercisesPlannedCount}`,
        state: 'Isolé par centerId',
        passed: res5Kara.moduleScore20 === 17.70 && res5Lome.exercisesPlannedCount === 0
      }
    ]
  };
}
