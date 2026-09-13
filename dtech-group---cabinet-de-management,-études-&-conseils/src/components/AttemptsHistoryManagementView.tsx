import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCircle,
  Clock,
  AlertCircle,
  HelpCircle,
  BookmarkCheck,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  ShieldCheck,
  FileText,
  User,
  Users,
  Building,
  ChevronDown,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { dtechApiService } from '../services/dtechApiService';
import { EvaluationAttempt, AttemptAuditEvent, AuthUser } from '../types';

interface AttemptsHistoryManagementViewProps {
  currentUser?: AuthUser | null;
  role: 'trainer' | 'study_director' | 'admin';
  centerId?: string;
}

export const AttemptsHistoryManagementView: React.FC<AttemptsHistoryManagementViewProps> = ({
  currentUser,
  role,
  centerId
}) => {
  const [attempts, setAttempts] = useState<EvaluationAttempt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AttemptAuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'exercise' | 'quiz'>('all');
  const [attemptNumFilter, setAttemptNumFilter] = useState<'all' | '1' | '2'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending_result'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'attempts' | 'audit' | 'tests'>('attempts');

  // Modale de révision officielle
  const [selectedAttemptForRevision, setSelectedAttemptForRevision] = useState<EvaluationAttempt | null>(null);
  const [revisionNewScore, setRevisionNewScore] = useState<string>('');
  const [revisionReason, setRevisionReason] = useState<string>('');
  const [revisionSubmitting, setRevisionSubmitting] = useState<boolean>(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [revisionSuccess, setRevisionSuccess] = useState<string | null>(null);

  // Modale historique complet
  const [selectedAttemptHistory, setSelectedAttemptHistory] = useState<EvaluationAttempt | null>(null);

  // Tests Étape 7
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testingRunning, setTestingRunning] = useState<boolean>(false);

  const fetchAttemptsData = async () => {
    try {
      setLoading(true);
      setError(null);

      let res;
      if (role === 'study_director') {
        res = await dtechApiService.getStudyDirectorAttempts(centerId);
      } else {
        res = await dtechApiService.getTrainerAttempts();
      }

      if (res.status === 'success') {
        setAttempts(res.attempts || []);
        setAuditLogs(res.auditLogs || []);
      } else {
        setError(res.message || 'Impossible de récupérer la liste des tentatives.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des tentatives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttemptsData();
  }, [role, centerId]);

  const handleRunTests = async () => {
    try {
      setTestingRunning(true);
      const res = await dtechApiService.runAttemptsEngineTests();
      if (res.status === 'success') {
        setTestResults(res.results || []);
      }
    } catch (err: any) {
      alert(`Erreur d'exécution des tests : ${err.message}`);
    } finally {
      setTestingRunning(false);
    }
  };

  const handleOpenRevisionModal = (att: EvaluationAttempt) => {
    setSelectedAttemptForRevision(att);
    setRevisionNewScore(att.officialScore !== undefined ? String(att.officialScore) : '');
    setRevisionReason('');
    setRevisionError(null);
    setRevisionSuccess(null);
  };

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttemptForRevision) return;

    const numScore = parseFloat(revisionNewScore);
    if (isNaN(numScore) || numScore < 0 || numScore > 20) {
      setRevisionError('Veuillez saisir une note valide entre 0 et 20.');
      return;
    }

    if (!revisionReason || revisionReason.trim().length < 5) {
      setRevisionError('Le motif pédagogique de révision est obligatoire (minimum 5 caractères).');
      return;
    }

    try {
      setRevisionSubmitting(true);
      setRevisionError(null);

      const res = await dtechApiService.reviseAttemptScore({
        attemptId: selectedAttemptForRevision.id,
        newScore: numScore,
        reason: revisionReason.trim()
      });

      if (res.status === 'success') {
        setRevisionSuccess('Note officielle révisée et archivée dans l’historique d’audit.');
        setTimeout(() => {
          setSelectedAttemptForRevision(null);
          setRevisionSuccess(null);
          fetchAttemptsData();
        }, 1200);
      } else {
        setRevisionError(res.message || 'Échec de la révision.');
      }
    } catch (err: any) {
      setRevisionError(err.message || 'Erreur lors de la révision de la note.');
    } finally {
      setRevisionSubmitting(false);
    }
  };

  // Filtrage
  const filteredAttempts = attempts.filter((att) => {
    if (typeFilter !== 'all' && att.evaluationType !== typeFilter) return false;
    if (attemptNumFilter !== 'all' && String(att.attemptNumber) !== attemptNumFilter) return false;
    if (statusFilter !== 'all' && att.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sName = att.studentName?.toLowerCase() || '';
      const sNum = att.studentNumber?.toLowerCase() || '';
      const eTitle = att.evaluationTitle?.toLowerCase() || '';
      const gName = att.groupName?.toLowerCase() || '';
      const cCode = att.courseUnitCode?.toLowerCase() || '';

      if (!sName.includes(q) && !sNum.includes(q) && !eTitle.includes(q) && !gName.includes(q) && !cCode.includes(q)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6" id="attempts-history-management-view">
      {/* En-tête de section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Moteur Officiel des Tentatives (Étape 7)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Périmètre : {role === 'study_director' ? 'Direction des Études' : 'Espace Formateur'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <History className="w-6 h-6 text-amber-500" />
              Contrôle des Tentatives & Historique des Résultats
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
              Consultez les tentatives des étudiants (Plafond strict de 2 tentatives par évaluation). 
              Toutes les notes officielles sont attribuées manuellement sans aucune notation automatique.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={fetchAttemptsData}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab('tests');
                handleRunTests();
              }}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Tests Étape 7</span>
            </button>
          </div>
        </div>

        {/* Onglets de vue */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('attempts')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'attempts'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Tentatives des Étudiants ({attempts.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'audit'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Journal d'Audit Immuable ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab('tests');
              if (testResults.length === 0) handleRunTests();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'tests'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Suite des 9 Tests Officiels</span>
          </button>
        </div>
      </div>

      {/* VUE 1 : TENTATIVES */}
      {activeSubTab === 'attempts' && (
        <div className="space-y-4">
          {/* Barre de filtres */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher étudiant, matricule, évaluation..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end text-xs">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
              >
                <option value="all">Tous types</option>
                <option value="exercise">Exercices / TPs</option>
                <option value="quiz">Quiz</option>
              </select>

              <select
                value={attemptNumFilter}
                onChange={(e) => setAttemptNumFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
              >
                <option value="all">Toutes tentatives</option>
                <option value="1">Tentative 1 uniquement</option>
                <option value="2">Tentative 2 uniquement</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
              >
                <option value="all">Tous statuts</option>
                <option value="published">Résultat publié</option>
                <option value="pending_result">En attente de validation</option>
              </select>
            </div>
          </div>

          {/* Tableau des tentatives */}
          {loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Chargement des tentatives en cours...</p>
            </div>
          ) : filteredAttempts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucune tentative trouvée</p>
              <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche pour afficher les copies.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-750">
                      <th className="p-3.5">Étudiant & Matricule</th>
                      <th className="p-3.5">Évaluation & Matière</th>
                      <th className="p-3.5 text-center">Tentative</th>
                      <th className="p-3.5">Date soumission</th>
                      <th className="p-3.5 text-center">Statut</th>
                      <th className="p-3.5 text-center">Résultat officiel</th>
                      <th className="p-3.5">Validation</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAttempts.map((att) => {
                      const isPublished = att.trainerValidation && att.status === 'published';
                      const isQuiz = att.evaluationType === 'quiz';

                      return (
                        <tr key={att.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          {/* Étudiant */}
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {att.studentName || 'Étudiant'}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {att.studentNumber || att.studentId}
                            </div>
                            {att.groupName && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px]">
                                {att.groupName}
                              </span>
                            )}
                          </td>

                          {/* Évaluation */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  isQuiz
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300'
                                }`}
                              >
                                {isQuiz ? 'Quiz' : 'TP / Ex'}
                              </span>
                              {att.courseUnitCode && (
                                <span className="font-mono text-[10px] text-slate-500">
                                  {att.courseUnitCode}
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {att.evaluationTitle}
                            </div>
                          </td>

                          {/* Tentative */}
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                att.attemptNumber === 1
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              Tentative {att.attemptNumber} / 2
                            </span>
                          </td>

                          {/* Date */}
                          <td className="p-3.5 text-slate-500 whitespace-nowrap">
                            {att.submittedAt
                              ? new Date(att.submittedAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Non soumise'}
                          </td>

                          {/* Statut */}
                          <td className="p-3.5 text-center">
                            {isPublished ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded text-[11px] font-semibold inline-flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Validé & Publié
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded text-[11px] font-semibold inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                En attente
                              </span>
                            )}
                          </td>

                          {/* Résultat officiel */}
                          <td className="p-3.5 text-center">
                            {isPublished && typeof att.officialScore === 'number' ? (
                              <span className="font-bold text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                {att.officialScore.toFixed(2)} / 20
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">
                                Non attribuée
                              </span>
                            )}
                          </td>

                          {/* Formateur validateur */}
                          <td className="p-3.5 text-slate-600 dark:text-slate-400">
                            {att.validatedByTrainerName ? (
                              <div>
                                <span className="font-medium text-slate-800 dark:text-slate-200 block">
                                  {att.validatedByTrainerName}
                                </span>
                                {att.validatedAt && (
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(att.validatedAt).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">En attente</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                            {/* Voir l'historique de révision si existant */}
                            {att.revisionHistory && att.revisionHistory.length > 0 && (
                              <button
                                onClick={() => setSelectedAttemptHistory(att)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded text-[11px] font-semibold cursor-pointer"
                                title="Consulter l'historique des révisions"
                              >
                                Historique ({att.revisionHistory.length})
                              </button>
                            )}

                            {/* Révision de note officielle (formateur habilité ou DE) */}
                            {isPublished && (
                              <button
                                onClick={() => handleOpenRevisionModal(att)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 rounded text-[11px] font-bold border border-amber-200 dark:border-amber-800 cursor-pointer inline-flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                Réviser
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VUE 2 : JOURNAL D'AUDIT IMMUABLE */}
      {activeSubTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Journal d'Audit et Traçabilité des Tentatives
              </h2>
              <p className="text-xs text-slate-500">
                Toutes les soumissions, validations officielles et révisions de notes sont immuables.
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-mono font-bold">
              {auditLogs.length} événements tracés
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Aucun événement d'audit enregistré pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 rounded-xl text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.action === 'result_revised'
                            ? 'bg-amber-500'
                            : log.action === 'result_published'
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      {log.action === 'result_revised' && 'Révision d’une note officielle'}
                      {log.action === 'result_published' && 'Publication du résultat officiel'}
                      {log.action === 'attempt_submitted' && 'Soumission de copie par l’étudiant'}
                      {log.action === 'attempt_created' && 'Tentative initialisée'}
                      {log.action === 'attempt_cancelled' && 'Tentative annulée'}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>

                  <div className="text-slate-600 dark:text-slate-300">
                    Étudiant : <strong className="text-slate-900 dark:text-white">{log.studentName}</strong> • Évaluation :{' '}
                    <strong>{log.evaluationTitle}</strong> (Tentative {log.attemptNumber})
                  </div>

                  {log.trainerName && (
                    <div className="text-slate-500 text-[11px]">
                      Opérateur : <span className="font-medium text-slate-700 dark:text-slate-300">{log.trainerName}</span>
                    </div>
                  )}

                  {log.newScore !== undefined && (
                    <div className="flex items-center gap-2 mt-1">
                      {log.previousScore !== undefined && (
                        <span className="line-through text-slate-400 text-xs">{log.previousScore} / 20</span>
                      )}
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-xs">
                        Note : {log.newScore} / 20
                      </span>
                    </div>
                  )}

                  {log.reason && (
                    <div className="mt-1 p-2 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded text-amber-900 dark:text-amber-200 text-[11px]">
                      <strong>Motif obligatoire enregistré :</strong> "{log.reason}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VUE 3 : SUITE DES 9 TESTS OFFICIELS */}
      {activeSubTab === 'tests' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                Validation Officielle des 9 Tests du Moteur des Tentatives
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Vérification algorithmique certifiée : Règle des 2 tentatives max, Best Score, Latest Score, Isolation multi-centres, et Traçabilité.
              </p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={testingRunning}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingRunning ? 'animate-spin' : ''}`} />
              <span>{testingRunning ? 'Vérification...' : 'Exécuter les 9 tests'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {testResults.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Cliquez pour lancer la suite de tests</p>
              </div>
            ) : (
              testResults.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border text-xs ${
                    t.passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="flex items-center gap-2">
                      {t.passed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      )}
                      {t.name}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.passed ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100' : 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-100'
                      }`}
                    >
                      {t.passed ? 'Conforme (100%)' : 'Échec'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{t.description}</p>
                  <p className="mt-1.5 font-mono text-[11px] bg-white/60 dark:bg-slate-900/60 p-2 rounded border border-slate-200/50 dark:border-slate-800">
                    {t.details}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODALE : RÉVISION OFFICIELLE D'UNE NOTE */}
      {selectedAttemptForRevision && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Révision de Note Officielle
                </h3>
              </div>
              <button
                onClick={() => setSelectedAttemptForRevision(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="space-y-4 mt-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <div>
                  Étudiant : <strong>{selectedAttemptForRevision.studentName}</strong> ({selectedAttemptForRevision.studentNumber})
                </div>
                <div>
                  Évaluation : <strong>{selectedAttemptForRevision.evaluationTitle}</strong> (Tentative {selectedAttemptForRevision.attemptNumber})
                </div>
                <div>
                  Note actuelle : <strong className="text-amber-600 dark:text-amber-400">{selectedAttemptForRevision.officialScore} / 20</strong>
                </div>
              </div>

              {revisionError && (
                <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{revisionError}</span>
                </div>
              )}

              {revisionSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{revisionSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nouvelle note officielle (/20) *
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="20"
                  value={revisionNewScore}
                  onChange={(e) => setRevisionNewScore(e.target.value)}
                  placeholder="Ex : 14.50"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motif obligatoire de la révision (minimum 5 caractères) *
                </label>
                <textarea
                  rows={3}
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="Ex : Réexamen concerté de la question n°3 en séance de travaux dirigés suite à clarification du barème."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAttemptForRevision(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={revisionSubmitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {revisionSubmitting ? 'Enregistrement...' : 'Valider la révision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE : HISTORIQUE DÉTAILLÉ DES RÉVISIONS D'UNE TENTATIVE */}
      {selectedAttemptHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Historique des Révisions
                </h3>
              </div>
              <button
                onClick={() => setSelectedAttemptHistory(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>Étudiant : <strong>{selectedAttemptHistory.studentName}</strong></div>
                <div>Évaluation : <strong>{selectedAttemptHistory.evaluationTitle}</strong> (Tentative {selectedAttemptHistory.attemptNumber})</div>
                <div>Note actuelle : <strong className="text-emerald-600 dark:text-emerald-400">{selectedAttemptHistory.officialScore} / 20</strong></div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">Traçabilité des modifications :</h4>
                {selectedAttemptHistory.revisionHistory?.map((rev, index) => (
                  <div key={rev.id || index} className="p-3 bg-slate-100/70 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {rev.previousScore} / 20 ➔ <span className="text-emerald-600">{rev.newScore} / 20</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.timestamp).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Par : <span className="font-medium text-slate-700 dark:text-slate-300">{rev.trainerName}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2 rounded">
                      "{rev.reason}"
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedAttemptHistory(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
