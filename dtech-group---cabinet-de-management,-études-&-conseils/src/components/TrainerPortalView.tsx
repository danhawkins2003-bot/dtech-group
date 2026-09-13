import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, 
  Users, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  Upload, 
  Award, 
  MapPin, 
  Clock, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Download, 
  Layers, 
  Send, 
  Building, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Search,
  RotateCcw,
  Filter,
  Eye,
  Edit3,
  Trash2,
  AlertCircle,
  ExternalLink,
  Tag,
  Calculator,
  History
} from 'lucide-react';
import { AuthUser, CourseResource } from '../types';
import { dtechApiService } from '../services/dtechApiService';
import { 
  DTECH_COURSE_UNITS, 
  DTECH_GROUPS, 
  DTECH_STUDENTS_PROFILES, 
  DTECH_COURSE_RESOURCES, 
  DTECH_EVALUATIONS,
  DTECH_EXERCISES,
  DTECH_EXERCISE_ATTEMPTS
} from '../data/dtechBusinessData';
import { TrainerGuideTab } from './TrainerGuideTab';
import { TrainerExercisesView } from './TrainerExercisesView';
import { TrainerQuizzesView } from './TrainerQuizzesView';
import { AttemptsHistoryManagementView } from './AttemptsHistoryManagementView';
import { ModuleEvaluationsView } from './ModuleEvaluationsView';

interface TrainerPortalViewProps {
  currentUser?: AuthUser | null;
  onNavigate?: (path: string) => void;
}

export const TrainerPortalView: React.FC<TrainerPortalViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'groups' | 'resources' | 'exercises' | 'quizzes' | 'attempts' | 'grades' | 'attendance' | 'guide'>('dashboard');
  const [gradesViewMode, setGradesViewMode] = useState<'module_engine' | 'manual_entry'>('module_engine');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Formulaire d'ajout direct de support PDF / Document
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resCourseId, setResCourseId] = useState('');
  const [resModuleId, setResModuleId] = useState('');
  const [resGroupIds, setResGroupIds] = useState<string[]>([]);
  const [resFileType, setResFileType] = useState('pdf');
  const [resOrderIndex, setResOrderIndex] = useState<number>(1);
  const [resStatus, setResStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Modal d'édition d'un support existant
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editModuleId, setEditModuleId] = useState('');
  const [editGroupIds, setEditGroupIds] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [editOrderIndex, setEditOrderIndex] = useState<number>(1);
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal d'aperçu de PDF
  const [previewResource, setPreviewResource] = useState<any | null>(null);

  // Filtre pour la liste des supports
  const [resourceCourseFilter, setResourceCourseFilter] = useState('ALL');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');

  // Émargement
  const [selectedCourseForAtt, setSelectedCourseForAtt] = useState('');
  const [selectedGroupForAtt, setSelectedGroupForAtt] = useState('');
  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attSuccess, setAttSuccess] = useState<string | null>(null);

  // Saisie de notes
  const [selectedEvalId, setSelectedEvalId] = useState('');
  const [gradesInput, setGradesInput] = useState<Record<string, string>>({});
  const [savingGrades, setSavingGrades] = useState(false);
  const [gradesSuccess, setGradesSuccess] = useState<string | null>(null);
  const [gradesSearchQuery, setGradesSearchQuery] = useState('');
  const [gradesGroupFilter, setGradesGroupFilter] = useState('ALL');

  // Recherche pour émargement
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dtechApiService.getTrainerDashboard();
      setDashboardData(data);
      if (data.courses?.length > 0) {
        const initialCourse = data.courses[0];
        setResCourseId(initialCourse.id);
        setSelectedCourseForAtt(initialCourse.id);
        if (initialCourse.modules?.length > 0) {
          setResModuleId(initialCourse.modules[0].id);
        }
      }
      if (data.groups?.length > 0) {
        setResGroupIds([data.groups[0].id]);
        setSelectedGroupForAtt(data.groups[0].id);
      }
      if (data.evaluations?.length > 0) {
        setSelectedEvalId(data.evaluations[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger l\'espace formateur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const defaultCourses = DTECH_COURSE_UNITS.filter(c => c.trainerId === 'usr_trainer_01' || c.formationId === 'c9-developpement-web-mobile');
  const defaultGroups = DTECH_GROUPS.filter(g => g.trainerIds?.includes('usr_trainer_01'));
  const defaultStudents = DTECH_STUDENTS_PROFILES;
  const defaultResources = DTECH_COURSE_RESOURCES.filter(r => r.authorId === 'usr_trainer_01');
  const defaultEvals = DTECH_EVALUATIONS;

  const groups = (dashboardData?.groups && dashboardData.groups.length > 0) ? dashboardData.groups : defaultGroups;
  const courses = (dashboardData?.courses && dashboardData.courses.length > 0) ? dashboardData.courses : defaultCourses;
  const students = (dashboardData?.students && dashboardData.students.length > 0) ? dashboardData.students : defaultStudents;
  const resources = (dashboardData?.resources && dashboardData.resources.length > 0) ? dashboardData.resources : defaultResources;
  const evaluations = (dashboardData?.evaluations && dashboardData.evaluations.length > 0) ? dashboardData.evaluations : defaultEvals;

  // Mise à jour du module par défaut quand le cours change dans le formulaire
  const currentSelectedCourse = useMemo(() => {
    return courses.find((c: any) => c.id === resCourseId) || courses[0];
  }, [courses, resCourseId]);

  useEffect(() => {
    if (currentSelectedCourse?.modules && currentSelectedCourse.modules.length > 0) {
      if (!currentSelectedCourse.modules.some((m: any) => m.id === resModuleId)) {
        setResModuleId(currentSelectedCourse.modules[0].id);
      }
    }
  }, [currentSelectedCourse]);

  const handlePublishResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle || !resCourseId || resGroupIds.length === 0) {
      alert('Veuillez renseigner le titre, le cours et au moins un groupe cible.');
      return;
    }

    try {
      setPublishing(true);
      const result = await dtechApiService.publishTrainerResource({
        title: resTitle,
        description: resDesc || (uploadedFile ? `Fichier importé : ${uploadedFile.name}` : ''),
        type: resFileType,
        courseId: resCourseId,
        moduleId: resModuleId,
        promotionId: 'promo-jan-2026',
        groupIds: resGroupIds,
        fileName: uploadedFile ? uploadedFile.name : undefined,
        fileSizeBytes: uploadedFile ? uploadedFile.size : '3.8 MB',
        orderIndex: resOrderIndex,
        status: resStatus
      });

      setPublishSuccess(result.message || 'Support pédagogique importé et publié avec succès !');
      setResTitle('');
      setResDesc('');
      setUploadedFile(null);
      await loadData();
      setTimeout(() => setPublishSuccess(null), 4000);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const openEditModal = (resource: any) => {
    setEditingResource(resource);
    setEditTitle(resource.title);
    setEditDesc(resource.description || '');
    setEditModuleId(resource.moduleId || 'm1');
    setEditGroupIds(resource.groupIds || []);
    setEditStatus(resource.status || 'published');
    setEditOrderIndex(resource.orderIndex || 1);
  };

  const handleSaveEdit = async () => {
    if (!editingResource) return;
    try {
      setSavingEdit(true);
      await dtechApiService.updateTrainerResource(editingResource.id, {
        title: editTitle,
        description: editDesc,
        moduleId: editModuleId,
        groupIds: editGroupIds,
        status: editStatus,
        orderIndex: editOrderIndex
      });
      setEditingResource(null);
      await loadData();
      alert('Support pédagogique mis à jour avec succès !');
    } catch (err: any) {
      alert(`Erreur de modification : ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteResource = async (resourceId: string, resourceTitle: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le support "${resourceTitle}" ?`)) {
      return;
    }
    try {
      await dtechApiService.deleteTrainerResource(resourceId);
      await loadData();
      alert('Support supprimé avec succès.');
    } catch (err: any) {
      alert(`Erreur de suppression : ${err.message}`);
    }
  };

  const handleSaveAttendance = async (student: any, status: 'present' | 'absent' | 'late' | 'excused') => {
    try {
      setAttendanceState(prev => ({ ...prev, [student.userId]: status }));
      await dtechApiService.recordAttendance({
        courseId: selectedCourseForAtt || 'crs-dev-frontend',
        groupId: selectedGroupForAtt || 'grp-jan26-dev-g1',
        studentId: student.userId,
        studentName: student.fullName,
        status
      });
      setAttSuccess(`Présence de ${student.fullName} enregistrée (${status}).`);
      setTimeout(() => setAttSuccess(null), 3000);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    }
  };

  const handleSaveGrade = async (student: any) => {
    const scoreVal = gradesInput[student.userId];
    if (scoreVal === undefined || scoreVal === '') return;

    try {
      setSavingGrades(true);
      const evalObj = dashboardData?.evaluations?.find((e: any) => e.id === selectedEvalId);
      await dtechApiService.recordGrade({
        evaluationId: selectedEvalId,
        evaluationTitle: evalObj?.title || 'Évaluation DTECH',
        studentId: student.userId,
        studentName: student.fullName,
        score: parseFloat(scoreVal),
        maxScore: 20
      });
      setGradesSuccess(`Note de ${student.fullName} enregistrée (${scoreVal}/20).`);
      setTimeout(() => setGradesSuccess(null), 3000);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setSavingGrades(false);
    }
  };

  const trainer = dashboardData?.trainer || {
    id: currentUser?.id || 'usr_trainer_01',
    name: currentUser?.name || 'Ing. Kodjo AMENYONA',
    email: currentUser?.email || 'formateur@dtech.tg',
    speciality: currentUser?.speciality || 'Expert Ingénierie Web & Cloud',
    centerName: currentUser?.centerName || 'Lomé Avédji (Siège)'
  };

  const metrics = dashboardData?.metrics || {
    assignedCoursesCount: courses.length,
    assignedGroupsCount: groups.length,
    assignedStudentsCount: students.length,
    publishedResourcesCount: resources.length
  };

  // Filtrage des ressources pour l'onglet gestion
  const filteredResources = useMemo(() => {
    return resources.filter((res: any) => {
      const matchesCourse = resourceCourseFilter === 'ALL' || res.courseId === resourceCourseFilter;
      const q = resourceSearchQuery.trim().toLowerCase();
      const matchesQuery = !q || 
        res.title.toLowerCase().includes(q) || 
        (res.description && res.description.toLowerCase().includes(q)) ||
        (res.moduleTitle && res.moduleTitle.toLowerCase().includes(q)) ||
        (res.fileName && res.fileName.toLowerCase().includes(q));
      return matchesCourse && matchesQuery;
    });
  }, [resources, resourceCourseFilter, resourceSearchQuery]);

  // Filtrage intelligent des étudiants pour la saisie de notes
  const filteredGradingStudents = useMemo(() => {
    const q = gradesSearchQuery.trim().toLowerCase();
    return students.filter((stu: any) => {
      const matchesSearch = !q ||
        (stu.fullName && stu.fullName.toLowerCase().includes(q)) ||
        (stu.studentNumber && stu.studentNumber.toLowerCase().includes(q)) ||
        (stu.groupName && stu.groupName.toLowerCase().includes(q)) ||
        (stu.email && stu.email.toLowerCase().includes(q));

      const matchesGroup = gradesGroupFilter === 'ALL' || 
        stu.groupId === gradesGroupFilter || 
        stu.groupName === gradesGroupFilter;

      return matchesSearch && matchesGroup;
    });
  }, [students, gradesSearchQuery, gradesGroupFilter]);

  // Filtrage pour l'émargement des présences
  const filteredAttendanceStudents = useMemo(() => {
    const q = attendanceSearchQuery.trim().toLowerCase();
    return students.filter((stu: any) => {
      if (!q) return true;
      return (
        (stu.fullName && stu.fullName.toLowerCase().includes(q)) ||
        (stu.studentNumber && stu.studentNumber.toLowerCase().includes(q)) ||
        (stu.groupName && stu.groupName.toLowerCase().includes(q))
      );
    });
  }, [students, attendanceSearchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b border-indigo-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-2xl shrink-0">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Espace Formateur Agréé
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Publication Directe
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{trainer.name}</h1>
                <p className="text-sm text-slate-300 flex items-center gap-4 mt-1">
                  <span>{trainer.speciality}</span>
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Building className="w-4 h-4 text-amber-400" />
                    {trainer.centerName}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Guide Formateur</span>
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Publier un Support PDF
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 relative">
          <div className="relative flex items-center">
            <button
              onClick={() => {
                const el = document.getElementById('trainer-tab-nav');
                if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
              }}
              aria-label="Défiler vers la gauche"
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white/80 hover:text-white shrink-0 mr-1.5 shadow-sm border border-white/10 z-10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <nav
              id="trainer-tab-nav"
              className="flex items-center space-x-1.5 overflow-x-auto py-2.5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent scroll-smooth w-full no-scrollbar sm:scrollbar-thin"
            >
              {[
                { id: 'dashboard', label: 'Vue d’ensemble', icon: Layers },
                { id: 'courses', label: 'Mes cours', icon: BookOpen },
                { id: 'groups', label: 'Mes groupes & Étudiants', icon: Users },
                { id: 'resources', label: 'Supports pédagogiques (Direct)', icon: FileText },
                { id: 'exercises', label: 'Exercices & TPs', icon: CheckSquare },
                { id: 'quizzes', label: 'Gestion & Évaluation des Quiz', icon: ShieldCheck },
                { id: 'attempts', label: 'Suivi des Tentatives (Max 2)', icon: History },
                { id: 'grades', label: 'Évaluations & Notes', icon: Award },
                { id: 'attendance', label: 'Cahier de Présences', icon: CheckSquare },
                { id: 'guide', label: 'Guide Formateur', icon: BookOpen }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={() => {
                const el = document.getElementById('trainer-tab-nav');
                if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
              }}
              aria-label="Défiler vers la droite"
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white/80 hover:text-white shrink-0 ml-1.5 shadow-sm border border-white/10 z-10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Cours Assignés</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.assignedCoursesCount}</p>
                  <p className="text-xs text-indigo-600 font-medium">Tronc commun & Métier</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Groupes en Charge</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.assignedGroupsCount}</p>
                  <p className="text-xs text-amber-600 font-medium">Jour & Soir</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Étudiants Suivis</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{students.length || 24}</p>
                  <p className="text-xs text-emerald-600 font-medium">Promotion Janvier 2026</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Supports Publiés</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{resources.length}</p>
                  <p className="text-xs text-blue-600 font-medium">En ligne immédiatement</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Uploads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Mes Groupes de Formation</h2>
                <div className="space-y-3">
                  {groups.map((grp: any) => (
                    <div key={grp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{grp.name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{grp.formationTitle} • {grp.schedule}</p>
                        <p className="text-xs text-indigo-600 font-semibold mt-1">Salle : {grp.room}</p>
                      </div>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg">
                        {grp.studentCount} Étudiants
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Derniers Supports PDF Publiés</h2>
                  <button 
                    onClick={() => setActiveTab('resources')}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Ajouter +
                  </button>
                </div>
                <div className="space-y-3">
                  {resources.slice(0, 3).map((res: any) => (
                    <div key={res.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{res.title}</p>
                          <p className="text-[11px] text-slate-500">{res.courseTitle} • {res.fileSizeBytes}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        En ligne
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Moteur d'exercices & Travaux Pratiques Récapitulatif */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Moteur d'Exercices & Travaux Pratiques DTech</h3>
                    <p className="text-xs text-slate-500">Créez des travaux pratiques, publiez pour vos groupes et notez les copies en présentiel</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('exercises')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Gérer les TPs & Noter</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Exercices Actifs</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {(dashboardData?.exercises?.length ? dashboardData.exercises : DTECH_EXERCISES).length}
                  </span>
                  <span className="text-xs text-slate-500">Configuration active</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Copies Soumises</span>
                  <span className="text-2xl font-black text-indigo-600 mt-1 block">
                    {(dashboardData?.attempts?.length ? dashboardData.attempts : DTECH_EXERCISE_ATTEMPTS).length}
                  </span>
                  <span className="text-xs text-slate-500">Toutes promotions confondues</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">En attente de notation</span>
                  <span className="text-2xl font-black text-rose-600 mt-1 block">
                    {(dashboardData?.attempts?.length ? dashboardData.attempts : DTECH_EXERCISE_ATTEMPTS).filter((a: any) => a.status === 'submitted').length}
                  </span>
                  <span className="text-xs text-rose-600 font-medium">À évaluer en présentiel</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MES COURS & UNITÉS D'ENSEIGNEMENT */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Unités d'Enseignement & Modules Pédagogiques</h2>
                <p className="text-xs text-slate-500 mt-0.5">Syllabus officiel, découpage modulaire et supports PDF rattachés</p>
              </div>
              <button
                onClick={() => {
                  if (courses.length > 0) {
                    setResCourseId(courses[0].id);
                    if (courses[0].modules?.length > 0) {
                      setResModuleId(courses[0].modules[0].id);
                    }
                  }
                  setActiveTab('resources');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Publier un Support PDF
              </button>
            </div>

            <div className="space-y-8">
              {courses.map((course: any) => {
                const courseResources = resources.filter((r: any) => r.courseId === course.id);
                return (
                  <div key={course.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-bold rounded-lg">
                            {course.code || 'UE-DTECH'}
                          </span>
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {course.hours || 40} Heures Présentielles
                          </span>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            {course.modules?.length || 1} Module{(course.modules?.length || 1) > 1 ? 's' : ''}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-2">{course.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">{course.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setResCourseId(course.id);
                            if (course.modules?.length > 0) {
                              setResModuleId(course.modules[0].id);
                            }
                            setActiveTab('resources');
                          }}
                          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" /> Ajouter support
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourseForAtt(course.id);
                            setActiveTab('attendance');
                          }}
                          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-amber-700" /> Émarger
                        </button>
                      </div>
                    </div>

                    {/* Modules de la matière */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Découpage Modulaire & Supports Déposés
                      </h4>

                      <div className="grid grid-cols-1 gap-4">
                        {(course.modules && course.modules.length > 0 ? course.modules : [
                          { id: 'm1', title: 'Fondamentaux & Pratique', description: 'Module principal de travaux pratiques', orderIndex: 1, durationHours: course.hours || 40 }
                        ]).map((mod: any, mIdx: number) => {
                          const moduleResources = courseResources.filter((r: any) => 
                            r.moduleId === mod.id || (!r.moduleId && mIdx === 0)
                          );

                          return (
                            <div key={mod.id || mIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                    {mod.orderIndex || mIdx + 1}
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-slate-900">{mod.title}</span>
                                    {mod.durationHours && (
                                      <span className="text-[11px] text-slate-500 ml-2">({mod.durationHours}h)</span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    setResCourseId(course.id);
                                    setResModuleId(mod.id);
                                    setActiveTab('resources');
                                  }}
                                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" /> Associer un PDF à ce module
                                </button>
                              </div>

                              {mod.description && (
                                <p className="text-xs text-slate-500 pl-8.5">{mod.description}</p>
                              )}

                              {/* Supports attachés à ce module */}
                              <div className="pl-0 sm:pl-8.5 pt-2">
                                {moduleResources.length > 0 ? (
                                  <div className="space-y-2">
                                    {moduleResources.map((res: any) => (
                                      <div key={res.id} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0 font-bold text-xs">
                                            <FileText className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-xs font-bold text-slate-900">{res.title}</span>
                                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                                Support {String(res.orderIndex || 1).padStart(2, '0')}
                                              </span>
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                res.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                                                res.status === 'draft' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'
                                              }`}>
                                                {res.status === 'published' ? 'Publié' : res.status === 'draft' ? 'Brouillon' : 'Archivé'}
                                              </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                              {res.fileName || 'document.pdf'} • {res.fileSizeBytes || '3.5 MB'} • Groupes : {res.groupIds?.join(', ') || 'Tous'}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                          <button
                                            onClick={() => setPreviewResource(res)}
                                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                                            title="Aperçu du PDF"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => openEditModal(res)}
                                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                                            title="Modifier les métadonnées"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteResource(res.id, res.title)}
                                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors"
                                            title="Supprimer ce support"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-3 bg-white/60 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                                    Aucun support PDF publié pour ce module. Cliquez sur « Associer un PDF » pour en ajouter un.
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MES GROUPES & ÉTUDIANTS */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Groupes Pédagogiques & Effectifs en Charge</h2>
              <p className="text-xs text-slate-500 mt-0.5">Gestion des salles, horaires et liste des apprenants</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map((group: any) => (
                <div key={group.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                        {group.schedule || 'Horaire défini'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1.5">{group.name}</h3>
                      <p className="text-xs text-indigo-600 font-semibold">{group.formationTitle}</p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-xl">
                      {group.studentCount || 15} Étudiants
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Salle de cours</span>
                      <span className="font-bold text-slate-800">{group.room || 'Salle Alpha'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Centre</span>
                      <span className="font-bold text-slate-800">{trainer.centerName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedGroupForAtt(group.id);
                        setActiveTab('attendance');
                      }}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckSquare className="w-3.5 h-3.5" /> Émargement
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('grades');
                      }}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" /> Saisie Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Liste des étudiants récents */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Apprenants Inscrits dans Vos Groupes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">Étudiant</th>
                      <th className="p-3">Matricule</th>
                      <th className="p-3">Filière</th>
                      <th className="p-3">Groupe</th>
                      <th className="p-3">Progression</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((stu: any) => (
                      <tr key={stu.id}>
                        <td className="p-3 font-bold text-slate-900">{stu.fullName}</td>
                        <td className="p-3 font-mono text-slate-600">{stu.studentNumber}</td>
                        <td className="p-3 text-indigo-700 font-medium">{stu.formationTitle}</td>
                        <td className="p-3 text-slate-600">{stu.groupName}</td>
                        <td className="p-3">
                          <span className="font-bold text-emerald-600">{stu.overallProgressPercent || 45}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUPPORTS PÉDAGOGIQUES (FORMULAIRE DE PUBLICATION DIRECTE & GESTION) */}
        {activeTab === 'resources' && (
          <div className="space-y-8">
            {/* Formulaire de publication immédiate sans validation admin */}
            <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                <Upload className="w-5 h-5" />
                Publication Directe de Support de Cours
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Mettre à disposition un nouveau support pédagogique
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Règle métier DTECH : En tant que formateur titulaire, votre document PDF est <strong>immédiatement accessible</strong> à vos groupes cibles sans validation préalable de l'administration.
              </p>

              {publishSuccess && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {publishSuccess}
                </div>
              )}

              <form onSubmit={handlePublishResource} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Titre du Support *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Manuel Pratique React 18 & Composants UI"
                      value={resTitle}
                      onChange={(e) => setResTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">N° d'Ordre Chronologique</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={resOrderIndex}
                      onChange={(e) => setResOrderIndex(parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Matière / Unité d’Enseignement *</label>
                    <select
                      value={resCourseId}
                      onChange={(e) => setResCourseId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {courses.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Module Certifié Rattaché *</label>
                    <select
                      value={resModuleId}
                      onChange={(e) => setResModuleId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {(currentSelectedCourse?.modules || [
                        { id: 'm1', title: 'Module 1 : Fondamentaux' }
                      ]).map((m: any) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Statut Initial</label>
                    <select
                      value={resStatus}
                      onChange={(e: any) => setResStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                    >
                      <option value="published">Publié (immédiatement accessible)</option>
                      <option value="draft">Brouillon (non visible des étudiants)</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </div>
                </div>

                {/* Choix des groupes cibles */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Groupes Cibles Autorisés * (Sélectionnez au moins un groupe)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {groups.map((g: any) => {
                      const isSelected = resGroupIds.includes(g.id);
                      return (
                        <button
                          type="button"
                          key={g.id}
                          onClick={() => {
                            if (isSelected) {
                              setResGroupIds(resGroupIds.filter(id => id !== g.id));
                            } else {
                              setResGroupIds([...resGroupIds, g.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isSelected 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <CheckSquare className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          {g.name} ({g.formationTitle})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Zone d'importation de fichier */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fichier PDF du Support de Cours *
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        setUploadedFile({
                          name: file.name,
                          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                          type: file.type || 'application/pdf'
                        });
                        if (!resTitle) {
                          setResTitle(file.name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : uploadedFile
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-slate-300 hover:border-indigo-400 bg-slate-50'
                    }`}
                    onClick={() => {
                      const input = document.getElementById('trainer-file-upload-input');
                      if (input) input.click();
                    }}
                  >
                    <input
                      id="trainer-file-upload-input"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setUploadedFile({
                            name: file.name,
                            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                            type: file.type || 'application/pdf'
                          });
                          if (!resTitle) {
                            setResTitle(file.name.replace(/\.[^/.]+$/, ''));
                          }
                        }
                      }}
                    />

                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900">{uploadedFile.name}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold">
                            Fichier prêt pour diffusion directe ({uploadedFile.size})
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 ml-4 font-bold"
                        >
                          Changer
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                        <p className="text-xs font-bold text-slate-800">
                          Glissez-déposez votre support de cours ici ou <span className="text-indigo-600 underline">parcourez vos fichiers</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Formats : PDF (recommandé pour les cours), Word, Diaporamas (.pptx), TP (.zip)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description / Consignes Pédagogiques</label>
                  <textarea
                    rows={2}
                    placeholder="Précisez les prérequis, les chapitres abordés et les exercices à préparer en atelier..."
                    value={resDesc}
                    onChange={(e) => setResDesc(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={publishing}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {publishing ? 'Publication en cours...' : 'Publier Immédiatement'}
                  </button>
                </div>
              </form>
            </div>

            {/* Liste et gestion des supports existants */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Supports Pédagogiques Publiés ({filteredResources.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Documents diffusés auprès des étudiants de votre centre</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <select
                    value={resourceCourseFilter}
                    onChange={(e) => setResourceCourseFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium w-full sm:w-auto"
                  >
                    <option value="ALL">Toutes les matières ({courses.length})</option>
                    {courses.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>

                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={resourceSearchQuery}
                      onChange={(e) => setResourceSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredResources.length > 0 ? (
                  filteredResources.map((res: any) => (
                    <div key={res.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">{res.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                              Support {String(res.orderIndex || 1).padStart(2, '0')}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              res.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                              res.status === 'draft' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {res.status === 'published' ? 'Publié' : res.status === 'draft' ? 'Brouillon' : 'Archivé'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{res.description}</p>
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-600">{res.courseTitle}</span>
                            <span>•</span>
                            <span>{res.fileName || 'support.pdf'} ({res.fileSizeBytes || '3.5 MB'})</span>
                            <span>•</span>
                            <span>Groupes : {res.groupIds?.join(', ') || 'Tous'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          onClick={() => setPreviewResource(res)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Aperçu
                        </button>
                        <button
                          onClick={() => openEditModal(res)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteResource(res.id, res.title)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Supprimer
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Aucun support ne correspond à vos critères.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4 bis : MOTEUR D'EXERCICES ET TRAVAUX PRATIQUES */}
        {activeTab === 'exercises' && (
          <TrainerExercisesView
            exercises={dashboardData?.exercises?.length ? dashboardData.exercises : DTECH_EXERCISES}
            attempts={dashboardData?.attempts?.length ? dashboardData.attempts : DTECH_EXERCISE_ATTEMPTS}
            trainerUser={trainer}
            assignedCourses={courses}
            assignedGroups={groups}
            onRefresh={async () => {
              await loadData();
            }}
          />
        )}

        {/* TAB 4 ter : GESTION & ÉVALUATION DES QUIZ (ÉTAPE 5) */}
        {activeTab === 'quizzes' && (
          <TrainerQuizzesView
            currentUser={trainer}
            onRefresh={async () => {
              await loadData();
            }}
          />
        )}

        {/* TAB 4 quater : SUIVI DES TENTATIVES & HISTORIQUE DES RÉSULTATS (ÉTAPE 7) */}
        {activeTab === 'attempts' && (
          <AttemptsHistoryManagementView
            currentUser={currentUser}
            role="trainer"
            centerId={currentUser?.centerId}
          />
        )}

        {/* TAB 5: ÉVALUATIONS & NOTES */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            {/* SUB-TAB TOGGLE (MOTEUR DE CALCUL ÉTAPE 6 VS SAISIE DIRECTE) */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl w-fit">
              <button
                onClick={() => setGradesViewMode('module_engine')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  gradesViewMode === 'module_engine'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>Moteur de Calcul du Module (Étape 6)</span>
              </button>
              <button
                onClick={() => setGradesViewMode('manual_entry')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  gradesViewMode === 'manual_entry'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Saisie & Notation par Épreuve</span>
              </button>
            </div>

            {gradesViewMode === 'module_engine' ? (
              <ModuleEvaluationsView
                currentUser={currentUser}
                role="trainer"
                centerId={currentUser?.centerId}
              />
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Saisie des Notes & Évaluations</h2>
                <p className="text-xs text-slate-500 mt-0.5">Enregistrement direct et transmission pédagogique des notes par étudiant</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-200">
                  {filteredGradingStudents.length} / {students.length} étudiant{students.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {gradesSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{gradesSuccess}</span>
                </div>
                <button 
                  onClick={() => setGradesSuccess(null)}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Barre d'outils, Sélection Évaluation & Recherche Étudiants */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Sélection de l'évaluation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Épreuve / Évaluation :</label>
                  <select
                    value={selectedEvalId}
                    onChange={(e) => setSelectedEvalId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {evaluations.map((ev: any) => (
                      <option key={ev.id} value={ev.id}>{ev.title} ({ev.courseTitle})</option>
                    ))}
                  </select>
                </div>

                {/* 2. Filtre par Groupe */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Filtrer par Groupe :</label>
                  <select
                    value={gradesGroupFilter}
                    onChange={(e) => setGradesGroupFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ALL">Tous les groupes ({groups.length})</option>
                    {groups.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name} — {g.formationTitle}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Barre de Recherche des Étudiants */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rechercher un Étudiant :</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={gradesSearchQuery}
                      onChange={(e) => setGradesSearchQuery(e.target.value)}
                      placeholder="Nom, prénom, matricule (ex: STU-001, Jean)..."
                      className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400 font-medium"
                    />
                    {gradesSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setGradesSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau de Saisie des Notes */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Étudiant</th>
                    <th className="p-3">Matricule</th>
                    <th className="p-3">Groupe Pédagogique</th>
                    <th className="p-3">Note / 20</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGradingStudents.length > 0 ? (
                    filteredGradingStudents.map((stu: any) => (
                      <tr key={stu.userId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{stu.fullName}</td>
                        <td className="p-3 text-slate-600 font-mono font-semibold">{stu.studentNumber}</td>
                        <td className="p-3 text-slate-600">{stu.groupName}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="20"
                            placeholder="Note / 20"
                            value={gradesInput[stu.userId] || ''}
                            onChange={(e) => setGradesInput({ ...gradesInput, [stu.userId]: e.target.value })}
                            className="w-28 px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleSaveGrade(stu)}
                            disabled={savingGrades}
                            className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                          >
                            Enregistrer
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center bg-slate-50">
                        <p className="text-xs font-bold text-slate-700">Aucun étudiant ne correspond à votre recherche "{gradesSearchQuery}"</p>
                        <p className="text-[11px] text-slate-500 mt-1">Veuillez vérifier l'orthographe du nom ou réinitialiser les filtres.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setGradesSearchQuery('');
                            setGradesGroupFilter('ALL');
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Réinitialiser la recherche
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
            )}
          </div>
        )}

        {/* TAB 6: CAHIER DE PRÉSENCES */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Émargement Quotidien des Présences</h2>
                <p className="text-xs text-slate-500 mt-0.5">Cliquez pour valider la présence de chaque étudiant en 1 clic</p>
              </div>

              {/* Barre de recherche dans les présences */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={attendanceSearchQuery}
                  onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                  placeholder="Rechercher un apprenant..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
                {attendanceSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAttendanceSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {attSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                {attSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredAttendanceStudents.length > 0 ? (
                filteredAttendanceStudents.map((stu: any) => {
                  const currentStatus = attendanceState[stu.userId] || 'present';
                  return (
                    <div key={stu.userId} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{stu.fullName}</p>
                        <p className="text-xs text-slate-500 font-mono">{stu.studentNumber}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => handleSaveAttendance(stu, 'present')}
                          className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            currentStatus === 'present' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-emerald-100'
                          }`}
                        >
                          Présent
                        </button>
                        <button
                          onClick={() => handleSaveAttendance(stu, 'late')}
                          className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            currentStatus === 'late' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700 hover:bg-amber-100'
                          }`}
                        >
                          Retard
                        </button>
                        <button
                          onClick={() => handleSaveAttendance(stu, 'absent')}
                          className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            currentStatus === 'absent' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-red-100'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-700">Aucun étudiant trouvé pour « {attendanceSearchQuery} »</p>
                  <button
                    type="button"
                    onClick={() => setAttendanceSearchQuery('')}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Effacer la recherche
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7 : GUIDE & DOCUMENTATION PROPRE AU FORMATEUR */}
        {activeTab === 'guide' && (
          <TrainerGuideTab 
            trainer={trainer} 
            onNavigateToTab={(tabId) => setActiveTab(tabId as any)} 
          />
        )}
      </main>

      {/* MODAL DE MODIFICATION DE SUPPORT */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Modifier le Support Pédagogique</h3>
              </div>
              <button
                onClick={() => setEditingResource(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre du document *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Module Rattaché</label>
                  <select
                    value={editModuleId}
                    onChange={(e) => setEditModuleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  >
                    {(courses.find((c: any) => c.id === editingResource.courseId)?.modules || [
                      { id: 'm1', title: 'Module 1 : Fondamentaux' }
                    ]).map((m: any) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° d'Ordre</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={editOrderIndex}
                    onChange={(e) => setEditOrderIndex(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Statut du support</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                >
                  <option value="published">Publié (accessible aux étudiants)</option>
                  <option value="draft">Brouillon (masqué)</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Groupes Autorisés</label>
                <div className="flex flex-wrap gap-2">
                  {groups.map((g: any) => {
                    const isChecked = editGroupIds.includes(g.id);
                    return (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => {
                          if (isChecked) {
                            setEditGroupIds(editGroupIds.filter(id => id !== g.id));
                          } else {
                            setEditGroupIds([...editGroupIds, g.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                          isChecked ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {g.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Consignes</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingResource(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {savingEdit ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL APERÇU / VISUALISATION DU PDF */}
      {previewResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{previewResource.title}</h3>
                  <p className="text-xs text-slate-500">{previewResource.courseTitle} • {previewResource.fileName || 'support.pdf'}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lecteur / Aperçu de la première page du PDF */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Support de Cours Officiel DTech</h4>
                <p className="text-xs text-slate-600 mt-1">{previewResource.description || 'Support d’accompagnement pour cours présentiels et travaux pratiques.'}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Matière / UE :</span>
                  <span>{previewResource.courseTitle}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Ordre chronologique :</span>
                  <span className="font-bold text-indigo-600">Support {String(previewResource.orderIndex || 1).padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Format & Poids :</span>
                  <span>PDF • {previewResource.fileSizeBytes || '3.5 MB'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Statut :</span>
                  <span className="font-bold text-emerald-600 uppercase">{previewResource.status || 'published'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Groupes autorisés :</span>
                  <span>{previewResource.groupIds?.join(', ') || 'Tous les groupes du centre'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400">Accès sécurisé contrôlé par jeton de session</span>
              <button
                onClick={() => {
                  alert(`Téléchargement sécurisé initié pour le fichier : ${previewResource.fileName || 'support.pdf'}`);
                  setPreviewResource(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Télécharger l'original
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
