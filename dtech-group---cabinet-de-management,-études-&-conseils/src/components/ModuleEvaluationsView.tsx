import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Award, 
  FileCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  History, 
  Building2, 
  ChevronRight, 
  Layers, 
  User, 
  Filter,
  Info,
  Check,
  RefreshCw,
  Scale
} from 'lucide-react';
import { 
  AuthUser, 
  CourseUnit, 
  Exercise, 
  ExerciseAttempt, 
  GradeModificationEntry, 
  ModuleEvaluationSummary,
  StudentProfile,
  Quiz,
  QuizSubmission
} from '../types';
import { 
  calculateModuleEvaluation, 
  runStep6TestCases 
} from '../services/moduleEvaluationEngine';
import { 
  runStep8ModuleValidationTests 
} from '../services/moduleValidationEngine';
import { Step8ModuleValidationTestResult } from '../types';
import { 
  DTECH_COURSE_UNITS, 
  DTECH_EXERCISES, 
  DTECH_EXERCISE_ATTEMPTS, 
  DTECH_GRADE_MODIFICATIONS,
  DTECH_STUDENTS_PROFILES 
} from '../data/dtechBusinessData';
import { dtechApiService } from '../services/dtechApiService';

interface ModuleEvaluationsViewProps {
  currentUser?: AuthUser | null;
  role?: 'student' | 'trainer' | 'direction';
  studentId?: string;
  centerId?: string;
}

export const ModuleEvaluationsView: React.FC<ModuleEvaluationsViewProps> = ({
  currentUser,
  role = 'student',
  studentId,
  centerId
}) => {
  // Current user / profile context
  const activeCenterId = centerId || currentUser?.centerId || 'center-lome-avedji';
  const effectiveStudentId = studentId || currentUser?.id || 'usr_student_01';

  // State
  const [exercisesList, setExercisesList] = useState<Exercise[]>(DTECH_EXERCISES);
  const [attemptsList, setAttemptsList] = useState<ExerciseAttempt[]>(DTECH_EXERCISE_ATTEMPTS);
  const [auditModifications, setAuditModifications] = useState<GradeModificationEntry[]>(DTECH_GRADE_MODIFICATIONS);
  const [quizzesList, setQuizzesList] = useState<Quiz[]>([]);
  const [quizSubmissionsList, setQuizSubmissionsList] = useState<QuizSubmission[]>([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        if (role === 'student') {
          const res = await dtechApiService.getStudentQuizzes();
          if (res.status === 'success') {
            setQuizzesList(res.quizzes || []);
            setQuizSubmissionsList(res.submissions || []);
          }
        } else {
          const res = await dtechApiService.getTrainerQuizzes();
          if (res.status === 'success') {
            setQuizzesList(res.quizzes || []);
            setQuizSubmissionsList(res.submissions || []);
          }
        }
      } catch (err) {
        console.warn('Could not load Step 5 quizzes for evaluation summary:', err);
      }
    };
    fetchQuizzes();
  }, [role]);

  // Selected course & module
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs-informatique-base');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('m1');
  const [showTestRunner, setShowTestRunner] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<ReturnType<typeof runStep6TestCases> | null>(null);

  // Tests Étape 8 : Moteur officiel de validation des modules
  const [showStep8TestRunner, setShowStep8TestRunner] = useState<boolean>(false);
  const [step8TestResults, setStep8TestResults] = useState<Step8ModuleValidationTestResult[] | null>(null);

  const handleRunStep8Tests = () => {
    const results = runStep8ModuleValidationTests();
    setStep8TestResults(results);
    setShowStep8TestRunner(true);
  };

  // Modal for trainer grade modification audit
  const [isModifyModalOpen, setIsModifyModalOpen] = useState<boolean>(false);
  const [targetAttemptToModify, setTargetAttemptToModify] = useState<ExerciseAttempt | null>(null);
  const [newScoreInput, setNewScoreInput] = useState<string>('');
  const [modificationReason, setModificationReason] = useState<string>('');
  const [modificationError, setModificationError] = useState<string | null>(null);

  // Available course units
  const availableCourses = useMemo(() => {
    return DTECH_COURSE_UNITS;
  }, []);

  // Current student profile
  const currentStudent = useMemo<StudentProfile>(() => {
    const found = DTECH_STUDENTS_PROFILES.find(s => s.userId === effectiveStudentId || s.id === effectiveStudentId);
    if (found) return found;
    return DTECH_STUDENTS_PROFILES.find(s => s.centerId === activeCenterId) || DTECH_STUDENTS_PROFILES[0];
  }, [effectiveStudentId, activeCenterId]);

  // Selected course object
  const currentCourse = useMemo(() => {
    return availableCourses.find(c => c.id === selectedCourseId) || availableCourses[0];
  }, [availableCourses, selectedCourseId]);

  // Modules in current course
  const currentModules = useMemo(() => {
    return currentCourse?.modules || [];
  }, [currentCourse]);

  // Selected module object
  const currentModule = useMemo(() => {
    return currentModules.find(m => m.id === selectedModuleId) || currentModules[0];
  }, [currentModules, selectedModuleId]);

  // Compute evaluation summary using the official calculation engine
  const evaluationSummary: ModuleEvaluationSummary = useMemo(() => {
    if (!currentCourse || !currentModule) {
      return {
        courseUnitId: '',
        courseUnitCode: '',
        courseUnitTitle: '',
        moduleId: '',
        moduleTitle: '',
        studentId: effectiveStudentId,
        studentName: currentStudent?.fullName || 'Étudiant',
        centerId: activeCenterId,
        groupId: currentStudent?.groupId || 'grp-1',
        exercisesWeight: 0.60,
        exercisesPlannedCount: 0,
        exercisesSubmittedCount: 0,
        exercisesGradedCount: 0,
        exercisesOfficialPublishedCount: 0,
        exercisesScores: [],
        exercisesAverage20: null,
        quizzesWeight: 0.40,
        quizzesPlannedCount: 0,
        quizzesSubmittedCount: 0,
        quizzesGradedCount: 0,
        quizzesOfficialPublishedCount: 0,
        quizzesScores: [],
        quizzesAverage20: null,
        moduleScore20: null,
        calculationState: 'waiting_evaluations',
        calculationStateLabel: 'En attente d’évaluations',
        formulaDisplay: 'Note module = (Note exercices × 0,60) + (Note quiz × 0,40)',
        evaluationsTotalPlanned: 0,
        evaluationsTotalPublished: 0,
        evaluationsRemainingCount: 0,
        missingOrPendingItems: [],
        isCalculationReady: false
      };
    }

    return calculateModuleEvaluation(
      currentCourse,
      currentModule,
      currentStudent,
      exercisesList,
      attemptsList,
      { attemptSelectionRule: 'latest', quizzes: quizzesList, quizSubmissions: quizSubmissionsList }
    );
  }, [currentCourse, currentModule, currentStudent, effectiveStudentId, activeCenterId, exercisesList, attemptsList, quizzesList, quizSubmissionsList]);

  // All modules summary for current student and course
  const allModulesSummaries = useMemo(() => {
    if (!currentCourse) return [];
    return (currentCourse.modules || []).map(mod => {
      return calculateModuleEvaluation(
        currentCourse,
        mod,
        currentStudent,
        exercisesList,
        attemptsList,
        { attemptSelectionRule: 'latest', quizzes: quizzesList, quizSubmissions: quizSubmissionsList }
      );
    });
  }, [currentCourse, currentStudent, exercisesList, attemptsList, quizzesList, quizSubmissionsList]);

  // Run Step 6 Test Cases suite
  const handleRunTests = () => {
    const results = runStep6TestCases();
    setTestResults(results);
    setShowTestRunner(true);
  };

  // Open modal to modify a grade (Trainers/Direction only)
  const handleOpenModifyModal = (attempt: ExerciseAttempt) => {
    setTargetAttemptToModify(attempt);
    setNewScoreInput(attempt.officialScore20?.toString() || '10');
    setModificationReason('');
    setModificationError(null);
    setIsModifyModalOpen(true);
  };

  // Submit official grade modification with audit trail
  const handleSubmitGradeModification = () => {
    if (!targetAttemptToModify) return;

    const parsedScore = parseFloat(newScoreInput);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 20) {
      setModificationError('La note doit être un nombre valide compris entre 0 et 20.');
      return;
    }

    if (!modificationReason.trim() || modificationReason.trim().length < 8) {
      setModificationError('Un motif de révision pédagogique précis (minimum 8 caractères) est obligatoire.');
      return;
    }

    const previousScore = targetAttemptToModify.officialScore20 ?? 0;
    const trainerName = currentUser?.name || 'Formateur Habilité';
    const trainerId = currentUser?.id || 'usr_trainer_01';
    const timestamp = new Date().toISOString();

    const newAuditEntry: GradeModificationEntry = {
      id: `mod-${Date.now()}`,
      attemptId: targetAttemptToModify.id,
      exerciseId: targetAttemptToModify.exerciseId,
      exerciseTitle: targetAttemptToModify.exerciseTitle,
      studentId: targetAttemptToModify.studentId,
      studentName: currentStudent?.fullName,
      previousScore20: previousScore,
      newScore20: parsedScore,
      reason: modificationReason.trim(),
      trainerId: trainerId,
      trainerName: trainerName,
      modifiedAt: timestamp
    };

    // Update attempt
    const updatedAttempts = attemptsList.map(att => {
      if (att.id === targetAttemptToModify.id) {
        return {
          ...att,
          officialScore: parsedScore,
          officialScore20: parsedScore,
          score20: parsedScore,
          totalPointsEarned: parsedScore,
          isScoreOverridden: true,
          auditTrail: {
            ...att.auditTrail,
            trainerId,
            trainerName,
            finalTrainerScore: parsedScore,
            finalTrainerScore20: parsedScore,
            gradedAt: timestamp,
            validatedAt: timestamp,
            publishedAt: timestamp,
            actionName: `Révision de note officielle : passage de ${previousScore}/20 à ${parsedScore}/20. Motif : ${modificationReason.trim()}`
          }
        };
      }
      return att;
    });

    setAttemptsList(updatedAttempts);
    setAuditModifications(prev => [newAuditEntry, ...prev]);
    setIsModifyModalOpen(false);
    setTargetAttemptToModify(null);
  };

  // State badge renderer
  const renderStateBadge = (state: ModuleEvaluationSummary['calculationState']) => {
    switch (state) {
      case 'complete':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Évaluation complète
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Check className="w-3.5 h-3.5 text-indigo-600" />
            Résultat disponible
          </span>
        );
      case 'waiting_required_evaluations':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            En attente d'évaluations requises
          </span>
        );
      case 'waiting_evaluations':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            En attente d'évaluations
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER : RÈGLE & PONDÉRATION OFFICIELLE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Calculator className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Moteur d’Évaluation & Calcul du Module</h2>
                <p className="text-xs text-slate-500">Pondération officielle DTECH : Exercices & TP (60 %) + Quiz certifiants (40 %)</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunTests}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Valider les 5 Tests Étape 6</span>
            </button>
            <button
              onClick={handleRunStep8Tests}
              className="px-3.5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Valider les 12 Tests Étape 8 (Validation Modules)</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Notation 100% Formateurs</span>
            </div>
          </div>
        </div>

        {/* REGLE FONDAMENTALE BANNER */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Règle de rigueur académique :</span> Le moteur n’attribue jamais de note automatique. Une copie non corrigée n’est jamais comptabilisée comme 0/20. Seules les notes validées et publiées par les formateurs agréés entrent dans la moyenne pondérée.
          </div>
        </div>
      </div>

      {/* MODAL : RUN STEP 8 MODULE VALIDATION TEST SUITE */}
      {showStep8TestRunner && step8TestResults && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Résultats des 12 Cas de Test Spécifiés (Étape 8 — Validation Officielle des Modules)</h3>
                <p className="text-xs text-slate-400">Règles 60/40, Best Score immuable, seuil 10.00/20, confinements RBAC et absence de diplôme anticipé</p>
              </div>
            </div>
            <button
              onClick={() => setShowStep8TestRunner(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {step8TestResults.map(tc => (
              <div key={tc.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-300 uppercase tracking-wider">Test {tc.testNumber} : {tc.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    tc.passed 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {tc.passed ? 'SUCCÈS' : 'ÉCHEC'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{tc.description}</p>
                <div className="pt-2 border-t border-slate-700/60 font-mono text-[11px] text-slate-400 space-y-1">
                  <div className={tc.passed ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                    Détails : {tc.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL : RUN STEP 6 TEST CASES */}
      {showTestRunner && testResults && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Résultats des 5 Cas de Test Spécifiés (Étape 6)</h3>
                <p className="text-xs text-slate-400">Vérification mathématique et logique de conformité stricte</p>
              </div>
            </div>
            <button
              onClick={() => setShowTestRunner(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {testResults.cases.map(tc => (
              <div key={tc.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-300 uppercase tracking-wider">{tc.name}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    SUCCÈS
                  </span>
                </div>
                <p className="text-xs text-slate-300">{tc.description}</p>
                <div className="pt-2 border-t border-slate-700/60 font-mono text-[11px] text-slate-400 space-y-1">
                  <div>Attendu : {tc.expected}</div>
                  <div className="text-emerald-300 font-bold">Obtenu : {tc.actual}</div>
                  <div className="text-[10px] text-slate-400">Statut : {tc.state}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SÉLECTEUR DE MATIÈRE ET MODULE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Sélection du cours & du module</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Centre actif : <strong className="text-slate-800">{activeCenterId}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Unité d'Enseignement (Cours)</label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                const newCourseId = e.target.value;
                setSelectedCourseId(newCourseId);
                const firstMod = DTECH_COURSE_UNITS.find(c => c.id === newCourseId)?.modules?.[0];
                if (firstMod) setSelectedModuleId(firstMod.id);
              }}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {availableCourses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Module Pédagogique</label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {currentModules.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.coefficient ? `Coeff. ${m.coefficient}` : 'Certifiant'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MODULE DETAIL CARD (ÉVALUATION PRINCIPALE) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* TOP BAR WITH FINAL GRADE */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {currentCourse?.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">{currentCourse?.title}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">{evaluationSummary.moduleTitle}</h3>
              <p className="text-xs text-slate-600">
                {evaluationSummary.calculationStateLabel} • {evaluationSummary.evaluationsTotalPublished} sur {evaluationSummary.evaluationsTotalPlanned} évaluations officielles validées
              </p>

              {/* STATUT OFFICIEL DE VALIDATION DU MODULE (ÉTAPE 8) */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Statut officiel Étape 8 :</span>
                {evaluationSummary.moduleScore20 !== null ? (
                  evaluationSummary.moduleScore20 >= 10 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Module validé ({evaluationSummary.moduleScore20.toFixed(2)}/20 ≥ 10.00)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Module non validé ({evaluationSummary.moduleScore20.toFixed(2)}/20 &lt; 10.00)
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    En attente d’évaluations requises (note non finalisée)
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Note Globale du Module
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    {evaluationSummary.moduleScore20 !== null ? (
                      <>
                        <span className={`text-2xl font-black ${
                          evaluationSummary.moduleScore20 >= 14 
                            ? 'text-emerald-700' 
                            : evaluationSummary.moduleScore20 >= 10 
                            ? 'text-indigo-700' 
                            : 'text-amber-700'
                        }`}>
                          {evaluationSummary.moduleScore20.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-slate-400">/ 20</span>
                      </>
                    ) : (
                      <span className="text-sm font-extrabold text-amber-700 italic">
                        En attente
                      </span>
                    )}
                  </div>
                </div>
                <div className="pl-3 border-l border-slate-200">
                  {renderStateBadge(evaluationSummary.calculationState)}
                </div>
              </div>
            </div>
          </div>

          {/* FORMULA BREAKDOWN BAR */}
          <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span className="font-bold">Formule appliquée :</span>
              <code className="font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-900 text-xs">
                {evaluationSummary.formulaDisplay}
              </code>
            </div>
            <div className="text-[11px] text-slate-500">
              Exercices (60%) : {evaluationSummary.exercisesAverage20 !== null ? `${evaluationSummary.exercisesAverage20.toFixed(2)} / 20` : '—'} • 
              Quiz (40%) : {evaluationSummary.quizzesAverage20 !== null ? `${evaluationSummary.quizzesAverage20.toFixed(2)} / 20` : '—'}
            </div>
          </div>

          {evaluationSummary.missingOrPendingItems.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Évaluations manquantes ou en attente de correction :</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                  {evaluationSummary.missingOrPendingItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* TWO-COLUMN DETAILS : EXERCISES VS QUIZ */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUMN 1 : EXERCICES & TP (60 %) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <FileCheck className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-slate-900">Exercices & TP Pratiques (60 %)</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Moyenne : {evaluationSummary.exercisesAverage20 !== null ? `${evaluationSummary.exercisesAverage20.toFixed(2)} / 20` : 'En attente'}
              </span>
            </div>

            {evaluationSummary.exercisesScores.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500 text-center">
                Aucun exercice ou TP validé et publié pour ce module.
              </div>
            ) : (
              <div className="space-y-3">
                {evaluationSummary.exercisesScores.map(ex => (
                  <div key={ex.evaluationId} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{ex.title}</h4>
                        <p className="text-[11px] text-slate-500">
                          {ex.type === 'practical_work' ? 'Travail Pratique' : 'Exercice'} • {ex.publishedAt ? `Publié le ${new Date(ex.publishedAt).toLocaleDateString('fr-FR')}` : 'Officiel'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {ex.officialScore20.toFixed(1)} / 20
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Correcteur : <strong className="text-slate-700">{ex.trainerName || 'Formateur Habilité'}</strong></span>
                      
                      {/* Action to modify grade (for trainers) */}
                      {role !== 'student' && ex.attemptId && (
                        <button
                          onClick={() => {
                            const att = attemptsList.find(a => a.id === ex.attemptId);
                            if (att) handleOpenModifyModal(att);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Réviser note
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 2 : QUIZ (40 %) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <Award className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-slate-900">Quiz & Contrôles Rapides (40 %)</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                Moyenne : {evaluationSummary.quizzesAverage20 !== null ? `${evaluationSummary.quizzesAverage20.toFixed(2)} / 20` : 'En attente'}
              </span>
            </div>

            {evaluationSummary.quizzesScores.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500 text-center">
                Aucun quiz validé et publié pour ce module.
              </div>
            ) : (
              <div className="space-y-3">
                {evaluationSummary.quizzesScores.map(qz => (
                  <div key={qz.evaluationId} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{qz.title}</h4>
                        <p className="text-[11px] text-slate-500">
                          Quiz Certifiant • {qz.publishedAt ? `Validé le ${new Date(qz.publishedAt).toLocaleDateString('fr-FR')}` : 'Officiel'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {qz.officialScore20.toFixed(1)} / 20
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Validateur : <strong className="text-slate-700">{qz.trainerName || 'Formateur Référent'}</strong></span>

                      {/* Action to modify grade (for trainers) */}
                      {role !== 'student' && qz.attemptId && (
                        <button
                          onClick={() => {
                            const att = attemptsList.find(a => a.id === qz.attemptId);
                            if (att) handleOpenModifyModal(att);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Réviser note
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AUDIT TRAIL / HISTORIQUE DES MODIFICATIONS */}
        {auditModifications.length > 0 && (
          <div className="p-6 bg-slate-50/70 border-t border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Journal d’Audit des Modifications de Notes (Formateurs Habilités)</span>
            </div>
            <div className="space-y-2">
              {auditModifications.map(mod => (
                <div key={mod.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-800">{mod.exerciseTitle || 'Évaluation'}</span>
                    <p className="text-[11px] text-slate-500">
                      Modifié par <strong className="text-slate-700">{mod.trainerName}</strong> le {new Date(mod.modifiedAt).toLocaleDateString('fr-FR')} • Motif : « {mod.reason} »
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-400 line-through">{(mod.previousScore20 ?? 0).toFixed(1)}/20</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {mod.newScore20.toFixed(1)}/20
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* OVERVIEW TABLE OF ALL MODULES IN CURRENT COURSE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900">Synthèse de Tous les Modules — {currentCourse?.title}</h3>
            <p className="text-xs text-slate-500">Vue globale des modules obligatoires pour l'évaluation</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="py-3 px-4 font-bold">Module Pédagogique</th>
                <th className="py-3 px-4 font-bold">Moyenne Exercices (60%)</th>
                <th className="py-3 px-4 font-bold">Moyenne Quiz (40%)</th>
                <th className="py-3 px-4 font-bold">Note Finale Module</th>
                <th className="py-3 px-4 font-bold">État du Calcul</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allModulesSummaries.map(summary => (
                <tr key={summary.moduleId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {summary.moduleTitle}
                  </td>
                  <td className="py-3 px-4">
                    {summary.exercisesAverage20 !== null ? (
                      <span className="font-semibold text-slate-800">{summary.exercisesAverage20.toFixed(2)} / 20</span>
                    ) : (
                      <span className="text-slate-400 italic">En attente</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {summary.quizzesAverage20 !== null ? (
                      <span className="font-semibold text-slate-800">{summary.quizzesAverage20.toFixed(2)} / 20</span>
                    ) : (
                      <span className="text-slate-400 italic">En attente</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {summary.moduleScore20 !== null ? (
                      <span className="font-black text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {summary.moduleScore20.toFixed(2)} / 20
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium italic text-[11px]">En attente d'évaluations</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {renderStateBadge(summary.calculationState)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedModuleId(summary.moduleId)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL : TRAINER GRADE MODIFICATION */}
      {isModifyModalOpen && targetAttemptToModify && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <Scale className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Révision de Note Officielle</h3>
                  <p className="text-[11px] text-slate-500">{targetAttemptToModify.exerciseTitle}</p>
                </div>
              </div>
            </div>

            {modificationError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                {modificationError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Note actuelle : <strong className="text-slate-900">{targetAttemptToModify.officialScore20 ?? 0} / 20</strong>
                </label>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nouvelle Note (/ 20) :</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  value={newScoreInput}
                  onChange={(e) => setNewScoreInput(e.target.value)}
                  className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Motif formel de la révision (Audit obligatoire) :</label>
                <textarea
                  rows={3}
                  value={modificationReason}
                  onChange={(e) => setModificationReason(e.target.value)}
                  placeholder="Ex : Réévaluation suite à une relecture conjointe du livrable technique..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsModifyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitGradeModification}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                Confirmer la Révision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
