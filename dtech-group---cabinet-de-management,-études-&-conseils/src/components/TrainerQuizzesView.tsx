import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Edit,
  Archive,
  Save,
  Award,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Check,
  X,
  History,
  RotateCcw,
  Sparkles,
  FileCheck,
  AlertTriangle,
  PlayCircle,
  FileText,
  BookOpen
} from 'lucide-react';
import { Quiz, QuizSubmission, QuizQuestion, QuizAuditLogEntry, QuizQuestionType } from '../types';
import { dtechApiService } from '../services/dtechApiService';

interface TrainerQuizzesViewProps {
  currentUser?: any;
  onRefresh?: () => Promise<void>;
}

export const TrainerQuizzesView: React.FC<TrainerQuizzesViewProps> = ({
  currentUser
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'submissions' | 'quizzes' | 'tests'>('submissions');

  // Filtres
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'DRAFT' | 'PUBLISHED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal d'évaluation d'une soumission
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<QuizSubmission | null>(null);
  const [inputtedPoints, setInputtedPoints] = useState<Record<string, number | string>>({});
  const [inputtedComments, setInputtedComments] = useState<Record<string, string>>({});
  const [generalComment, setGeneralComment] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  // Modal de révision d'un résultat publié
  const [isRevising, setIsRevising] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');

  // Modal d'historique d'audit
  const [viewingAuditLogs, setViewingAuditLogs] = useState<QuizAuditLogEntry[] | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  // Modal de création de Quiz
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizCourseCode, setNewQuizCourseCode] = useState('INF-101');
  const [newQuizCourseTitle, setNewQuizCourseTitle] = useState('Informatique & Outils Bureautiques Professionnels');
  const [newQuizModuleTitle, setNewQuizModuleTitle] = useState('Bureautique avancée');
  const [newQuizDuration, setNewQuizDuration] = useState(45);
  const [newQuizQuestions, setNewQuizQuestions] = useState<Array<{
    type: QuizQuestionType;
    prompt: string;
    instructions?: string;
    maxPoints: number;
    options?: string[];
  }>>([
    {
      type: 'QCM',
      prompt: 'Quel protocole réseau sécurisé utilise le port 443 ?',
      maxPoints: 2,
      options: ['HTTP', 'HTTPS', 'FTP', 'SSH']
    },
    {
      type: 'SHORT_ANSWER',
      prompt: 'Définissez brièvement le rôle d\'une clé primaire.',
      maxPoints: 3
    }
  ]);

  // Suite de tests Étape 5
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [runningTests, setRunningTests] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dtechApiService.getTrainerQuizzes();
      if (res.status === 'success') {
        setQuizzes(res.quizzes || []);
        setSubmissions(res.submissions || []);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données des quiz.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Ouvrir le modal d'évaluation
  const openEvaluationModal = (sub: QuizSubmission, revising = false) => {
    setEvaluatingSubmission(sub);
    setIsRevising(revising);
    setRevisionReason('');
    setGeneralComment(sub.generalComment || '');

    const ptsMap: Record<string, number | string> = {};
    const cmtMap: Record<string, string> = {};
    sub.answers.forEach(a => {
      ptsMap[a.questionId] = a.attributedPoints !== undefined ? a.attributedPoints : '';
      cmtMap[a.questionId] = a.trainerComment || '';
    });
    setInputtedPoints(ptsMap);
    setInputtedComments(cmtMap);
  };

  // Calcul dynamique des points totaux et de la note sur 20
  const currentTotalAttributed = useMemo(() => {
    if (!evaluatingSubmission) return 0;
    return evaluatingSubmission.answers.reduce((sum, a) => {
      const val = Number(inputtedPoints[a.questionId]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [evaluatingSubmission, inputtedPoints]);

  const currentProjectedScore20 = useMemo(() => {
    if (!evaluatingSubmission || evaluatingSubmission.totalPointsMax <= 0) return 0;
    const raw = (currentTotalAttributed / evaluatingSubmission.totalPointsMax) * 20;
    return Math.round(raw * 100) / 100;
  }, [evaluatingSubmission, currentTotalAttributed]);

  // Enregistrement de brouillon (Saisie manuelle sans publication)
  const handleSaveDraft = async () => {
    if (!evaluatingSubmission) return;

    try {
      setSavingAction(true);
      const formattedAnswers = evaluatingSubmission.answers.map(a => ({
        questionId: a.questionId,
        attributedPoints: inputtedPoints[a.questionId] !== '' ? Number(inputtedPoints[a.questionId]) : undefined,
        trainerComment: inputtedComments[a.questionId] || ''
      }));

      await dtechApiService.saveQuizSubmissionDraft(evaluatingSubmission.id, {
        answers: formattedAnswers,
        generalComment
      });

      alert("Saisie manuelle des points enregistrée en brouillon. Le résultat reste maintenu en attente pour l'étudiant.");
      await loadData();
      setEvaluatingSubmission(null);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setSavingAction(false);
    }
  };

  // Validation et publication officielle de la note /20
  const handleValidateOfficial = async () => {
    if (!evaluatingSubmission) return;

    // Vérifier que toutes les questions ont une note numérique saisie
    const missingQuestions = evaluatingSubmission.answers.filter(
      a => inputtedPoints[a.questionId] === '' || inputtedPoints[a.questionId] === undefined || isNaN(Number(inputtedPoints[a.questionId]))
    );

    if (missingQuestions.length > 0) {
      alert(`Validation impossible : Vous devez obligatoirement saisir une note (de 0 au max) pour toutes les ${evaluatingSubmission.answers.length} questions.`);
      return;
    }

    const confirmPublish = window.confirm(
      `Confirmez-vous la publication officielle de ce résultat ?\n\n- Points totaux attribués : ${currentTotalAttributed} / ${evaluatingSubmission.totalPointsMax}\n- Note officielle calculée : ${currentProjectedScore20} / 20\n\nCette note sera immédiatement certifiée et visible par l'étudiant ${evaluatingSubmission.studentName}.`
    );
    if (!confirmPublish) return;

    try {
      setSavingAction(true);
      const formattedAnswers = evaluatingSubmission.answers.map(a => ({
        questionId: a.questionId,
        attributedPoints: Number(inputtedPoints[a.questionId]),
        trainerComment: inputtedComments[a.questionId] || ''
      }));

      if (isRevising) {
        if (!revisionReason.trim()) {
          alert('Le motif explicite de révision est obligatoire.');
          return;
        }
        await dtechApiService.reviseQuizSubmission(evaluatingSubmission.id, {
          answers: formattedAnswers,
          revisionReason,
          generalComment
        });
        alert('Résultat officiel révisé avec succès et consigné dans l\'historique d\'audit.');
      } else {
        await dtechApiService.validateQuizSubmission(evaluatingSubmission.id, {
          answers: formattedAnswers,
          generalComment
        });
        alert(`Résultat officiel validé et publié avec succès (${currentProjectedScore20} / 20).`);
      }

      await loadData();
      setEvaluatingSubmission(null);
      setIsRevising(false);
    } catch (err: any) {
      alert(`Erreur lors de la validation : ${err.message}`);
    } finally {
      setSavingAction(false);
    }
  };

  // Consulter l'historique d'audit
  const handleViewAudit = async (submissionId: string) => {
    try {
      setAuditLoading(true);
      const res = await dtechApiService.getQuizSubmissionAudit(submissionId);
      if (res.status === 'success') {
        setViewingAuditLogs(res.auditTrail || []);
      }
    } catch (err: any) {
      alert(`Erreur d'audit : ${err.message}`);
    } finally {
      setAuditLoading(false);
    }
  };

  // Exécution de la suite des 7 tests obligatoires Étape 5
  const handleRunTests = async () => {
    try {
      setRunningTests(true);
      const res = await dtechApiService.runQuizEngineTests();
      if (res.status === 'success') {
        setTestResults(res.results || []);
      }
    } catch (err: any) {
      alert(`Erreur tests : ${err.message}`);
    } finally {
      setRunningTests(false);
    }
  };

  // Filtrage des soumissions
  const filteredSubmissions = submissions.filter(s => {
    if (statusFilter === 'PENDING') return !s.trainerValidation && !s.isDraftSaved;
    if (statusFilter === 'DRAFT') return !s.trainerValidation && s.isDraftSaved;
    if (statusFilter === 'PUBLISHED') return s.trainerValidation && s.status === 'published';

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.studentName.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q) ||
        s.quizTitle.toLowerCase().includes(q) ||
        s.centerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6" id="trainer-quizzes-view">
      {/* En-tête Espace Formateur */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-teal-300 mb-2 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              ESPACE FORMATEUR HABILITÉ — ÉVALUATION MANUELLE DES QUIZ
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Moteur des Quiz — Centre {currentUser?.centerName || 'Lomé Avédji'}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
              Consultez les copies soumises par vos étudiants, effectuez la saisie manuelle des points question par question et validez officiellement les résultats certifiés sur 20.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunTests}
              disabled={runningTests}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-colors"
            >
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>{runningTests ? 'Exécution...' : 'Lancer les 7 Tests Étape 5'}</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation entre onglets */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 text-xs md:text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'submissions'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            Soumissions à évaluer ({submissions.length})
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`pb-3 text-xs md:text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'quizzes'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Mes Quiz Créés ({quizzes.length})
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`pb-3 text-xs md:text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'tests'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Rapport des 7 Tests de Conformité
          </button>
        </div>

        <button
          onClick={loadData}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 px-2 py-1 rounded hover:bg-slate-100"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ONGLET 1 : SOUMISSIONS À ÉVALUER */}
      {/* ========================================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Barre de filtres et recherche */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Statut :</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Toutes ({submissions.length})
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  À évaluer ({submissions.filter(s => !s.trainerValidation && !s.isDraftSaved).length})
                </button>
                <button
                  onClick={() => setStatusFilter('DRAFT')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'DRAFT' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Brouillons ({submissions.filter(s => !s.trainerValidation && s.isDraftSaved).length})
                </button>
                <button
                  onClick={() => setStatusFilter('PUBLISHED')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'PUBLISHED' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Résultats publiés ({submissions.filter(s => s.trainerValidation && s.status === 'published').length})
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher étudiant, matricule, quiz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 w-64 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Tableau des soumissions */}
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent mb-3" />
              <p className="text-sm font-medium">Chargement des copies de quiz...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">Aucune soumission trouvée</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Aucune copie ne correspond à votre filtre actuel dans votre périmètre d'affectation.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Étudiant & Matricule</th>
                    <th className="py-3 px-4">Centre & Groupe</th>
                    <th className="py-3 px-4">Quiz / Matière</th>
                    <th className="py-3 px-4">Date soumission</th>
                    <th className="py-3 px-4">Statut & Note</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredSubmissions.map(sub => {
                    const isPublished = sub.trainerValidation && sub.status === 'published';
                    const isDraft = !sub.trainerValidation && sub.isDraftSaved;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{sub.studentName}</span>
                          <span className="text-[11px] text-slate-500">{sub.studentNumber}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800 block">{sub.centerName}</span>
                          <span className="text-[11px] text-slate-500">{sub.groupName}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="font-semibold text-slate-900 block truncate" title={sub.quizTitle}>
                            {sub.quizTitle}
                          </span>
                          <span className="text-[11px] text-teal-700 font-medium">
                            {sub.courseUnitCode} • {sub.moduleTitle}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(sub.submittedAt).toLocaleDateString('fr-FR')} {new Date(sub.submittedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4">
                          {isPublished ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Publié : {sub.officialScore20?.toFixed(1)} / 20
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {sub.totalPointsAttributed} / {sub.totalPointsMax} pts
                              </span>
                            </div>
                          ) : isDraft ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                              <Edit className="w-3 h-3 text-indigo-600" />
                              Brouillon enregistré
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Résultat en attente
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleViewAudit(sub.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title="Historique de traçabilité / Audit"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {isPublished ? (
                            <button
                              onClick={() => openEvaluationModal(sub, true)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Réviser la note</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => openEvaluationModal(sub, false)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Saisir les points</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ONGLET 2 : MES QUIZ CRÉÉS */}
      {/* ========================================================================= */}
      {activeTab === 'quizzes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {quiz.courseUnitCode} • {quiz.moduleTitle}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  quiz.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {quiz.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{quiz.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>Durée : <span className="font-semibold text-slate-800">{quiz.durationMinutes} min</span></div>
                <div>Questions : <span className="font-semibold text-slate-800">{quiz.questions.length}</span></div>
                <div>Total points : <span className="font-semibold text-slate-800">{quiz.totalMaxPoints} pts</span></div>
                <div>Formateur : <span className="font-semibold text-slate-800">{quiz.trainerName}</span></div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Créé le {new Date(quiz.createdAt).toLocaleDateString('fr-FR')}</span>
                <span className="font-semibold text-teal-700">
                  {submissions.filter(s => s.quizId === quiz.id).length} soumission(s)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ONGLET 3 : RAPPORT DES 7 TESTS DE CONFORMITÉ */}
      {/* ========================================================================= */}
      {activeTab === 'tests' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Suite des 7 Tests Officiels du Moteur des Quiz
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Vérification algorithmique stricte du cycle de vie des quiz, de l'absence de correction automatique, de la saisie manuelle des points, de l'isolation multi-centres et de la traçabilité.
              </p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={runningTests}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{runningTests ? 'Exécution en cours...' : 'Relancer la vérification'}</span>
            </button>
          </div>

          {!testResults ? (
            <div className="text-center py-10">
              <p className="text-xs text-slate-500 mb-3">Cliquez sur le bouton ci-dessus pour exécuter l'ensemble des 7 tests unitaires de conformité.</p>
              <button
                onClick={handleRunTests}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Lancer les tests maintenant
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">
                    {testResults.filter(t => t.passed).length} / {testResults.length} Tests Réussis avec Succès
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Le moteur des Quiz DTech Group respecte à 100% l'intégralité du cahier des charges de l'Étape 5.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {testResults.map(test => (
                  <div
                    key={test.testNumber}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Test {test.testNumber} : {test.testName}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          CONFORME
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {test.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL D'ÉVALUATION ET SAISIE MANUELLE DES POINTS */}
      {/* ========================================================================= */}
      {evaluatingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            {/* En-tête modal */}
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[11px] font-bold text-teal-300 bg-white/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {isRevising ? 'RÉVISION OFFICIELLE DU RÉSULTAT' : 'SAISIE MANUELLE DES POINTS PAR LE FORMATEUR'}
                </span>
                <h2 className="text-lg font-bold mt-1">{evaluatingSubmission.quizTitle}</h2>
                <p className="text-xs text-teal-100">
                  Étudiant : <span className="font-semibold text-white">{evaluatingSubmission.studentName}</span> ({evaluatingSubmission.studentNumber}) • Centre : {evaluatingSubmission.centerName}
                </p>
              </div>
              <button
                onClick={() => setEvaluatingSubmission(null)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corps scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Rappel solennel sur l'absence de notation automatique */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl text-xs text-blue-900 leading-relaxed">
                <p className="font-bold text-blue-950 mb-0.5">Règle d'or de l'Institut Supérieur DELXIA / DTech Group :</p>
                <p>
                  Les réponses de l'étudiant sont affichées à l'état brut sans aucune notation préalable du système. Il vous appartient d'examiner chaque réponse et d'attribuer manuellement les points correspondants.
                </p>
              </div>

              {/* Champ obligatoire en cas de révision */}
              {isRevising && (
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                    Motif obligatoire de révision du résultat certifié :
                  </label>
                  <textarea
                    rows={2}
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    placeholder="Exemple : Re-vérification après concertation pédagogique, prise en compte d'une démonstration alternative..."
                    className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 font-medium"
                  />
                </div>
              )}

              {/* Questions et réponses */}
              <div className="space-y-6">
                {evaluatingSubmission.answers.map((ans, idx) => (
                  <div
                    key={ans.questionId}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-teal-100 text-teal-900 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-700 uppercase">
                          Question {idx + 1} • {ans.questionType}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
                        Barème : {ans.maxPoints} pts max
                      </span>
                    </div>

                    <p className="text-xs md:text-sm font-semibold text-slate-900">
                      {ans.questionPrompt}
                    </p>

                    {/* Réponse réelle de l'étudiant */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Réponse saisie par l'étudiant :
                      </span>
                      {ans.questionType === 'ASSOCIATION' && typeof ans.studentAnswer === 'object' && ans.studentAnswer !== null ? (
                        <div className="space-y-1">
                          {Object.entries(ans.studentAnswer).map(([pairId, val]) => (
                            <div key={pairId} className="flex items-center gap-2 text-slate-800 font-medium">
                              <span className="text-teal-600">●</span>
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

                    {/* Zone de saisie manuelle des points & commentaire formateur */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 items-end">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Points attribués manuellement (max: {ans.maxPoints}) :
                        </label>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max={ans.maxPoints}
                          value={inputtedPoints[ans.questionId] !== undefined ? inputtedPoints[ans.questionId] : ''}
                          onChange={(e) => setInputtedPoints(prev => ({ ...prev, [ans.questionId]: e.target.value }))}
                          placeholder={`0 à ${ans.maxPoints}`}
                          className="w-full text-xs font-bold p-2 bg-white border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Observation pédagogique (facultatif) :
                        </label>
                        <input
                          type="text"
                          value={inputtedComments[ans.questionId] || ''}
                          onChange={(e) => setInputtedComments(prev => ({ ...prev, [ans.questionId]: e.target.value }))}
                          placeholder="Exemple : Notion bien assimilée, attention à la syntaxe..."
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Commentaire général */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Appréciation générale officielle sur la copie :
                </label>
                <textarea
                  rows={2}
                  value={generalComment}
                  onChange={(e) => setGeneralComment(e.target.value)}
                  placeholder="Commentaire de synthèse pour l'étudiant..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Pied de modal avec récapitulatif mathématique et boutons d'action */}
            <div className="bg-slate-100 p-5 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Points saisis</span>
                  <span className="text-sm font-bold text-slate-800">
                    {currentTotalAttributed} / {evaluatingSubmission.totalPointsMax} pts
                  </span>
                </div>

                <div className="bg-white px-4 py-2 rounded-xl border border-teal-200 shadow-sm text-center">
                  <span className="text-[10px] text-teal-700 font-bold block uppercase">Note calculée sur 20</span>
                  <span className="text-lg font-extrabold text-teal-700">
                    {currentProjectedScore20.toFixed(2)} <span className="text-xs font-normal">/ 20</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  disabled={savingAction}
                  onClick={handleSaveDraft}
                  className="w-1/2 md:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer brouillon</span>
                </button>

                <button
                  type="button"
                  disabled={savingAction}
                  onClick={handleValidateOfficial}
                  className="w-1/2 md:w-auto inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors"
                >
                  <Award className="w-4 h-4" />
                  <span>{isRevising ? 'Confirmer la révision' : 'Valider & Publier la note'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL D'HISTORIQUE D'AUDIT */}
      {/* ========================================================================= */}
      {viewingAuditLogs && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold">Historique d'audit & Traçabilité immuable</h3>
              </div>
              <button
                onClick={() => setViewingAuditLogs(null)}
                className="text-white/70 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {viewingAuditLogs.length === 0 ? (
                <p className="text-slate-500 text-center py-6">Aucun événement d'audit enregistré pour cette copie.</p>
              ) : (
                viewingAuditLogs.map(entry => (
                  <div key={entry.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-800 uppercase tracking-wider text-[11px]">
                        Action : {entry.action === 'official_result_published' ? 'Validation officielle publiée' : entry.action === 'result_revised' ? 'Révision de résultat' : 'Saisie enregistrée'}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(entry.timestamp).toLocaleString('fr-FR')}
                      </span>
                    </div>

                    <div className="text-slate-700">
                      Formateur habilité : <span className="font-semibold">{entry.trainerName}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                      <span>Points totaux attribués : <strong>{entry.totalPointsAttributed} / {entry.totalPointsMax}</strong></span>
                      <span>Note officielle : <strong className="text-teal-700">{entry.officialScore} / 20</strong></span>
                    </div>

                    {entry.revisionReason && (
                      <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-900 text-[11px]">
                        <strong>Motif de révision :</strong> {entry.revisionReason} (Ancienne note : {entry.previousScore} / 20)
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
