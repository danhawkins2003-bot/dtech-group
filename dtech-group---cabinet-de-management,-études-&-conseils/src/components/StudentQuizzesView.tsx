import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Eye,
  Award,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Check,
  ChevronRight,
  Layers,
  FileCheck
} from 'lucide-react';
import { Quiz, QuizSubmission, QuizQuestion } from '../types';
import { dtechApiService } from '../services/dtechApiService';

interface StudentQuizzesViewProps {
  studentProfile?: any;
  onRefresh?: () => Promise<void>;
}

export const StudentQuizzesView: React.FC<StudentQuizzesViewProps> = ({
  studentProfile
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vue active : 'list' | 'take' | 'view_submission'
  const [viewState, setViewState] = useState<'list' | 'take' | 'view_submission'>('list');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmission | null>(null);

  // Formulaire de passage de Quiz
  const [studentAnswers, setStudentAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'PENDING' | 'PUBLISHED'>('ALL');

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dtechApiService.getStudentQuizzes();
      if (res.status === 'success') {
        setQuizzes(res.quizzes || []);
        setSubmissions(res.submissions || []);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger vos quiz.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const getQuizSubmission = (quizId: string) => {
    return submissions.find(s => s.quizId === quizId);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    // Initialiser les réponses vides
    const initial: Record<string, any> = {};
    quiz.questions.forEach(q => {
      if (q.type === 'MULTI_SELECT') initial[q.id] = [];
      else if (q.type === 'ASSOCIATION') initial[q.id] = {};
      else if (q.type === 'ORDERING') initial[q.id] = q.orderingItems ? [...q.orderingItems] : [];
      else initial[q.id] = '';
    });
    setStudentAnswers(initial);
    setViewState('take');
  };

  const handleViewSubmission = (sub: QuizSubmission) => {
    setSelectedSubmission(sub);
    const quiz = quizzes.find(q => q.id === sub.quizId);
    if (quiz) setSelectedQuiz(quiz);
    setViewState('view_submission');
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return;

    // Vérifier si toutes les questions ont une réponse saisie
    const unansweredCount = selectedQuiz.questions.filter(q => {
      const ans = studentAnswers[q.id];
      if (ans === undefined || ans === null) return true;
      if (typeof ans === 'string' && ans.trim() === '') return true;
      if (Array.isArray(ans) && ans.length === 0) return true;
      if (q.type === 'ASSOCIATION' && Object.keys(ans).length < (q.associationPairs?.length || 0)) return true;
      return false;
    }).length;

    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `Attention : Vous n'avez pas encore répondu à ${unansweredCount} question(s).\n\nSouhaitez-vous soumettre définitivement votre quiz pour évaluation par votre formateur ?`
      );
      if (!confirmSubmit) return;
    } else {
      const confirmSubmit = window.confirm(
        "Confirmez-vous la soumission de vos réponses ?\n\nConformément au règlement officiel DTech Group, votre copie sera transmise à votre formateur habilité pour saisie manuelle des points. Aucun résultat automatique ne sera attribué."
      );
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      const formattedAnswers = selectedQuiz.questions.map(q => ({
        questionId: q.id,
        studentAnswer: studentAnswers[q.id]
      }));

      const res = await dtechApiService.submitStudentQuiz(selectedQuiz.id, formattedAnswers);
      setSubmitSuccessMsg(res.message || 'Quiz soumis — Résultat en attente de validation par votre formateur.');
      await loadQuizzes();
      setViewState('list');
      setSelectedQuiz(null);
    } catch (err: any) {
      alert(`Erreur lors de la soumission : ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Gestion des réponses selon le type de question
  const handleSingleSelect = (questionId: string, option: string) => {
    setStudentAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleMultiSelectToggle = (questionId: string, option: string) => {
    setStudentAnswers(prev => {
      const current: string[] = prev[questionId] || [];
      const updated = current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleAssociationMatch = (questionId: string, pairId: string, value: string) => {
    setStudentAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [pairId]: value
      }
    }));
  };

  const handleMoveOrderItem = (questionId: string, index: number, direction: 'up' | 'down') => {
    setStudentAnswers(prev => {
      const items: string[] = [...(prev[questionId] || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, [questionId]: items };
    });
  };

  // Filtrage des quiz affichés
  const filteredQuizzes = quizzes.filter(q => {
    const sub = getQuizSubmission(q.id);
    if (statusFilter === 'TODO') return !sub;
    if (statusFilter === 'PENDING') return sub && !sub.trainerValidation;
    if (statusFilter === 'PUBLISHED') return sub && sub.trainerValidation && sub.status === 'published';
    return true;
  });

  return (
    <div className="space-y-6" id="student-quizzes-view">
      {/* Bannière d'en-tête */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-950 text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200 mb-3 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            MOTEUR DES QUIZ — DTECH GROUP / IS DELXIA
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Mes Quiz Pédagogiques Officiels
          </h1>
          <p className="text-teal-100 text-sm md:text-base leading-relaxed">
            Consultez les quiz de vos modules de formation. Chaque soumission est enregistrée puis transmise à votre formateur référent pour saisie manuelle des points et publication du résultat officiel.
          </p>
          
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-teal-200">
            <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md border border-white/5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              Évaluation humaine exclusive
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md border border-white/5">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              Résultats officiels certifiés /20
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md border border-white/5">
              <BookOpen className="w-3.5 h-3.5 text-blue-300" />
              Poids dans le module : 40% Quiz / 60% TP
            </span>
          </div>
        </div>
      </div>

      {submitSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">{submitSuccessMsg}</p>
              <p className="text-xs text-emerald-700">Votre formateur habilité procèdera prochainement à la saisie manuelle de vos points.</p>
            </div>
          </div>
          <button
            onClick={() => setSubmitSuccessMsg(null)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-3 py-1 bg-emerald-100 rounded-lg"
          >
            Fermer
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 1 : LISTE DES QUIZ */}
      {/* ========================================================================= */}
      {viewState === 'list' && (
        <div className="space-y-6">
          {/* Filtres d'état */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtrer par statut :</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tous ({quizzes.length})
                </button>
                <button
                  onClick={() => setStatusFilter('TODO')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'TODO' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  À passer ({quizzes.filter(q => !getQuizSubmission(q.id)).length})
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  En attente ({submissions.filter(s => !s.trainerValidation).length})
                </button>
                <button
                  onClick={() => setStatusFilter('PUBLISHED')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'PUBLISHED' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Résultats publiés ({submissions.filter(s => s.trainerValidation && s.status === 'published').length})
                </button>
              </div>
            </div>

            <button
              onClick={loadQuizzes}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent mb-3" />
              <p className="text-sm font-medium">Chargement de vos quiz officiels...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="font-semibold text-sm">{error}</p>
              <button
                onClick={loadQuizzes}
                className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-900 px-4 py-1.5 rounded-lg font-medium"
              >
                Réessayer
              </button>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 mb-1">Aucun quiz disponible</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Aucun quiz officiel ne correspond au filtre sélectionné pour votre centre et groupe d'études.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredQuizzes.map(quiz => {
                const submission = getQuizSubmission(quiz.id);
                const isSubmitted = !!submission;
                const isPublished = isSubmitted && submission.trainerValidation && submission.status === 'published';
                const isPending = isSubmitted && !isPublished;

                return (
                  <div
                    key={quiz.id}
                    id={`quiz-card-${quiz.id}`}
                    className="bg-white rounded-xl border border-slate-200 hover:border-teal-300 p-5 shadow-sm transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge statut */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-semibold tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                          {quiz.courseUnitCode} • {quiz.moduleTitle}
                        </span>

                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Résultat officiel publié
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Résultat en attente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            Quiz à passer
                          </span>
                        )}
                      </div>

                      {/* Titre & Description */}
                      <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-snug">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                        {quiz.description || quiz.generalInstructions}
                      </p>

                      {/* Métadonnées */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Durée : {quiz.durationMinutes} min</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>Questions : {quiz.questions.length}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          <span>Barème total : {quiz.totalMaxPoints} pts</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Clôture : {new Date(quiz.closingDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pied de carte avec action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      {isPublished ? (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs text-slate-500 block">Note officielle :</span>
                            <span className="text-lg font-bold text-emerald-600 leading-none">
                              {submission.officialScore20?.toFixed(1)} / 20
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewSubmission(submission)}
                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Consulter le détail
                          </button>
                        </div>
                      ) : isPending ? (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-xs text-amber-700 italic">
                            Évaluation manuelle en cours
                          </span>
                          <button
                            onClick={() => handleViewSubmission(submission)}
                            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-2 rounded-lg border border-amber-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Voir ma copie
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
                        >
                          <span>Passer le quiz</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : PASSAGE D'UN QUIZ */}
      {/* ========================================================================= */}
      {viewState === 'take' && selectedQuiz && (
        <div className="space-y-6" id="quiz-taking-container">
          {/* Barre supérieure */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Voulez-vous quitter ce quiz ? Vos réponses saisies seront perdues.')) {
                  setViewState('list');
                  setSelectedQuiz(null);
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour à la liste des quiz
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                {selectedQuiz.questions.length} questions au total
              </span>
              <span className="text-xs bg-teal-50 text-teal-800 font-semibold px-2.5 py-1 rounded-full border border-teal-200">
                {selectedQuiz.totalMaxPoints} points barème
              </span>
            </div>
          </div>

          {/* Avertissement solennel sur l'absence de correction automatique */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold text-sm text-amber-950 mb-0.5">Règlement des Quiz — Évaluation exclusivement humaine</p>
                <p>
                  Lorsque vous validerez ce quiz, vos réponses seront instantanément enregistrées avec le statut <strong>« Résultat en attente »</strong>. Aucun résultat automatique ne sera calculé par le système. Votre formateur habilité <strong>{selectedQuiz.trainerName}</strong> consultera l'intégralité de vos réponses pour attribuer manuellement les points avant publication de votre note officielle certifiée.
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire des questions */}
          <div className="space-y-6">
            {selectedQuiz.questions.map((q, idx) => (
              <div
                key={q.id}
                id={`quiz-question-${q.id}`}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Question {idx + 1} • {q.type}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    {q.maxPoints} {q.maxPoints > 1 ? 'points' : 'point'}
                  </span>
                </div>

                <h4 className="text-sm md:text-base font-semibold text-slate-900 leading-snug">
                  {q.prompt}
                </h4>

                {q.instructions && (
                  <p className="text-xs text-slate-500 italic">
                    {q.instructions}
                  </p>
                )}

                {/* 1. QCM (Choix unique) */}
                {q.type === 'QCM' && q.options && (
                  <div className="space-y-2 pt-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = studentAnswers[q.id] === opt;
                      return (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-xs md:text-sm font-medium cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-teal-50 border-teal-400 text-teal-950 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            checked={isSelected}
                            onChange={() => handleSingleSelect(q.id, opt)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 2. MULTI_SELECT (Choix multiples) */}
                {q.type === 'MULTI_SELECT' && q.options && (
                  <div className="space-y-2 pt-2">
                    {q.options.map((opt, oIdx) => {
                      const selectedList: string[] = studentAnswers[q.id] || [];
                      const isChecked = selectedList.includes(opt);
                      return (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-xs md:text-sm font-medium cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-teal-50 border-teal-400 text-teal-950 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleMultiSelectToggle(q.id, opt)}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 3. TRUE_FALSE (Vrai / Faux) */}
                {q.type === 'TRUE_FALSE' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {['Vrai', 'Faux'].map(choice => {
                      const isSelected = studentAnswers[q.id] === choice;
                      return (
                        <button
                          type="button"
                          key={choice}
                          onClick={() => handleSingleSelect(q.id, choice)}
                          className={`p-3 rounded-lg border text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                            isSelected
                              ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 4. ASSOCIATION (Paires à relier) */}
                {q.type === 'ASSOCIATION' && q.associationPairs && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-slate-500 font-medium">Sélectionnez la correspondance exacte pour chaque élément :</p>
                    <div className="space-y-2">
                      {q.associationPairs.map(pair => {
                        const currentChoice = (studentAnswers[q.id] || {})[pair.id] || '';
                        return (
                          <div
                            key={pair.id}
                            className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 items-center"
                          >
                            <span className="text-xs md:text-sm font-semibold text-slate-800">
                              {pair.left}
                            </span>
                            <select
                              value={currentChoice}
                              onChange={(e) => handleAssociationMatch(q.id, pair.id, e.target.value)}
                              className="text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            >
                              <option value="">-- Choisir la correspondance --</option>
                              {q.associationPairs?.map(p => (
                                <option key={p.id} value={p.right}>
                                  {p.right}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. ORDERING (Mettre dans l'ordre) */}
                {q.type === 'ORDERING' && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-slate-500 font-medium">Utilisez les boutons pour réordonner les étapes du début (1) à la fin :</p>
                    <div className="space-y-2">
                      {((studentAnswers[q.id] as string[]) || []).map((item, oIdx, arr) => (
                        <div
                          key={oIdx}
                          className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
                              {oIdx + 1}
                            </span>
                            <span className="text-xs md:text-sm font-medium text-slate-800">
                              {item}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={oIdx === 0}
                              onClick={() => handleMoveOrderItem(q.id, oIdx, 'up')}
                              className="p-1 rounded bg-white border border-slate-300 text-xs text-slate-600 disabled:opacity-30 hover:bg-slate-100"
                              title="Monter"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={oIdx === arr.length - 1}
                              onClick={() => handleMoveOrderItem(q.id, oIdx, 'down')}
                              className="p-1 rounded bg-white border border-slate-300 text-xs text-slate-600 disabled:opacity-30 hover:bg-slate-100"
                              title="Descendre"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. SHORT_ANSWER (Réponse courte) */}
                {q.type === 'SHORT_ANSWER' && (
                  <div className="pt-2">
                    <input
                      type="text"
                      value={studentAnswers[q.id] || ''}
                      onChange={(e) => setStudentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Saisissez votre réponse ici..."
                      className="w-full text-xs md:text-sm p-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* 7. LONG_ANSWER (Réponse développée) */}
                {q.type === 'LONG_ANSWER' && (
                  <div className="pt-2">
                    <textarea
                      rows={5}
                      value={studentAnswers[q.id] || ''}
                      onChange={(e) => setStudentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Développez votre argumentation avec soin..."
                      className="w-full text-xs md:text-sm p-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bouton de soumission officiel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-700">Prêt à soumettre votre Quiz ?</p>
              <p className="text-[11px] text-slate-500">Votre travail sera horodaté et sécurisé dans votre dossier d'évaluation.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Annuler le passage du quiz ? Vos saisies seront effacées.')) {
                    setViewState('list');
                    setSelectedQuiz(null);
                  }
                }}
                className="w-1/2 md:w-auto text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitQuiz}
                className="w-1/2 md:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Enregistrement...' : 'Soumettre mes réponses'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 3 : CONSULTATION DE LA COPIE ET DU RÉSULTAT */}
      {/* ========================================================================= */}
      {viewState === 'view_submission' && selectedSubmission && (
        <div className="space-y-6" id="submission-detail-view">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <button
              onClick={() => {
                setViewState('list');
                setSelectedSubmission(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour aux quiz
            </button>

            <span className="text-xs text-slate-500">
              Soumis le {new Date(selectedSubmission.submittedAt).toLocaleDateString('fr-FR')} à {new Date(selectedSubmission.submittedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* En-tête de la soumission avec statut */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div>
                <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 mb-2 inline-block">
                  {selectedSubmission.courseUnitCode} • {selectedSubmission.courseUnitTitle}
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedSubmission.quizTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Étudiant : <span className="font-semibold text-slate-800">{selectedSubmission.studentName}</span> ({selectedSubmission.studentNumber}) • Centre : {selectedSubmission.centerName}
                </p>
              </div>

              {/* État de validation */}
              <div className="text-right">
                {selectedSubmission.trainerValidation && selectedSubmission.status === 'published' ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-right">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Note officielle certifiée
                    </span>
                    <span className="text-3xl font-extrabold text-emerald-700">
                      {selectedSubmission.officialScore20?.toFixed(1)} <span className="text-sm font-semibold text-emerald-900">/ 20</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-1">
                      Validé par {selectedSubmission.validatedByTrainerName || 'Formateur DTech'}
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-right">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                      Résultat en attente
                    </span>
                    <span className="text-sm font-semibold text-amber-700 block mt-1">
                      Saisie manuelle des points en cours
                    </span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">
                      Aucune note automatique générée
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Commentaire général si publié */}
            {selectedSubmission.trainerValidation && selectedSubmission.generalComment && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Appréciation générale du formateur :
                </h4>
                <p className="text-xs text-slate-700 italic">
                  « {selectedSubmission.generalComment} »
                </p>
              </div>
            )}

            {/* Détail question par question */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Détail de votre copie
              </h3>

              {selectedSubmission.answers.map((ans, aIdx) => (
                <div
                  key={ans.questionId}
                  className="bg-slate-50/60 rounded-xl border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center">
                        {aIdx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {ans.questionType}
                      </span>
                    </div>

                    {selectedSubmission.trainerValidation ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {ans.attributedPoints ?? 0} / {ans.maxPoints} pts
                      </span>
                    ) : (
                      <span className="text-xs text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        Points à saisir par le formateur (max : {ans.maxPoints} pts)
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-800">
                    {ans.questionPrompt}
                  </p>

                  {/* Réponse fournie par l'étudiant */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                    <span className="text-slate-400 font-medium block text-[10px] uppercase mb-1">Votre réponse enregistrée :</span>
                    {ans.questionType === 'ASSOCIATION' && typeof ans.studentAnswer === 'object' && ans.studentAnswer !== null ? (
                      <div className="space-y-1">
                        {Object.entries(ans.studentAnswer).map(([pId, val]) => (
                          <div key={pId} className="flex items-center gap-2 text-slate-800 font-medium">
                            <span className="text-teal-700">●</span>
                            <span>{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    ) : Array.isArray(ans.studentAnswer) ? (
                      <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium">
                        {ans.studentAnswer.map((item, i) => (
                          <li key={i}>{String(item)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-800 font-medium whitespace-pre-wrap">
                        {String(ans.studentAnswer || '(Aucune réponse saisie)')}
                      </p>
                    )}
                  </div>

                  {/* Annotation formateur si publiée */}
                  {selectedSubmission.trainerValidation && ans.trainerComment && (
                    <div className="text-[11px] text-teal-900 bg-teal-50/80 p-2.5 rounded-lg border border-teal-200/60">
                      <span className="font-bold">Observation du formateur : </span>
                      <span>{ans.trainerComment}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
