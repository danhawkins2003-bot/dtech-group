import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  BookOpen, 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Award, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  CheckSquare, 
  AlertCircle, 
  Save, 
  Send, 
  ArrowLeft, 
  HelpCircle, 
  FileCheck, 
  Download, 
  ChevronRight,
  Sparkles,
  Building,
  Check,
  X,
  RotateCcw,
  Calendar,
  Layers,
  File,
  ShieldCheck,
  History,
  AlertTriangle
} from 'lucide-react';
import { Exercise, ExerciseAttempt, ExerciseQuestion, CourseUnit, PromotionGroup } from '../types';
import { dtechApiService } from '../services/dtechApiService';

interface TrainerExercisesViewProps {
  exercises: Exercise[];
  attempts: ExerciseAttempt[];
  trainerUser: any;
  assignedCourses: CourseUnit[];
  assignedGroups: PromotionGroup[];
  onRefresh?: () => Promise<void>;
}

export const TrainerExercisesView: React.FC<TrainerExercisesViewProps> = ({
  exercises,
  attempts,
  trainerUser,
  assignedCourses,
  assignedGroups,
  onRefresh
}) => {
  const [subTab, setSubTab] = useState<'list' | 'create' | 'submissions' | 'grading' | 'report'>('list');
  const [submissionFilter, setSubmissionFilter] = useState<'ALL' | 'PENDING' | 'VALIDATED'>('ALL');

  // Filtres dans la liste
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'published' | 'draft' | 'archived'>('ALL');

  // ==========================================================================
  // ÉTAT DU FORMULAIRE DE CRÉATION / MODIFICATION D'EXERCICE
  // ==========================================================================
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formInstructions, setFormInstructions] = useState('Répondez avec précision à chaque question.');
  const [formCourseUnitId, setFormCourseUnitId] = useState(assignedCourses[0]?.id || '');
  const [formModuleId, setFormModuleId] = useState(assignedCourses[0]?.modules[0]?.id || 'm1');
  const [formGroupIds, setFormGroupIds] = useState<string[]>(assignedGroups[0]?.id ? [assignedGroups[0].id] : []);
  const [formDueDate, setFormDueDate] = useState('');
  const [formDurationMinutes, setFormDurationMinutes] = useState<number>(60);
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  
  // Questions dynamiques
  const [formQuestions, setFormQuestions] = useState<Array<{
    id: string;
    orderIndex: number;
    prompt: string;
    type: 'qcm' | 'true_false' | 'short_answer' | 'long_answer' | 'file_upload';
    points: number;
    options?: string[];
    correctAnswers?: string;
    sampleAnswer?: string;
    explanation?: string;
    maxFileSizeMB?: number;
    allowedExtensions?: string[];
  }>>([
    {
      id: 'q-new-1',
      orderIndex: 1,
      prompt: 'Quel est l\'objectif principal de ce module ?',
      type: 'qcm',
      points: 5,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswers: 'Option A',
      explanation: 'Explication pédagogique de la bonne réponse.'
    },
    {
      id: 'q-new-2',
      orderIndex: 2,
      prompt: 'Expliquez en détail les étapes méthodologiques clés.',
      type: 'long_answer',
      points: 15,
      sampleAnswer: 'Éléments attendus : clarté, rigueur, respect des normes.'
    }
  ]);

  const [savingExercise, setSavingExercise] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // ==========================================================================
  // ÉTAT DE CORRECTION D'UNE COPIE ÉTUDIANT
  // ==========================================================================
  const [gradingAttempt, setGradingAttempt] = useState<ExerciseAttempt | null>(null);
  const [gradingScores, setGradingScores] = useState<Record<string, number>>({});
  const [gradingComments, setGradingComments] = useState<Record<string, string>>({});
  const [gradingGeneralFeedback, setGradingGeneralFeedback] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);
  const [gradeSuccessMessage, setGradeSuccessMessage] = useState<string | null>(null);

  // Modules disponibles pour le cours sélectionné dans le formulaire
  const selectedCourseModules = useMemo(() => {
    const course = assignedCourses.find(c => c.id === formCourseUnitId);
    return course?.modules || [];
  }, [assignedCourses, formCourseUnitId]);

  // Nombre de copies en attente de vérification / validation humaine
  const pendingCorrectionsCount = useMemo(() => {
    return attempts.filter(a => !a.trainerValidation).length;
  }, [attempts]);

  // Filtrage des exercices
  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      if (courseFilter !== 'ALL' && ex.courseUnitId !== courseFilter) return false;
      if (groupFilter !== 'ALL' && !ex.groupIds?.includes(groupFilter) && ex.groupId !== groupFilter) return false;
      if (statusFilter !== 'ALL' && ex.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ex.title.toLowerCase().includes(q);
        const matchesCourse = ex.courseTitle.toLowerCase().includes(q) || ex.courseCode.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCourse) return false;
      }
      return true;
    });
  }, [exercises, courseFilter, groupFilter, statusFilter, searchQuery]);

  // Total des points calculé dans le formulaire
  const calculatedFormTotal = useMemo(() => {
    return formQuestions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  }, [formQuestions]);

  // Réinitialiser le formulaire de création
  const resetForm = () => {
    setEditingExerciseId(null);
    setFormTitle('');
    setFormDescription('');
    setFormInstructions('Répondez avec précision à chaque question.');
    const firstCourse = assignedCourses[0];
    setFormCourseUnitId(firstCourse?.id || '');
    setFormModuleId(firstCourse?.modules[0]?.id || 'm1');
    setFormGroupIds(assignedGroups[0]?.id ? [assignedGroups[0].id] : []);
    setFormDueDate('');
    setFormDurationMinutes(60);
    setFormStatus('published');
    setFormQuestions([
      {
        id: `q-${Date.now()}-1`,
        orderIndex: 1,
        prompt: 'Première question de vérification théorique ou QCM :',
        type: 'qcm',
        points: 5,
        options: ['Choix 1', 'Choix 2', 'Choix 3', 'Choix 4'],
        correctAnswers: 'Choix 1'
      },
      {
        id: `q-${Date.now()}-2`,
        orderIndex: 2,
        prompt: 'Déposez votre livrable pratique (classeur ou compte-rendu) :',
        type: 'file_upload',
        points: 15,
        maxFileSizeMB: 10,
        allowedExtensions: ['pdf', 'xlsx', 'docx', 'zip']
      }
    ]);
    setFormError(null);
    setFormSuccess(null);
  };

  // Passer en mode édition d'un exercice existant
  const handleEditExercise = (ex: Exercise) => {
    setEditingExerciseId(ex.id);
    setFormTitle(ex.title);
    setFormDescription(ex.description || '');
    setFormInstructions(ex.instructions || '');
    setFormCourseUnitId(ex.courseUnitId);
    setFormModuleId(ex.moduleId);
    setFormGroupIds(ex.groupIds || (ex.groupId ? [ex.groupId] : []));
    setFormDueDate(ex.dueDate || '');
    setFormDurationMinutes(ex.estimatedDurationMinutes || 60);
    setFormStatus(ex.status === 'draft' ? 'draft' : 'published');
    setFormQuestions(ex.questions.map(q => ({
      id: q.id,
      orderIndex: q.orderIndex,
      prompt: q.prompt,
      type: q.type,
      points: q.points,
      options: q.options ? [...q.options] : undefined,
      correctAnswers: q.correctAnswers,
      sampleAnswer: q.sampleAnswer,
      explanation: q.explanation,
      maxFileSizeMB: q.maxFileSizeMB,
      allowedExtensions: q.allowedExtensions ? [...q.allowedExtensions] : undefined
    })));
    setSubTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ajout d'une nouvelle question
  const handleAddQuestion = (type: 'qcm' | 'true_false' | 'short_answer' | 'long_answer' | 'file_upload') => {
    const newIdx = formQuestions.length + 1;
    const newQ: any = {
      id: `q-add-${Date.now()}-${newIdx}`,
      orderIndex: newIdx,
      prompt: type === 'file_upload' 
        ? 'Déposez le livrable technique correspondant au TP :' 
        : `Question ${newIdx} : `,
      type,
      points: 5
    };

    if (type === 'qcm') {
      newQ.options = ['Proposition A', 'Proposition B', 'Proposition C', 'Proposition D'];
      newQ.correctAnswers = 'Proposition A';
    } else if (type === 'true_false') {
      newQ.options = ['Vrai', 'Faux'];
      newQ.correctAnswers = 'Vrai';
    } else if (type === 'file_upload') {
      newQ.maxFileSizeMB = 10;
      newQ.allowedExtensions = ['pdf', 'xlsx', 'docx', 'zip'];
    }

    setFormQuestions(prev => [...prev, newQ]);
  };

  // Suppression d'une question
  const handleRemoveQuestion = (idx: number) => {
    if (formQuestions.length <= 1) {
      alert('Un exercice doit comporter au moins une question.');
      return;
    }
    setFormQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  // Sauvegarde de l'exercice (Création ou Mise à jour)
  const handleSaveExercise = async (statusToSave: 'published' | 'draft') => {
    if (!formTitle.trim()) {
      setFormError('Veuillez renseigner le titre de l\'exercice.');
      return;
    }
    if (!formCourseUnitId) {
      setFormError('Veuillez sélectionner une matière.');
      return;
    }
    if (formGroupIds.length === 0) {
      setFormError('Veuillez sélectionner au moins un groupe cible.');
      return;
    }
    if (formQuestions.length === 0) {
      setFormError('Veuillez ajouter au moins une question.');
      return;
    }

    try {
      setSavingExercise(true);
      setFormError(null);

      const payload = {
        title: formTitle.trim(),
        description: formDescription,
        instructions: formInstructions,
        type: 'practical_work',
        courseUnitId: formCourseUnitId,
        moduleId: formModuleId,
        groupIds: formGroupIds,
        groupId: formGroupIds[0],
        centerId: trainerUser.centerId,
        totalPoints: calculatedFormTotal,
        dueDate: formDueDate || undefined,
        estimatedDurationMinutes: Number(formDurationMinutes),
        status: statusToSave,
        questions: formQuestions
      };

      if (editingExerciseId) {
        await dtechApiService.updateTrainerExercise(editingExerciseId, payload);
        setFormSuccess('Exercice mis à jour avec succès !');
      } else {
        await dtechApiService.createTrainerExercise(payload);
        setFormSuccess('Nouvel exercice créé et publié avec succès !');
      }

      if (onRefresh) {
        await onRefresh();
      }

      setTimeout(() => {
        setSubTab('list');
        resetForm();
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la sauvegarde de l\'exercice.');
    } finally {
      setSavingExercise(false);
    }
  };

  // Archivage d'un exercice
  const handleDeleteExercise = async (ex: Exercise) => {
    if (!window.confirm(`Confirmez-vous l'archivage de l'exercice "${ex.title}" ?`)) {
      return;
    }
    try {
      await dtechApiService.deleteTrainerExercise(ex.id);
      if (onRefresh) await onRefresh();
      alert('Exercice archivé avec succès.');
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    }
  };

  // Lancement de la correction manuelle exclusive d'une copie
  const handleOpenGrading = (attempt: ExerciseAttempt) => {
    setGradingAttempt(attempt);
    const initialScores: Record<string, number> = {};
    const initialComments: Record<string, string> = {};

    attempt.answers.forEach(ans => {
      // Règle formateur : Aucun score automatique n'est pré-rempli.
      // Si une note manuelle a déjà été attribuée lors d'un brouillon précédent, on la reprend.
      // Sinon, on initialise à 0 pour la saisie humaine.
      if (ans.pointsEarned !== undefined && ans.pointsEarned !== null) {
        initialScores[ans.questionId] = ans.pointsEarned;
      } else {
        initialScores[ans.questionId] = 0;
      }
      initialComments[ans.questionId] = ans.trainerComment || '';
    });

    setGradingScores(initialScores);
    setGradingComments(initialComments);
    setGradingGeneralFeedback(attempt.generalFeedback || (attempt.trainerValidation ? 'Copie corrigée et validée.' : ''));
    setGradeSuccessMessage(null);
    setSubTab('grading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enregistrement de la correction manuelle (Brouillon OU Publication officielle)
  const handleSaveGrading = async (confirmOfficialValidation: boolean) => {
    if (!gradingAttempt) return;

    try {
      setSavingGrade(true);
      setGradeSuccessMessage(null);

      const answersGrading = gradingAttempt.answers.map(ans => ({
        questionId: ans.questionId,
        pointsEarned: Number(gradingScores[ans.questionId] !== undefined ? gradingScores[ans.questionId] : 0),
        trainerComment: gradingComments[ans.questionId] || ''
      }));

      await dtechApiService.gradeStudentAttempt(gradingAttempt.id, {
        answersGrading,
        generalFeedback: gradingGeneralFeedback,
        confirmOfficialValidation,
        action: confirmOfficialValidation ? 'publish' : 'save_draft'
      });

      setGradeSuccessMessage(
        confirmOfficialValidation
          ? 'Note officielle validée et publiée avec succès ! Elle est désormais officielle et accessible par l\'étudiant.'
          : 'Brouillon de correction enregistré. La copie reste sous statut « En attente de correction » pour l\'étudiant.'
      );
      if (onRefresh) {
        await onRefresh();
      }

      setTimeout(() => {
        setSubTab('submissions');
        setGradingAttempt(null);
      }, 1500);
    } catch (err: any) {
      alert(`Erreur lors de la notation : ${err.message}`);
    } finally {
      setSavingGrade(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre de navigation interne du moteur d'exercices */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSubTab('list')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'list'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Exercices & TPs créés ({exercises.length})</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setSubTab('create');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingExerciseId ? 'Modifier l\'exercice' : 'Nouveau TP / Exercice'}</span>
          </button>

          <button
            onClick={() => setSubTab('submissions' as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap relative ${
              subTab === 'submissions' || subTab === 'grading'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Copies & Corrections ({attempts.length})</span>
            {pendingCorrectionsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {pendingCorrectionsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('report')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'report'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Rapport Étape 5 (Validation Humaine)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
          <Building className="w-3.5 h-3.5 text-amber-500" />
          <span>Centre d'affectation : <strong className="text-slate-800">{trainerUser.centerName}</strong></span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* VUE 1 : LISTE DES EXERCICES DU FORMATEUR                             */}
      {/* ==================================================================== */}
      {subTab === 'list' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Barre de filtres */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre ou code matière..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={courseFilter}
                onChange={e => setCourseFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">Toutes mes matières</option>
                {assignedCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                ))}
              </select>

              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">Tous mes groupes</option>
                {assignedGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="published">Publiés</option>
                <option value="draft">Brouillons</option>
                <option value="archived">Archivés</option>
              </select>
            </div>
          </div>

          {/* Liste des cartes d'exercices */}
          {filteredExercises.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Aucun exercice créé</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                Vous n'avez pas encore configuré d'exercice ou de TP correspondant à ces critères.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setSubTab('create');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Créer mon premier TP</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map(ex => {
                const exAttempts = attempts.filter(a => a.exerciseId === ex.id);
                const pendingCount = exAttempts.filter(a => a.status === 'submitted').length;
                const isPublished = ex.status === 'published';

                return (
                  <div 
                    key={ex.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Ligne haute : matière, module et statut */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-800">
                          {ex.courseCode} • {ex.moduleTitle}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : (ex.status === 'draft' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600')
                        }`}>
                          {isPublished ? 'Publié' : (ex.status === 'draft' ? 'Brouillon' : 'Archivé')}
                        </span>
                      </div>

                      {/* Titre */}
                      <h4 className="text-base font-bold text-slate-900 mb-1 line-clamp-2">
                        {ex.title}
                      </h4>

                      <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                        {ex.description || 'Aucune description spécifique.'}
                      </p>

                      {/* Groupes assignés */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="text-[11px] text-slate-400 font-semibold">Groupes :</span>
                        {ex.groupNames && ex.groupNames.length > 0 ? (
                          ex.groupNames.map((gName, gIdx) => (
                            <span key={gIdx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {gName}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500">{ex.groupId}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      {/* Données d'activité */}
                      <div className="flex items-center justify-between text-xs text-slate-500 py-2.5 border-t border-slate-100">
                        <span>{ex.questions.length} questions • /{ex.totalPoints} pts</span>
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <strong>{exAttempts.length}</strong> soumissions
                          {pendingCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                              {pendingCount} à corriger
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleEditExercise(ex)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifier</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSubTab('submissions' as any);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Voir les copies</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteExercise(ex)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Archiver cet exercice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 2 : CRÉATION / ÉDITION D'UN EXERCICE                             */}
      {/* ==================================================================== */}
      {subTab === 'create' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800">
                  Étape 4 — Pédagogie Active
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-semibold">{trainerUser.centerName}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {editingExerciseId ? 'Modifier l\'exercice' : 'Créer un Travail Pratique ou Exercice'}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setSubTab('list');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Annuler
            </button>
          </div>

          {/* Feedback messages */}
          {formError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Formulaire des méta-données */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matière assignée */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Matière Assignée (Affectation obligatoire) *
              </label>
              <select
                value={formCourseUnitId}
                onChange={e => {
                  const newCId = e.target.value;
                  setFormCourseUnitId(newCId);
                  const course = assignedCourses.find(c => c.id === newCId);
                  if (course?.modules && course.modules[0]) {
                    setFormModuleId(course.modules[0].id);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {assignedCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                ))}
              </select>
            </div>

            {/* Module de cours */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Module associé au cours *
              </label>
              <select
                value={formModuleId}
                onChange={e => setFormModuleId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {selectedCourseModules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            {/* Titre de l'exercice */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Titre de l'exercice ou du TP *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Ex: TP N°2 — Conception d'API REST & Authentification JWT"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Groupes cibles (Multi-sélection) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Groupes cibles autorisés (Isolation stricte par centre) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {assignedGroups.map(g => {
                  const isChecked = formGroupIds.includes(g.id);
                  return (
                    <label
                      key={g.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500 text-slate-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormGroupIds(prev => [...prev, g.id]);
                          } else {
                            setFormGroupIds(prev => prev.filter(id => id !== g.id));
                          }
                        }}
                        className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-400"
                      />
                      <span className="truncate">{g.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description / Contexte du TP
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Explication succincte des compétences pratiques évaluées..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Consignes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Consignes pour les étudiants
              </label>
              <textarea
                rows={2}
                value={formInstructions}
                onChange={e => setFormInstructions(e.target.value)}
                placeholder="Règles d'évaluation, format des réponses, outils tolérés..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Date limite */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date d'échéance (Optionnel)
              </label>
              <input
                type="date"
                value={formDueDate}
                onChange={e => setFormDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Durée estimée */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Durée estimée (en minutes)
              </label>
              <input
                type="number"
                min={5}
                max={300}
                value={formDurationMinutes}
                onChange={e => setFormDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* ================================================================ */}
          {/* CONSTRUCTEUR DE QUESTIONS                                        */}
          {/* ================================================================ */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-amber-500" />
                  <span>Questions de l'épreuve ({formQuestions.length})</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Total barème actuel : <strong className="text-amber-600 font-black">{calculatedFormTotal} points</strong>
                </p>
              </div>

              {/* Boutons d'ajout rapide par type */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 mr-1">+ Ajouter :</span>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('qcm')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  QCM
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('true_false')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Vrai/Faux
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('short_answer')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Courte
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('long_answer')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Développement
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('file_upload')}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Dépôt Fichier
                </button>
              </div>
            </div>

            {/* Cartes de questions éditables */}
            <div className="space-y-4">
              {formQuestions.map((q, idx) => (
                <div 
                  key={q.id || idx}
                  className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-black uppercase text-slate-600">
                        {q.type === 'qcm' && 'QCM (Auto-corrigé)'}
                        {q.type === 'true_false' && 'Vrai / Faux (Auto-corrigé)'}
                        {q.type === 'short_answer' && 'Réponse Courte (Formule / Mot-clé)'}
                        {q.type === 'long_answer' && 'Développement (Correction Manuelle)'}
                        {q.type === 'file_upload' && 'Dépôt de Fichier (Correction Manuelle)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <label className="text-xs font-bold text-slate-600">Points :</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={q.points}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setFormQuestions(prev => prev.map((item, i) => i === idx ? { ...item, points: val } : item));
                          }}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-black text-center"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-all cursor-pointer"
                        title="Supprimer la question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Énoncé */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Énoncé de la question *
                    </label>
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={e => {
                        const val = e.target.value;
                        setFormQuestions(prev => prev.map((item, i) => i === idx ? { ...item, prompt: val } : item));
                      }}
                      placeholder="Saisissez l'énoncé de la question..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Configuration spécifique QCM */}
                  {q.type === 'qcm' && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">
                        Options de réponse (Cochez la bonne réponse) :
                      </label>
                      <div className="space-y-2">
                        {q.options?.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={q.correctAnswers === opt}
                              onChange={() => {
                                setFormQuestions(prev => prev.map((item, i) => i === idx ? { ...item, correctAnswers: opt } : item));
                              }}
                              className="w-4 h-4 text-amber-500 border-slate-300 focus:ring-amber-400 cursor-pointer"
                              title="Définir comme bonne réponse"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={e => {
                                const newOptVal = e.target.value;
                                setFormQuestions(prev => prev.map((item, i) => {
                                  if (i !== idx) return item;
                                  const updatedOpts = [...(item.options || [])];
                                  const wasCorrect = item.correctAnswers === updatedOpts[optIdx];
                                  updatedOpts[optIdx] = newOptVal;
                                  return {
                                    ...item,
                                    options: updatedOpts,
                                    correctAnswers: wasCorrect ? newOptVal : item.correctAnswers
                                  };
                                }));
                              }}
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            {q.options && q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormQuestions(prev => prev.map((item, i) => {
                                    if (i !== idx) return item;
                                    const updatedOpts = item.options?.filter((_, oIdx) => oIdx !== optIdx);
                                    return { ...item, options: updatedOpts };
                                  }));
                                }}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormQuestions(prev => prev.map((item, i) => {
                            if (i !== idx) return item;
                            const updatedOpts = [...(item.options || []), `Option ${(item.options?.length || 0) + 1}`];
                            return { ...item, options: updatedOpts };
                          }));
                        }}
                        className="text-xs text-amber-600 font-bold hover:underline inline-block mt-1 cursor-pointer"
                      >
                        + Ajouter une option
                      </button>
                    </div>
                  )}

                  {/* Configuration spécifique Vrai / Faux */}
                  {q.type === 'true_false' && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Bonne réponse attendue :
                      </label>
                      <div className="flex items-center gap-4">
                        {['Vrai', 'Faux'].map(choice => (
                          <label key={choice} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name={`tf_${q.id}`}
                              value={choice}
                              checked={q.correctAnswers === choice}
                              onChange={() => {
                                setFormQuestions(prev => prev.map((item, i) => i === idx ? { ...item, correctAnswers: choice } : item));
                              }}
                              className="w-4 h-4 text-amber-500 focus:ring-amber-400"
                            />
                            <span>{choice}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Configuration spécifique Réponse courte */}
                  {q.type === 'short_answer' && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Réponse ou formule exacte attendue (pour auto-correction) :
                      </label>
                      <input
                        type="text"
                        value={q.correctAnswers || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setFormQuestions(prev => prev.map((item, i) => i === idx ? { ...item, correctAnswers: val } : item));
                        }}
                        placeholder="Ex: =MOYENNE(D2:D50)"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                      />
                    </div>
                  )}

                  {/* Configuration Dépôt de fichier */}
                  {q.type === 'file_upload' && (
                    <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Taille Max (MB) :
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={q.maxFileSizeMB || 10}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setFormQuestions(prev => prev.map((item, i) => i === idx ? { ...item, maxFileSizeMB: val } : item));
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Extensions autorisées :
                        </label>
                        <input
                          type="text"
                          value={q.allowedExtensions?.join(', ') || 'pdf, xlsx, docx, zip'}
                          onChange={e => {
                            const exts = e.target.value.split(',').map(s => s.trim().toLowerCase());
                            setFormQuestions(prev => prev.map((item, i) => i === idx ? { ...item, allowedExtensions: exts } : item));
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Explication ou corrigé indicatif */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Explication pédagogique / Corrigé indicatif pour le formateur :
                    </label>
                    <input
                      type="text"
                      value={q.explanation || q.sampleAnswer || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setFormQuestions(prev => prev.map((item, i) => i === idx ? { ...item, explanation: val, sampleAnswer: val } : item));
                      }}
                      placeholder="Commentaires pédagogiques ou barème détaillé..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Barre d'action et publication */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setSubTab('list');
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Annuler
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={savingExercise}
                onClick={() => handleSaveExercise('draft')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                Enregistrer comme Brouillon
              </button>

              <button
                type="button"
                disabled={savingExercise}
                onClick={() => handleSaveExercise('published')}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Publier directement pour le groupe</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 3 : GESTION DES COPIES SOUMISES (SUBMISSIONS LIST)                */}
      {/* ==================================================================== */}
      {subTab === 'submissions' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Bannière déontologique de validation humaine */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>Correction Manuelle Exclusive — Suppression Totale de la Notation Automatique</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase">
                    Norme DTech
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                  Les exercices et quiz sont corrigés et notés exclusivement par le formateur humain. La plateforme ne prend aucune décision pédagogique : 
                  elle enregistre les copies sans calculer ni pré-remplir de points, et ne publie la note officielle qu’après votre validation manuelle.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {pendingCorrectionsCount} copie(s) en attente de correction
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {attempts.length - pendingCorrectionsCount} note(s) officielle(s) publiée(s)
              </span>
            </div>
          </div>

          {/* Filtres de soumission */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubmissionFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                submissionFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Toutes les copies ({attempts.length})
            </button>
            <button
              onClick={() => setSubmissionFilter('PENDING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                submissionFilter === 'PENDING'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>En attente de correction</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black">
                {pendingCorrectionsCount}
              </span>
            </button>
            <button
              onClick={() => setSubmissionFilter('VALIDATED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                submissionFilter === 'VALIDATED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Notes officielles validées</span>
              <span className="text-[11px] opacity-80 font-bold">
                ({attempts.length - pendingCorrectionsCount})
              </span>
            </button>
          </div>

          {attempts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">Aucune soumission reçue pour le moment</h4>
              <p className="text-xs text-slate-500 mt-1">
                Dès que vos étudiants complèteront leurs exercices, leurs copies apparaîtront ici pour correction manuelle et attribution des points.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Étudiant</th>
                      <th className="py-3 px-4">Exercice / Matière</th>
                      <th className="py-3 px-4">Date de soumission</th>
                      <th className="py-3 px-4">Statut de Correction</th>
                      <th className="py-3 px-4 text-center">Points Attribués</th>
                      <th className="py-3 px-4 text-center">Note Officielle</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attempts
                      .filter(att => {
                        if (submissionFilter === 'PENDING') return !att.trainerValidation;
                        if (submissionFilter === 'VALIDATED') return att.trainerValidation;
                        return true;
                      })
                      .map(att => {
                        const isOfficiallyValidated = Boolean(att.trainerValidation);
                        const isSuccess = (att.officialScore20 || att.score20 || 0) >= 10;
                        const hasAudit = Boolean(att.auditTrail);

                        return (
                          <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900">{att.studentName}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{att.studentNumber}</p>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="font-bold text-slate-800 truncate">{att.exerciseTitle}</p>
                              <p className="text-[11px] text-slate-400">{att.courseCode} • {att.moduleTitle}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                              {new Date(att.submittedAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-3.5 px-4">
                              {isOfficiallyValidated ? (
                                <div>
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Corrigée & Publiée
                                  </span>
                                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                                    Par {att.validatedByName || 'Formateur'}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 inline-flex items-center gap-1 animate-pulse">
                                    <Clock className="w-3 h-3" />
                                    En attente de correction
                                  </span>
                                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                    Notation manuelle requise
                                  </p>
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isOfficiallyValidated ? (
                                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                                  {att.officialPoints ?? att.pointsEarned} / {att.maxPoints} pts
                                </span>
                              ) : (
                                <span className="text-slate-400 italic font-semibold text-xs">
                                  -- / {att.maxPoints} pts
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center font-black text-sm">
                              {isOfficiallyValidated ? (
                                <div>
                                  <span className={isSuccess ? 'text-emerald-600' : 'text-rose-600'}>
                                    {att.officialScore20 !== undefined ? `${att.officialScore20} / 20` : `${att.score20} / 20`}
                                  </span>
                                  <p className="text-[10px] font-semibold text-slate-500">
                                    {isSuccess ? 'Validé' : 'Non validé'}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-xs font-semibold">
                                  -- / 20 (En attente)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenGrading(att)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                  isOfficiallyValidated
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                                }`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{isOfficiallyValidated ? 'Consulter / Réviser' : 'Corriger la copie'}</span>
                              </button>
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

      {/* ==================================================================== */}
      {/* VUE 4 : MODAL / INTERFACE DE NOTATION ET VALIDATION HUMAINE D'UNE COPIE */}
      {/* ==================================================================== */}
      {subTab === 'grading' && gradingAttempt && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-fadeIn">
          {/* Header de la copie */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Vérification & Validation Humaine
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-semibold">{gradingAttempt.studentNumber}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Copie de : {gradingAttempt.studentName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Exercice : <strong className="text-slate-800">{gradingAttempt.exerciseTitle}</strong> ({gradingAttempt.courseCode} - {gradingAttempt.moduleTitle})
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubTab('submissions');
                setGradingAttempt(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer self-start sm:self-center"
            >
              Retour aux copies
            </button>
          </div>

          {/* Alerte informative de notation manuelle exclusive */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Correction Manuelle Exclusive — Aucun Score Automatique</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Conformément à la règle de gouvernance DTech Group, aucun score automatique ni pré-attribution de points n'est effectué par la machine. 
              Vous devez analyser chaque réponse de l'étudiant, attribuer manuellement les points dans les champs prévus et rédiger vos appréciations pédagogiques.
              La note finale n'est calculée qu'à partir de vos points saisis et ne devient officielle qu'après votre validation.
            </p>
            {gradingAttempt.auditTrail && (
              <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center gap-2 text-[11px] text-slate-600">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Dernière correction enregistrée par <strong>{gradingAttempt.auditTrail.trainerName}</strong> le {new Date(gradingAttempt.auditTrail.evaluatedAt).toLocaleString('fr-FR')}.
                </span>
              </div>
            )}
          </div>

          {gradeSuccessMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{gradeSuccessMessage}</span>
            </div>
          )}

          {/* Grille des questions et contrôle des points */}
          <div className="space-y-6">
            {gradingAttempt.answers.map((ans, idx) => {
              const currentScore = gradingScores[ans.questionId] !== undefined ? gradingScores[ans.questionId] : 0;
              const currentComment = gradingComments[ans.questionId] !== undefined ? gradingComments[ans.questionId] : (ans.trainerComment || '');

              return (
                <div 
                  key={ans.questionId}
                  className="p-5 rounded-2xl border bg-slate-50/80 border-slate-200 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-600 uppercase">
                        {ans.questionType}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">
                        Barème de la question : <strong>{ans.pointsPossible} points</strong>
                      </span>
                    </div>

                    {/* Saisie manuelle des points par le formateur */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <label className="text-xs font-bold text-slate-700">Points attribués :</label>
                      <input
                        type="number"
                        min={0}
                        max={ans.pointsPossible}
                        step={0.5}
                        value={currentScore}
                        onChange={e => {
                          const val = Math.min(ans.pointsPossible, Math.max(0, Number(e.target.value)));
                          setGradingScores(prev => ({ ...prev, [ans.questionId]: val }));
                        }}
                        placeholder="0"
                        className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-black text-center text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-500">/ {ans.pointsPossible} pts</span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">{ans.questionPrompt}</p>

                  {/* Réponse de l'étudiant */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Réponse fournie par l'étudiant :
                    </span>
                    {ans.fileName ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          <File className="w-4 h-4 text-amber-600" />
                          <span>{ans.fileName}</span>
                          <span className="text-xs text-slate-400 font-normal">({ans.fileSizeBytes})</span>
                        </div>
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Livrable technique déposé
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap font-medium">
                        {ans.studentAnswer || <em className="text-slate-400">(Aucune réponse soumise)</em>}
                      </p>
                    )}
                  </div>

                  {/* Raccourcis d'attribution manuelle */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[11px] text-slate-500 font-medium">Attribution rapide :</span>
                    <button
                      type="button"
                      onClick={() => setGradingScores(prev => ({ ...prev, [ans.questionId]: ans.pointsPossible }))}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Totalité ({ans.pointsPossible} pts)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGradingScores(prev => ({ ...prev, [ans.questionId]: Math.round((ans.pointsPossible / 2) * 10) / 10 }))}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Moitié ({Math.round((ans.pointsPossible / 2) * 10) / 10} pts)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGradingScores(prev => ({ ...prev, [ans.questionId]: 0 }))}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      0 point
                    </button>
                  </div>

                  {/* Commentaire / Annotation pour cette question */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Annotation du formateur sur cette question :
                    </label>
                    <input
                      type="text"
                      value={currentComment}
                      onChange={e => setGradingComments(prev => ({ ...prev, [ans.questionId]: e.target.value }))}
                      placeholder="Commentaire pédagogique ou explication pour l'étudiant..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Appréciation globale et validation */}
          <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Appréciation pédagogique générale du formateur sur la copie :
              </label>
              <textarea
                rows={3}
                value={gradingGeneralFeedback}
                onChange={e => setGradingGeneralFeedback(e.target.value)}
                placeholder="Remarques constructives, analyse méthodologique, recommandations pour le travail en entreprise ou le prochain TP..."
                className="w-full px-3.5 py-2.5 bg-white border border-amber-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Synthèse des points attribués manuellement */}
            {(() => {
              const currentTotalPoints = Object.values(gradingScores).reduce<number>((s, v) => s + (Number(v) || 0), 0);
              const maxPoints = gradingAttempt.maxPoints || 1;
              const calculatedScore20 = Math.round((currentTotalPoints / maxPoints) * 20 * 10) / 10;
              const isValidationSuccess = calculatedScore20 >= 10;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-amber-200">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">Total des points attribués :</span>
                    <span className="text-xl font-black text-slate-900">
                      {currentTotalPoints} / {maxPoints} pts
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">(Somme des saisies manuelles)</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">Note finale calculée :</span>
                    <span className="text-2xl font-black text-amber-700">
                      {calculatedScore20} / 20
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Base officielle DTech Group
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">Décision pédagogique :</span>
                    <span className={`text-sm font-black inline-flex items-center gap-1 mt-1 ${
                      isValidationSuccess ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {isValidationSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {isValidationSuccess ? 'Compétence Validée' : 'Compétence Non Validée'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      (Requiert votre validation expresse)
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Boutons d'action : Brouillon vs Validation officielle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-3 border-t border-amber-200/60">
              <button
                type="button"
                disabled={savingGrade}
                onClick={() => handleSaveGrading(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer le brouillon (Reste en attente de validation)</span>
              </button>

              <button
                type="button"
                disabled={savingGrade}
                onClick={() => handleSaveGrading(true)}
                className="px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Valider et publier la note officielle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VUE 5 : RAPPORT — CORRECTION DU SYSTÈME DE NOTATION                   */}
      {/* ==================================================================== */}
      {subTab === 'report' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  RAPPORT — CORRECTION DU SYSTÈME DE NOTATION
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  DTech Group • Directive Prioritaire : <strong>Suppression Totale de la Notation Automatique & Souveraineté du Formateur</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSubTab('submissions')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Voir les copies
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-700">
            {/* 1. Justification pédagogique */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">1</span>
                <span>Justification pédagogique de la suppression</span>
              </div>
              <p className="leading-relaxed">
                Les évaluations et quiz de DTech Group sanctionnent des compétences professionnelles réelles qui ne peuvent être réduites à un traitement algorithmique binaire. 
                La plateforme ne doit <strong>jamais prendre de décision pédagogique</strong> à la place de l’équipe enseignante. 
                La suppression intégrale des scores automatiques et provisoires préserve la légitimité du diplôme, évite les biais de scoring sur les démarches partielles et recentre l'évaluation sur l'appréciation humaine contextualisée du formateur.
              </p>
            </div>

            {/* 2. Nouveau flux de correction manuelle */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">2</span>
                <span>Nouveau flux de correction manuelle</span>
              </div>
              <p className="leading-relaxed">
                Le flux est rigoureusement séquentiel et auditable :
                <br />
                <strong>1. Soumission :</strong> L'étudiant dépose sa copie (QCM, texte ou livrable). Aucun calcul n'est déclenché, aucun point n'est alloué.
                <br />
                <strong>2. État d'attente :</strong> La copie entre immédiatement dans la file de correction avec le statut <code>En attente de correction</code>.
                <br />
                <strong>3. Évaluation humaine :</strong> Le formateur assigné analyse chaque réponse et saisit manuellement les points.
                <br />
                <strong>4. Validation / Publication :</strong> Le formateur valide expressément la note officielle, qui est alors inscrite au dossier académique.
              </p>
            </div>

            {/* 3. Fonctionnement de l’interface formateur */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">3</span>
                <span>Fonctionnement de l’interface formateur</span>
              </div>
              <p className="leading-relaxed">
                L’interface de correction respecte strictement le cahier des charges :
                affichage clair de l’énoncé, du barème (/N pts) et de la réponse soumise (texte ou livrable téléchargeable). 
                <strong> Aucun score n'est pré-rempli par la machine</strong>. 
                Des champs de saisie manuelle permettent d'entrer les points, accompagnés d'annotations par question et d'une appréciation générale. 
                Le formateur dispose de deux actions explicites : <em>« Enregistrer le brouillon »</em> (conserve la saisie sans publier) ou <em>« Valider et publier la note officielle »</em>.
              </p>
            </div>

            {/* 4. Affichage côté étudiant avant et après validation */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">4</span>
                <span>Affichage côté étudiant (Avant / Après)</span>
              </div>
              <p className="leading-relaxed">
                <strong>Avant validation formateur :</strong> L'étudiant voit exclusivement le badge <code>En attente de correction</code> et la mention <em>« Copie soumise — En attente de correction par votre formateur »</em>. Tout score partiel, pourcentage ou note sur 20 est totalement masqué au niveau de l'API et de l'interface.
                <br />
                <strong>Après validation formateur :</strong> Dès la publication officielle, l'étudiant accède à sa note officielle sur 20, aux points attribués, aux annotations question par question et à l'appréciation globale signée par le formateur.
              </p>
            </div>

            {/* 5. Mesures de sécurité appliquées */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">5</span>
                <span>Mesures de sécurité et cloisonnement</span>
              </div>
              <p className="leading-relaxed">
                Le serveur applique une triple barrière d'autorisation au niveau du endpoint <code>POST /api/trainer/attempts/:id/grade</code> :
                vérification de l'appartenance au même centre de formation (<code>centerId</code>),
                contrôle des matières assignées au formateur (<code>teachingUnits</code> / <code>dynamicAssignments</code>) et 
                contrôle des groupes/promotions rattachés (<code>assignedGroupIds</code>). Toute tentative d'évaluation illégitime est rejetée par une erreur 403 Forbidden.
              </p>
            </div>

            {/* 6. Traçabilité intégrale des corrections */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">6</span>
                <span>Garantie de la traçabilité des corrections (Audit)</span>
              </div>
              <p className="leading-relaxed">
                Chaque action de notation génère un enregistrement inaltérable d'audit (<code>auditTrail</code>) consignant :
                l’identité et l’identifiant du formateur correcteur, la date et l’heure de chaque modification, le détail des points attribués question par question, 
                la date et l’heure de validation officielle, l’horodatage de publication et les appréciations rédigées. Cette piste garantit une transparence probante absolue en cas de réclamation académique.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs text-emerald-800">
              <strong className="font-bold">Conformité DTech Group validée : </strong>
              La suppression totale de la notation automatique et l'exclusivité de la correction manuelle humaine sont rigoureusement effectives sur l'ensemble de la plateforme (API backend, base de données, interface formateur et portail étudiant).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
