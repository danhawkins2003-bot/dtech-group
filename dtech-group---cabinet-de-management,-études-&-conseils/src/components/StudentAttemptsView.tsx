import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCircle,
  Clock,
  AlertCircle,
  HelpCircle,
  BookmarkCheck,
  TrendingUp,
  Award,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { dtechApiService } from '../services/dtechApiService';
import { StudentEvaluationAttemptsSummary, EvaluationAttempt, StudentProfile } from '../types';

interface StudentAttemptsViewProps {
  profile: StudentProfile;
  onNavigateToEvaluation?: (type: 'exercise' | 'quiz', id: string) => void;
}

export const StudentAttemptsView: React.FC<StudentAttemptsViewProps> = ({
  profile,
  onNavigateToEvaluation
}) => {
  const [summaries, setSummaries] = useState<StudentEvaluationAttemptsSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'exercise' | 'quiz'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTestRunner, setShowTestRunner] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testingRunning, setTestingRunning] = useState<boolean>(false);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dtechApiService.getStudentAttempts();
      if (res.status === 'success') {
        setSummaries(res.summaries || []);
      } else {
        setError(res.message || 'Impossible de récupérer vos tentatives.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des tentatives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

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

  const filteredSummaries = summaries.filter(s => {
    if (filterType !== 'all' && s.evaluationType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = s.evaluationTitle.toLowerCase().includes(q);
      const codeMatch = s.courseUnitCode?.toLowerCase().includes(q) || false;
      const modMatch = s.moduleTitle?.toLowerCase().includes(q) || false;
      if (!titleMatch && !codeMatch && !modMatch) return false;
    }
    return true;
  });

  // Statistiques globales
  const totalEvaluations = summaries.length;
  const evaluationsWithOfficialScores = summaries.filter(s => typeof s.bestScore === 'number').length;
  const evaluationsPending = summaries.filter(s => s.hasPendingResult).length;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn" id="student-attempts-view">
      {/* En-tête officiel */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Règlement Officiel des Évaluations
              </span>
              <span className="text-xs text-slate-400">
                Plafond : 2 tentatives maximum
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <History className="w-8 h-8 text-amber-400" />
              Mes Tentatives & Historique des Résultats
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Consultez l'historique officiel de vos évaluations (Exercices, TPs et Quiz). 
              Conformément à la charte académique DTech Group / Institut Supérieur DELXIA, 
              les points sont attribués et validés exclusivement par vos formateurs habilités.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={fetchAttempts}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 hover:text-white flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            <button
              onClick={() => {
                setShowTestRunner(true);
                handleRunTests();
              }}
              className="px-4 py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 rounded-xl text-sm font-semibold text-indigo-200 hover:text-white flex items-center gap-2 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Tests Étape 7 (9/9)</span>
            </button>
          </div>
        </div>

        {/* Métriques d'aperçu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
              {totalEvaluations}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Évaluations au programme</p>
              <p className="text-sm font-bold text-white">Exercices, TPs & Quiz</p>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
              {evaluationsWithOfficialScores}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Notes officielles publiées</p>
              <p className="text-sm font-bold text-emerald-400">Validées par les formateurs</p>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              {evaluationsPending}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Résultats en attente</p>
              <p className="text-sm font-bold text-amber-300">Correction humaine en cours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'outils et filtres */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer par matière ou titre..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Type :</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Toutes ({summaries.length})
          </button>
          <button
            onClick={() => setFilterType('exercise')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              filterType === 'exercise'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            Exercices / TPs
          </button>
          <button
            onClick={() => setFilterType('quiz')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              filterType === 'quiz'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Quiz
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">Chargement de votre historique de tentatives...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-6 text-rose-800 dark:text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Erreur de chargement</h3>
            <p className="text-xs mt-1 text-rose-700 dark:text-rose-300">{error}</p>
            <button
              onClick={fetchAttempts}
              className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : filteredSummaries.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <History className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Aucune évaluation correspondante</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Aucune tentative trouvée pour le filtre sélectionné. Les évaluations créées par vos formateurs apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSummaries.map((summary) => {
            const isQuiz = summary.evaluationType === 'quiz';
            const att1 = summary.attempts.find(a => a.attemptNumber === 1);
            const att2 = summary.attempts.find(a => a.attemptNumber === 2);

            return (
              <div
                key={`${summary.evaluationType}-${summary.evaluationId}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                {/* Header évaluation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${
                          isQuiz
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {isQuiz ? <HelpCircle className="w-3 h-3" /> : <BookmarkCheck className="w-3 h-3" />}
                        {isQuiz ? 'Quiz Officiel' : 'Exercice / TP'}
                      </span>

                      {summary.courseUnitCode && (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded font-mono font-medium">
                          {summary.courseUnitCode}
                        </span>
                      )}

                      {summary.moduleTitle && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {summary.moduleTitle}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      {summary.evaluationTitle}
                    </h2>
                  </div>

                  {/* Statut des tentatives consommées */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                        Tentatives utilisées
                      </span>
                      <span className={`text-sm font-bold ${
                        summary.attemptCount === 2 
                          ? 'text-rose-600 dark:text-rose-400' 
                          : summary.attemptCount === 1 
                          ? 'text-amber-600 dark:text-amber-400' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {summary.attemptCount} / {summary.maxAttempts}
                      </span>
                    </div>

                    {summary.canAttempt ? (
                      <button
                        onClick={() => {
                          if (onNavigateToEvaluation) {
                            onNavigateToEvaluation(summary.evaluationType, summary.evaluationId);
                          }
                        }}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <span>{summary.attemptCount === 0 ? 'Commencer (Tentative 1)' : 'Deuxième tentative (2/2)'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700">
                        Limite atteinte (2/2)
                      </span>
                    )}
                  </div>
                </div>

                {/* Grille des 2 tentatives officielles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  {/* TENTATIVE 1 */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        Tentative 1
                      </span>

                      {att1 ? (
                        att1.trainerValidation && att1.status === 'published' ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-md flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Résultat officiel publié
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Résultat en attente de validation
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Non effectuée
                        </span>
                      )}
                    </div>

                    {att1 ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-slate-500">Résultat officiel :</span>
                          {att1.trainerValidation && att1.status === 'published' && typeof att1.officialScore === 'number' ? (
                            <span className="font-bold text-sm text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded">
                              {att1.officialScore.toFixed(2)} / 20
                            </span>
                          ) : (
                            <span className="font-medium text-amber-600 dark:text-amber-400 italic">
                              En attente de validation par le formateur
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-slate-500 text-xs">
                          <span>Soumis le :</span>
                          <span>
                            {att1.submittedAt
                              ? new Date(att1.submittedAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Date inconnue'}
                          </span>
                        </div>

                        {att1.validatedByTrainerName && (
                          <div className="flex items-center justify-between text-slate-500 text-xs">
                            <span>Formateur :</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {att1.validatedByTrainerName}
                            </span>
                          </div>
                        )}

                        {att1.generalComment && (
                          <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 italic">
                            "{att1.generalComment}"
                          </div>
                        )}

                        {att1.revisionHistory && att1.revisionHistory.length > 0 && (
                          <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded text-indigo-800 dark:text-indigo-300 text-xs">
                            <span className="font-bold block">Historique de révision officielle :</span>
                            {att1.revisionHistory.map((rev) => (
                              <div key={rev.id} className="mt-1 text-[11px]">
                                • Note ajustée de {rev.previousScore}/20 à {rev.newScore}/20 par {rev.trainerName}.
                                <br />
                                <span className="italic text-slate-500">Motif : {rev.reason}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-3">
                        Cette évaluation n'a pas encore été tentée. Vous disposez de 2 tentatives.
                      </p>
                    )}
                  </div>

                  {/* TENTATIVE 2 */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        Tentative 2
                      </span>

                      {att2 ? (
                        att2.trainerValidation && att2.status === 'published' ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-md flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Résultat officiel publié
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Résultat en attente de validation
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Non utilisée (Disponible)
                        </span>
                      )}
                    </div>

                    {att2 ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-slate-500">Résultat officiel :</span>
                          {att2.trainerValidation && att2.status === 'published' && typeof att2.officialScore === 'number' ? (
                            <span className="font-bold text-sm text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded">
                              {att2.officialScore.toFixed(2)} / 20
                            </span>
                          ) : (
                            <span className="font-medium text-amber-600 dark:text-amber-400 italic">
                              En attente de validation par le formateur
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-slate-500 text-xs">
                          <span>Soumis le :</span>
                          <span>
                            {att2.submittedAt
                              ? new Date(att2.submittedAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Date inconnue'}
                          </span>
                        </div>

                        {att2.validatedByTrainerName && (
                          <div className="flex items-center justify-between text-slate-500 text-xs">
                            <span>Formateur :</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {att2.validatedByTrainerName}
                            </span>
                          </div>
                        )}

                        {att2.generalComment && (
                          <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 italic">
                            "{att2.generalComment}"
                          </div>
                        )}

                        {att2.revisionHistory && att2.revisionHistory.length > 0 && (
                          <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded text-indigo-800 dark:text-indigo-300 text-xs">
                            <span className="font-bold block">Historique de révision officielle :</span>
                            {att2.revisionHistory.map((rev) => (
                              <div key={rev.id} className="mt-1 text-[11px]">
                                • Note ajustée de {rev.previousScore}/20 à {rev.newScore}/20 par {rev.trainerName}.
                                <br />
                                <span className="italic text-slate-500">Motif : {rev.reason}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-3">
                        La deuxième tentative est disponible si vous souhaitez améliorer votre résultat ou consolider vos acquis.
                      </p>
                    )}
                  </div>
                </div>

                {/* Synthèse officielle : Meilleur résultat vs Dernier résultat */}
                <div className="bg-slate-100/70 dark:bg-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400">Meilleur résultat officiel :</span>
                      {typeof summary.bestScore === 'number' ? (
                        <span className="font-bold text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                          {summary.bestScore.toFixed(2)} / 20
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">En attente de validation</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400">Dernier résultat officiel :</span>
                      {typeof summary.latestScore === 'number' ? (
                        <span className="font-bold text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                          {summary.latestScore.toFixed(2)} / 20
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">En attente de validation</span>
                      )}
                    </div>
                  </div>

                  <div className="text-slate-400 text-[11px] italic">
                    Conforme au barème officiel de l'Institut Supérieur DELXIA
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Section des 9 tests obligatoires Étape 7 */}
      {showTestRunner && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Suite Officielle des 9 Tests de Conformité (Étape 7)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Vérification de la limite de 2 tentatives, calcul bestScore/latestScore, isolation et traçabilité
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTestRunner(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {testingRunning ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">Exécution de la suite de tests en cours...</p>
                </div>
              ) : testResults.length === 0 ? (
                <div className="text-center py-8">
                  <button
                    onClick={handleRunTests}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 cursor-pointer"
                  >
                    Lancer les 9 tests
                  </button>
                </div>
              ) : (
                testResults.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className={`p-3.5 rounded-xl border text-xs ${
                      t.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        {t.passed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        )}
                        {t.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.passed ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100' : 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-100'
                      }`}>
                        {t.passed ? 'SUCCÈS' : 'ÉCHEC'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{t.description}</p>
                    <p className="mt-1 font-mono text-[11px] opacity-90">{t.details}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-500">
                {testResults.length > 0 && (
                  <span>
                    Résultats : {testResults.filter(r => r.passed).length} / {testResults.length} tests réussis
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunTests}
                  disabled={testingRunning}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Relancer les tests
                </button>
                <button
                  onClick={() => setShowTestRunner(false)}
                  className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
