import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Check, 
  Award, 
  UploadCloud, 
  FileCheck, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Eye, 
  CheckSquare, 
  XCircle, 
  Sparkles, 
  AlertTriangle, 
  ChevronRight,
  BookOpen,
  Filter,
  Search,
  CheckCircle,
  FileBadge,
  Send,
  HelpCircle,
  File,
  ShieldCheck
} from 'lucide-react';
import { Exercise, ExerciseAttempt, ExerciseQuestion } from '../types';
import { dtechApiService } from '../services/dtechApiService';

interface StudentExercisesViewProps {
  exercises: Exercise[];
  attempts: ExerciseAttempt[];
  studentProfile: any;
  onRefresh?: () => Promise<void>;
}

export const StudentExercisesView: React.FC<StudentExercisesViewProps> = ({
  exercises,
  attempts,
  studentProfile,
  onRefresh
}) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<ExerciseAttempt | null>(null);
  const [isTakingExercise, setIsTakingExercise] = useState(false);
  const [viewingResults, setViewingResults] = useState(false);

  // Filtres
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'PENDING_CORRECTION' | 'GRADED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // État du formulaire lors du passage d'un exercice
  const [answersState, setAnswersState] = useState<Record<string, string>>({});
  const [uploadedFilesState, setUploadedFilesState] = useState<Record<string, { name: string; size: string; url?: string }>>({});
  const [startedAt, setStartedAt] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  // Cours uniques disponibles
  const availableCourses = useMemo(() => {
    const map = new Map<string, string>();
    exercises.forEach(e => {
      if (e.courseUnitId && e.courseTitle) {
        map.set(e.courseUnitId, `${e.courseCode} - ${e.courseTitle}`);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [exercises]);

  // Récupérer la dernière tentative pour chaque exercice
  const attemptsByExerciseId = useMemo(() => {
    const map = new Map<string, ExerciseAttempt>();
    attempts.forEach(att => {
      const existing = map.get(att.exerciseId);
      if (!existing || new Date(att.submittedAt) > new Date(existing.submittedAt)) {
        map.set(att.exerciseId, att);
      }
    });
    return map;
  }, [attempts]);

  // Filtrage des exercices
  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      // Filtre de cours
      if (courseFilter !== 'ALL' && ex.courseUnitId !== courseFilter) return false;

      // Filtre de statut
      const latestAttempt = attemptsByExerciseId.get(ex.id);
      if (statusFilter === 'TODO' && latestAttempt) return false;
      if (statusFilter === 'PENDING_CORRECTION' && (!latestAttempt || latestAttempt.trainerValidation)) return false;
      if (statusFilter === 'GRADED' && (!latestAttempt || !latestAttempt.trainerValidation)) return false;

      // Recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ex.title.toLowerCase().includes(q);
        const matchesCourse = ex.courseTitle.toLowerCase().includes(q) || ex.courseCode.toLowerCase().includes(q);
        const matchesModule = ex.moduleTitle.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCourse && !matchesModule) return false;
      }

      return true;
    });
  }, [exercises, courseFilter, statusFilter, searchQuery, attemptsByExerciseId]);

  // Lancement d'un exercice
  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setAnswersState({});
    setUploadedFilesState({});
    setStartedAt(new Date().toISOString());
    setIsTakingExercise(true);
    setViewingResults(false);
    setSubmissionFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Consultation d'une copie / résultats
  const handleViewResults = (exercise: Exercise, attempt: ExerciseAttempt) => {
    setSelectedExercise(exercise);
    setActiveAttempt(attempt);
    setIsTakingExercise(false);
    setViewingResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gestion des réponses
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswersState(prev => ({ ...prev, [questionId]: value }));
  };

  // Simulation dépôt de fichier pour une question
  const handleFileDrop = (questionId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setUploadedFilesState(prev => ({
      ...prev,
      [questionId]: {
        name: file.name,
        size: `${sizeMB} MB`,
        url: `/documents/submissions/${file.name}`
      }
    }));
  };

  // Soumission finale de l'exercice
  const handleSubmitExercise = async () => {
    if (!selectedExercise) return;

    // Vérifier si toutes les questions obligatoires ont une réponse
    const unansweredCount = selectedExercise.questions.filter(q => {
      if (q.type === 'file_upload') {
        return !uploadedFilesState[q.id];
      }
      return !answersState[q.id] || answersState[q.id].trim() === '';
    }).length;

    if (unansweredCount > 0) {
      if (!window.confirm(`Il vous reste ${unansweredCount} question(s) sans réponse. Souhaitez-vous quand même valider votre soumission ?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      setSubmissionFeedback(null);

      const payloadAnswers = selectedExercise.questions.map(q => {
        if (q.type === 'file_upload') {
          const file = uploadedFilesState[q.id];
          return {
            questionId: q.id,
            studentAnswer: file ? `Fichier joint: ${file.name}` : '',
            fileName: file?.name,
            fileUrl: file?.url,
            fileSizeBytes: file?.size
          };
        }
        return {
          questionId: q.id,
          studentAnswer: answersState[q.id] || ''
        };
      });

      const response = await dtechApiService.submitStudentExercise(selectedExercise.id, {
        answers: payloadAnswers,
        startedAt
      });

      if (onRefresh) {
        await onRefresh();
      }

      setSubmissionFeedback({
        status: 'success',
        message: response.message || 'Exercice soumis avec succès !'
      });

      if (response.attempt) {
        setActiveAttempt(response.attempt);
        setIsTakingExercise(false);
        setViewingResults(true);
      }
    } catch (err: any) {
      setSubmissionFeedback({
        status: 'error',
        message: err.message || 'Erreur lors de la transmission de vos réponses.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================================
  // VUE 1 : INTERFACE DE PASSATION DE L'EXERCICE (PLAYER / TEST RUNNER)
  // ==========================================================================
  if (isTakingExercise && selectedExercise) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Barre d'entête de l'épreuve */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedExercise.courseCode}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {selectedExercise.moduleTitle}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-300">
                  {selectedExercise.questions.length} Questions
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{selectedExercise.title}</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">{selectedExercise.description}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/15">
                <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">Barème</span>
                <span className="text-lg font-black text-amber-400">/{selectedExercise.totalPoints} pts</span>
              </div>
              {selectedExercise.estimatedDurationMinutes && (
                <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/15">
                  <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">Durée estimée</span>
                  <span className="text-lg font-black text-slate-100">{selectedExercise.estimatedDurationMinutes} min</span>
                </div>
              )}
            </div>
          </div>

          {/* Consignes pédagogiques */}
          {selectedExercise.instructions && (
            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Consignes :</strong>
                {selectedExercise.instructions}
              </div>
            </div>
          )}
        </div>

        {/* Feedback d'erreur ou d'alerte */}
        {submissionFeedback && submissionFeedback.status === 'error' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{submissionFeedback.message}</span>
          </div>
        )}

        {/* Questions de l'exercice */}
        <div className="space-y-6">
          {selectedExercise.questions.map((question, index) => {
            const currentAnswer = answersState[question.id] || '';
            const currentFile = uploadedFilesState[question.id];

            return (
              <div 
                key={question.id} 
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all"
              >
                {/* En-tête de la question */}
                <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {question.type === 'qcm' && 'Question à Choix Multiples (QCM)'}
                      {question.type === 'true_false' && 'Vrai ou Faux'}
                      {question.type === 'short_answer' && 'Réponse Courte Directe'}
                      {question.type === 'long_answer' && 'Développement & Synthèse Pratique'}
                      {question.type === 'file_upload' && 'Dépôt de Fichier / Livrable Technique'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                    {question.points} {question.points > 1 ? 'points' : 'point'}
                  </span>
                </div>

                {/* Énoncé de la question */}
                <p className="text-base font-semibold text-slate-900 mb-5 leading-relaxed">
                  {question.prompt}
                </p>

                {/* 1. Rendu type QCM */}
                {question.type === 'qcm' && question.options && (
                  <div className="space-y-2.5">
                    {question.options.map((option, optIdx) => {
                      const isSelected = currentAnswer === option;
                      return (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 text-slate-950 font-medium shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            value={option}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(question.id, option)}
                            className="w-4 h-4 text-amber-500 border-slate-300 focus:ring-amber-400"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 2. Rendu type Vrai / Faux */}
                {question.type === 'true_false' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['Vrai', 'Faux'].map(option => {
                      const isSelected = currentAnswer === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleAnswerChange(question.id, option)}
                          className={`py-3.5 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. Rendu type Réponse courte */}
                {question.type === 'short_answer' && (
                  <div>
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={e => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Saisissez votre réponse ici..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Vérifiez l'orthographe et la syntaxe exacte de votre terme ou formule.
                    </span>
                  </div>
                )}

                {/* 4. Rendu type Réponse longue */}
                {question.type === 'long_answer' && (
                  <div>
                    <textarea
                      rows={4}
                      value={currentAnswer}
                      onChange={e => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Développez votre argumentation, analyse ou explication technique..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>Cette question sera annotée et corrigée par votre formateur en classe.</span>
                      <span>{currentAnswer.length} caractères</span>
                    </div>
                  </div>
                )}

                {/* 5. Rendu type Dépôt de fichier */}
                {question.type === 'file_upload' && (
                  <div>
                    {currentFile ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{currentFile.name}</p>
                            <p className="text-xs text-slate-500">Taille : {currentFile.size} • Fichier prêt pour soumission</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFilesState(prev => {
                              const next = { ...prev };
                              delete next[question.id];
                              return next;
                            });
                          }}
                          className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Remplacer
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-amber-50/20 transition-all cursor-pointer"
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                          e.preventDefault();
                          handleFileDrop(question.id, e.dataTransfer.files);
                        }}
                      >
                        <input
                          type="file"
                          id={`file_input_${question.id}`}
                          className="hidden"
                          onChange={e => handleFileDrop(question.id, e.target.files)}
                        />
                        <label htmlFor={`file_input_${question.id}`} className="cursor-pointer">
                          <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700">
                            Glissez-déposez votre document ici, ou <span className="text-amber-600 underline">parcourez vos dossiers</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Extensions autorisées : {question.allowedExtensions?.join(', ') || 'PDF, XLSX, DOCX, ZIP'} • Max {question.maxFileSizeMB || 10} MB
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Barre d'action finale */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Voulez-vous quitter cet exercice ? Vos réponses non soumises seront perdues.')) {
                setIsTakingExercise(false);
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer"
          >
            Abandonner & Retour
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmitExercise}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Correction & Envoi en cours...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Valider et Soumettre l'exercice</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VUE 2 : CONSULTATION D'UNE COPIE / RÉSULTATS DÉTAILLÉS
  // ==========================================================================
  if (viewingResults && selectedExercise && activeAttempt) {
    const isOfficiallyValidated = activeAttempt.trainerValidation === true;
    const officialScore = activeAttempt.officialScore20 ?? activeAttempt.score20 ?? 0;
    const isSuccess = officialScore >= 10;

    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Entête du rapport d'évaluation */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewingResults(false)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour à la liste des TPs
            </button>

            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
              isOfficiallyValidated
                ? (isSuccess ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30')
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isOfficiallyValidated ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Note Officielle Validée & Publiée
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  Copie soumise — En attente de correction par votre formateur
                </>
              )}
            </span>
          </div>

          {/* Bannière d'information si la copie est en attente de correction manuelle */}
          {!isOfficiallyValidated && (
            <div className="mb-6 p-4 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-bold block text-sm mb-1">
                  Copie enregistrée — Évaluation humaine exclusive
                </strong>
                <p className="text-slate-300 leading-relaxed">
                  Votre travail a bien été transmis. Conformément à la charte d'évaluation de DTech Group, la notation automatique est totalement proscrite : votre formateur vérifie personnellement vos réponses et livrables, attribue les points et publiera votre note officielle accompagnée de ses conseils pédagogiques.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>{selectedExercise.courseCode} — {selectedExercise.courseTitle}</span>
                <span>•</span>
                <span>{selectedExercise.moduleTitle}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{selectedExercise.title}</h2>
              <p className="text-xs text-slate-300 mt-2 flex flex-wrap items-center gap-3">
                <span>Soumis le {new Date(activeAttempt.submittedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                {isOfficiallyValidated && (activeAttempt.validatedByName || activeAttempt.gradedByName) && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Corrigé et validé par : <strong className="text-white">{activeAttempt.validatedByName || activeAttempt.gradedByName}</strong>
                    </span>
                  </>
                )}
                {!isOfficiallyValidated && (
                  <>
                    <span>•</span>
                    <span className="text-amber-300 italic flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      En attente de correction par le formateur
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Bloc Note Officielle */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[240px] text-center shrink-0">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Note Officielle
              </span>
              {isOfficiallyValidated ? (
                <>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-black ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {officialScore}
                    </span>
                    <span className="text-slate-400 text-lg font-bold">/ 20</span>
                  </div>
                  <span className="text-[11px] font-semibold mt-1 block">
                    {isSuccess ? (
                      <span className="text-emerald-300 font-bold">Exercice Validé (≥ 10/20)</span>
                    ) : (
                      <span className="text-rose-300 font-bold">Non Validé (&lt; 10/20)</span>
                    )}
                  </span>
                </>
              ) : (
                <div className="py-2">
                  <div className="text-lg font-black text-amber-300 flex items-center justify-center gap-1.5">
                    <Clock className="w-5 h-5 text-amber-400" />
                    En attente de correction
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    La note sera communiquée après publication par votre formateur
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Traçabilité formateur / Journal d'audit si note validée et publiée */}
          {isOfficiallyValidated && (
            <div className="mt-5 p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-slate-300 leading-relaxed">
                <strong className="text-white font-bold block mb-0.5">Traçabilité de la correction officielle :</strong>
                Correcteur : <strong className="text-white">{activeAttempt.gradedByName || activeAttempt.validatedByName || 'Formateur DTech'}</strong> • 
                Date de validation : {activeAttempt.validatedAt ? new Date(activeAttempt.validatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Effectuée'} • 
                Date de publication : {activeAttempt.publishedAt ? new Date(activeAttempt.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Publiée'}
                {activeAttempt.officialScore !== undefined && activeAttempt.maxPoints && (
                  <span className="ml-2 font-mono text-emerald-300 font-bold">
                    ({activeAttempt.officialScore} / {activeAttempt.maxPoints} pts obtenus)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Feedback général du formateur */}
          {isOfficiallyValidated && activeAttempt.generalFeedback && (
            <div className="mt-5 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
                <Award className="w-4 h-4" />
                <span>Appréciation Générale du Formateur :</span>
              </div>
              <p className="text-sm text-slate-200 italic leading-relaxed">
                « {activeAttempt.generalFeedback} »
              </p>
            </div>
          )}
        </div>

        {/* Détail question par question */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-500" />
            <span>Détail des Réponses et Annotations</span>
          </h3>

          {activeAttempt.answers.map((ans, idx) => {
            const questionDef = selectedExercise.questions.find(q => q.id === ans.questionId);
            const displayPoints = ans.pointsEarned;
            const isFullyScored = displayPoints !== undefined && displayPoints === ans.pointsPossible;

            return (
              <div 
                key={ans.questionId}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {ans.questionType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isOfficiallyValidated ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        En attente de correction ({ans.pointsPossible} pts possibles)
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        isFullyScored ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Points formateur : {displayPoints ?? 0} / {ans.pointsPossible} pts
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-bold text-slate-900 mb-3">{ans.questionPrompt}</p>

                {/* Réponse fournie par l'étudiant */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Votre réponse :</span>
                  {ans.fileName ? (
                    <div className="flex items-center gap-2 text-sm text-slate-800 font-semibold">
                      <File className="w-4 h-4 text-amber-600" />
                      <span>{ans.fileName} ({ans.fileSizeBytes})</span>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-900 whitespace-pre-wrap">{ans.studentAnswer || '(Aucune réponse fournie)'}</p>
                  )}
                </div>

                {/* Explication pédagogique uniquement après validation officielle */}
                {isOfficiallyValidated && questionDef?.explanation && (
                  <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 mb-2">
                    <strong className="block mb-0.5">Explication pédagogique :</strong>
                    {questionDef.explanation}
                  </div>
                )}

                {/* Commentaire personnalisé du formateur */}
                {isOfficiallyValidated && ans.trainerComment && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Remarque du formateur :</strong> {ans.trainerComment}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bouton retour */}
        <div className="flex justify-start">
          <button
            onClick={() => setViewingResults(false)}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à mes exercices
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VUE 3 : LISTE DES EXERCICES ET TRAVAUX PRATIQUES (PAGE PRINCIPALE)
  // ==========================================================================
  return (
    <div className="space-y-6">
      {/* Bannière de présentation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Pédagogie Pratique DTech
              </span>
              <span className="text-xs text-slate-300">
                {studentProfile.groupName}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Exercices & Travaux Pratiques</h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Consolidez vos compétences techniques par la pratique. Répondez aux QCM d'auto-évaluation et déposez vos livrables de TP pour correction en présentiel par vos formateurs.
            </p>
          </div>

          {/* Mini-statistiques */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
              <span className="text-2xl font-black text-amber-400">{exercises.length}</span>
              <span className="text-[11px] text-slate-300 block mt-0.5 font-medium">TPs Disponibles</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center min-w-[110px]">
              <span className="text-2xl font-black text-emerald-400">{attempts.length}</span>
              <span className="text-[11px] text-slate-300 block mt-0.5 font-medium">Soumissions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, matière, module..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Sélecteur de matière */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">Toutes les matières</option>
            {availableCourses.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Filtre de statut */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'TODO', label: 'À faire' },
            { id: 'PENDING_CORRECTION', label: 'En attente de correction' },
            { id: 'GRADED', label: 'Notes publiées' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des exercices */}
      {filteredExercises.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Aucun exercice trouvé</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || courseFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'Aucun exercice ne correspond à vos critères de recherche. Réinitialisez vos filtres.'
              : 'Votre formateur n\'a pas encore publié d\'exercices pour votre groupe.'}
          </p>
          {(searchQuery || courseFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCourseFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExercises.map(exercise => {
            const attempt = attemptsByExerciseId.get(exercise.id);
            const isOfficiallyValidated = attempt?.trainerValidation === true;
            const officialScore = attempt?.officialScore20 ?? attempt?.score20;

            return (
              <div 
                key={exercise.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Badge matière et statut */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                      {exercise.courseCode} • {exercise.moduleTitle}
                    </span>

                    {/* Statut de l'étudiant */}
                    {attempt ? (
                      isOfficiallyValidated ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                          (officialScore ?? 0) >= 10
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          <ShieldCheck className="w-3 h-3" /> Note officielle : {officialScore}/20
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> En attente de correction
                        </span>
                      )
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        À faire
                      </span>
                    )}
                  </div>

                  {/* Titre */}
                  <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug line-clamp-2">
                    {exercise.title}
                  </h4>

                  {/* Description courte */}
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {exercise.description}
                  </p>
                </div>

                <div>
                  {/* Méta informations */}
                  <div className="flex items-center justify-between text-xs text-slate-400 py-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-600">
                      {exercise.questions.length} questions • /{exercise.totalPoints} pts
                    </span>
                    {exercise.dueDate && (
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        Échéance : {new Date(exercise.dueDate).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div className="pt-2">
                    {attempt ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewResults(exercise, attempt)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Voir ma copie</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartExercise(exercise)}
                          className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Recommencer</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartExercise(exercise)}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <span>Démarrer l'exercice</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
