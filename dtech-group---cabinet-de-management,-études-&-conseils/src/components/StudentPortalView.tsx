import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Award, 
  CheckCircle2, 
  Download, 
  Clock, 
  Calendar, 
  Check, 
  MapPin, 
  Info, 
  Phone, 
  Mail, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  FileCheck,
  TrendingUp,
  BookmarkCheck,
  Users,
  ShieldCheck,
  Building,
  CheckCircle,
  AlertTriangle,
  FileBadge,
  Printer,
  Sparkles,
  Search,
  Eye,
  Tag,
  Filter,
  ExternalLink,
  X,
  HelpCircle,
  History
} from 'lucide-react';
import { AuthUser, VerifiedCertificate, AppNotification } from '../types';
import { dtechApiService } from '../services/dtechApiService';
import { 
  DTECH_COURSE_UNITS, 
  DTECH_COURSE_RESOURCES, 
  DTECH_ATTENDANCES, 
  DTECH_GRADES,
  DTECH_RECEIPTS,
  DTECH_STUDENTS_PROFILES,
  DTECH_EXERCISES,
  DTECH_EXERCISE_ATTEMPTS
} from '../data/dtechBusinessData';
import { StudentGuideTab } from './StudentGuideTab';
import { StudentExercisesView } from './StudentExercisesView';
import { StudentQuizzesView } from './StudentQuizzesView';
import { StudentAttemptsView } from './StudentAttemptsView';
import { ModuleEvaluationsView } from './ModuleEvaluationsView';
import { StudentDiplomaView } from './StudentDiplomaView';

interface StudentPortalViewProps {
  currentUser?: AuthUser | null;
  certificates?: VerifiedCertificate[];
  onOpenCertificate?: (cert: VerifiedCertificate) => void;
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onNavigate?: (path: string) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentUser,
  certificates = [],
  onOpenCertificate,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'formation' | 'courses' | 'resources' | 'exercises' | 'quizzes' | 'attempts' | 'planning' | 'evaluations' | 'attendance' | 'registration' | 'guide'>('dashboard');
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [resourceSearchQuery, setResourceSearchQuery] = useState<string>('');
  const [resourceCourseFilter, setResourceCourseFilter] = useState<string>('ALL');
  const [previewPdfResource, setPreviewPdfResource] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await dtechApiService.getStudentDashboard();
        setStudentData(data);
      } catch (err: any) {
        setError(err.message || 'Impossible de charger vos informations étudiantes.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownloadResource = async (resource: any) => {
    try {
      await dtechApiService.getSecureResourceAccess(resource.id);
      setDownloadSuccess(`Téléchargement de "${resource.title}" autorisé.`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: any) {
      alert(`Erreur d'accès : ${err.message}`);
    }
  };

  const student = studentData?.student || {
    name: currentUser?.name || 'Koffi Mawuli AGBEGNINOU',
    email: currentUser?.email || 'etudiant@dtech.tg',
    phone: currentUser?.phone || '+228 90 77 88 99',
    studentNumber: currentUser?.studentNumber || 'DTECH-2026-0104',
    center: { name: currentUser?.centerName || 'Lomé Avédji (Siège)', city: 'Lomé Avédji', address: 'Avédji Carrefour Limousine' },
    formation: { id: 'c9-developpement-web-mobile', title: currentUser?.formationTitle || 'DÉVELOPPEMENT WEB & MOBILE', programType: 'Formation Professionnelle (Diplôme d’État)' },
    promotion: { name: currentUser?.promotionName || 'Promotion Janvier 2026', startDate: '2026-01-12' },
    group: { name: currentUser?.groupName || 'Groupe 1 — Matin (08h30 - 12h30)', schedule: 'Lun - Ven : 08h30 - 12h30', room: 'Lab Informatique Alpha' },
    overallProgressPercent: 55,
    registrationFeePaid: true,
    registrationReceiptNumber: 'REC-2026-0089'
  };

  const defaultCourses = DTECH_COURSE_UNITS.filter(
    c => c.formationId === 'common' || c.formationId === 'c9-developpement-web-mobile'
  );
  const defaultResources = DTECH_COURSE_RESOURCES.filter(
    r => (r.status === 'published' || !r.status) && (r.groupIds.includes('grp-jan26-dev-g1') || r.groupIds.includes('all'))
  );

  const courses = (studentData?.courses && studentData.courses.length > 0) ? studentData.courses : defaultCourses;
  const rawResources = (studentData?.resources && studentData.resources.length > 0) ? studentData.resources : defaultResources;
  // Ensure only published resources are visible to students
  const resources = rawResources.filter((r: any) => r.status === 'published' || !r.status);
  const attendances = (studentData?.attendances && studentData.attendances.length > 0) ? studentData.attendances : DTECH_ATTENDANCES.filter(a => a.studentId === 'usr_student_01');
  const grades = (studentData?.grades && studentData.grades.length > 0) ? studentData.grades : DTECH_GRADES.filter(g => g.studentId === 'usr_student_01');
  const receipt = studentData?.receipt || DTECH_RECEIPTS[0];

  // Filtered resources based on search and course filter
  const filteredResources = useMemo(() => {
    return resources.filter((res: any) => {
      const matchesCourse = resourceCourseFilter === 'ALL' || res.courseId === resourceCourseFilter || res.courseCode === resourceCourseFilter;
      const q = resourceSearchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        res.title?.toLowerCase().includes(q) || 
        res.description?.toLowerCase().includes(q) || 
        res.courseTitle?.toLowerCase().includes(q) ||
        res.authorName?.toLowerCase().includes(q) ||
        res.fileName?.toLowerCase().includes(q);
      return matchesCourse && matchesQuery;
    });
  }, [resources, resourceCourseFilter, resourceSearchQuery]);

  const totalAttendances = attendances.length;
  const presentCount = attendances.filter((a: any) => a.status === 'present').length;
  const attendanceRate = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 92;

  const avgGrade = grades.length > 0
    ? (grades.reduce((acc: number, g: any) => acc + g.score, 0) / grades.length).toFixed(1)
    : '16.5';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-2xl shrink-0 shadow-inner">
                {student.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Étudiant Régulier
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    N° {student.studentNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Diplôme d’État METFP
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('guide')}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3 text-amber-400" />
                    <span>Guide de l’Étudiant</span>
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {student.name}
                </h1>
                <p className="text-sm text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium">
                    <Building className="w-4 h-4 text-amber-400" />
                    {student.center?.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    {student.promotion?.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-indigo-200">
                    <Users className="w-4 h-4 text-indigo-400" />
                    {student.group?.name}
                  </span>
                </p>
              </div>
            </div>

            {/* Global Progression */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[260px] md:max-w-xs">
              <div className="flex items-center justify-between text-xs font-medium text-slate-200 mb-2">
                <span>Progression Globale du Cursus</span>
                <span className="text-amber-400 font-bold text-base">{student.overallProgressPercent}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${student.overallProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2">
                <span>Formation en cours</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Inscription Validée
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 relative">
          <div className="relative flex items-center">
            <button
              onClick={() => {
                const el = document.getElementById('student-tab-nav');
                if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
              }}
              aria-label="Défiler vers la gauche"
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white/80 hover:text-white shrink-0 mr-1.5 shadow-sm border border-white/10 z-10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <nav
              id="student-tab-nav"
              className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent scroll-smooth w-full no-scrollbar sm:scrollbar-thin"
            >
              {[
                { id: 'dashboard', label: 'Vue d’ensemble', icon: Layers },
                { id: 'formation', label: 'Ma formation', icon: GraduationCap },
                { id: 'courses', label: 'Mes cours', icon: BookOpen },
                { id: 'resources', label: 'Mes supports (PDFs)', icon: FileText },
                { id: 'exercises', label: 'Exercices & TPs', icon: BookmarkCheck },
                { id: 'quizzes', label: 'Mes Quiz', icon: HelpCircle },
                { id: 'attempts', label: 'Mes tentatives', icon: History },
                { id: 'planning', label: 'Mon planning', icon: Clock },
                { id: 'evaluations', label: 'Évaluations & Notes', icon: Award },
                { id: 'diploma', label: 'Mon Diplôme', icon: ShieldCheck },
                { id: 'attendance', label: 'Mes présences', icon: CheckCircle },
                { id: 'registration', label: 'Mon inscription & Reçu', icon: FileBadge },
                { id: 'guide', label: 'Guide & Aide', icon: BookOpen }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={() => {
                const el = document.getElementById('student-tab-nav');
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

      {downloadSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {downloadSuccess}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 1 : DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Formation Active</p>
                  <p className="text-base font-bold text-slate-900 mt-1 line-clamp-1">{student.formation?.title}</p>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">1 seule formation en cours</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Moyenne Générale</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{avgGrade} <span className="text-sm font-normal text-slate-500">/ 20</span></p>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">Mention Bien</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taux de Présence</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{attendanceRate}%</p>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">Assiduité conforme</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supports Autorisés</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{resources.length}</p>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">Directement publiés</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Course of the Day & Official Center Notice */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Emploi du temps & Cours du jour</h2>
                    <p className="text-xs text-slate-500">Groupe : {student.group?.name} — Salle : {student.group?.room}</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
                    Aujourd’hui
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold">
                        08h
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Développement Web Front-End Moderne (React & TypeScript)</p>
                        <p className="text-xs text-slate-600 mt-0.5">Formateur : Ing. Kodjo AMENYONA • Lab Informatique Alpha</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-100 text-indigo-800 shrink-0">
                      08h30 - 12h30
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 opacity-75">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-400 text-white flex items-center justify-center shrink-0 font-bold">
                        14h
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Atelier Pratique & Travaux Dirigés en Salle Informatique</p>
                        <p className="text-xs text-slate-600 mt-0.5">Auto-formation accompagnée • Projets individuels</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 shrink-0">
                      14h00 - 17h00
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <button 
                    onClick={() => setActiveTab('planning')}
                    className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1"
                  >
                    Voir tout l’emploi du temps hebdomadaire <ChevronRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('resources')}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                  >
                    Accéder aux supports PDF
                  </button>
                </div>
              </div>

              {/* Center Notice & Administration Info */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    Centre de Rattachement
                  </div>
                  <h3 className="text-xl font-bold text-white">{student.center?.name}</h3>
                  <p className="text-xs text-slate-300 mt-1">{student.center?.address}</p>

                  <div className="my-5 p-4 rounded-xl bg-white/10 border border-white/10 text-xs space-y-2">
                    <p className="font-semibold text-amber-300">Rappel Administratif & Scolarité</p>
                    <p className="text-slate-200 leading-relaxed">
                      Vos frais d’inscription (25 000 FCFA) ont été réglés en ligne. Les tranches de scolarité sont à verser physiquement à la caisse du secrétariat de votre centre.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <span>Secrétariat : (+228) 92 89 89 79</span>
                  <button 
                    onClick={() => setActiveTab('registration')}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Voir mon reçu
                  </button>
                </div>
              </div>
            </div>

            {/* Travaux Pratiques & Exercices Pratiques récents */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold shrink-0">
                    <BookmarkCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Travaux Pratiques & Exercices d'Application</h3>
                    <p className="text-xs text-slate-500">Mises en situation pratiques et dépôts de livrables corrigés par vos formateurs</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('exercises')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <span>Accéder à mes exercices</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(studentData?.exercises?.length ? studentData.exercises : DTECH_EXERCISES).slice(0, 2).map((ex: any) => (
                  <div key={ex.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition-all">
                    <div className="truncate">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                          {ex.courseCode}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {ex.moduleTitle}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{ex.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ex.questions?.length || 0} questions • Barème : /{ex.totalPoints} pts</p>
                    </div>

                    <button
                      onClick={() => setActiveTab('exercises')}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                    >
                      Démarrer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 : MA FORMATION (PARCOURS PÉDAGOGIQUE PHASE 1 & 2) */}
        {activeTab === 'formation' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Filière Unique Active
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-2">{student.formation?.title}</h2>
                  <p className="text-sm text-slate-600 mt-1">{student.formation?.programType}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Centre de formation</span>
                  <span className="font-bold text-slate-800">{student.center?.name}</span>
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="mt-8 space-y-10">
                {/* Phase 1 */}
                <div className="relative pl-8 border-l-2 border-indigo-600">
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    1
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">Phase 1 : Tronc Commun Professionnel</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Complété à 90%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Fondamentaux obligatoires partagés par tous les étudiants du centre DTECH</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-xs font-bold text-indigo-700">CPT-101</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">Comptabilité SYSCOHADA</p>
                        <p className="text-xs text-slate-500 mt-1">Principes de gestion, flux et TVA</p>
                        <div className="mt-3 flex items-center text-xs text-emerald-600 font-semibold gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Validé (Note : 16.5/20)
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-xs font-bold text-indigo-700">INF-101</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">Informatique Bureautique</p>
                        <p className="text-xs text-slate-500 mt-1">Excel avancé & Outils collaboratifs</p>
                        <div className="mt-3 flex items-center text-xs text-emerald-600 font-semibold gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Validé (Note : 18.0/20)
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-xs font-bold text-indigo-700">ANG-101</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">Anglais Professionnel</p>
                        <p className="text-xs text-slate-500 mt-1">Vocabulaire technique & Rédaction</p>
                        <div className="mt-3 flex items-center text-xs text-emerald-600 font-semibold gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Validé (Note : 15.0/20)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="relative pl-8">
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">
                    2
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">Phase 2 : Spécialisation Métier & Pratique Avancée</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        En Cours Actif
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Modules spécialisés spécifiques à votre filière Développeur Web & Mobile</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-amber-700">DEV-201</span>
                          <span className="text-xs font-bold text-amber-800">60% complété</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 mt-1">Développement Web Front-End (HTML5, Tailwind, React, TS)</p>
                        <p className="text-xs text-slate-600 mt-1">Architecture SPA, Composants modulaires et consommation d’API</p>
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }} />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-indigo-700">DEV-202</span>
                          <span className="text-xs font-bold text-slate-600">30% complété</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 mt-1">Backend Node.js, Express & Bases de Données</p>
                        <p className="text-xs text-slate-600 mt-1">REST APIs sécurisées, Tokens JWT et paiement Mobile Money</p>
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: '30%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 : MES COURS */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Unités d’Enseignement Assignées à Votre Groupe</h2>
                <p className="text-xs text-slate-500">Groupe : {student.group?.name} • Centre : {student.center?.name}</p>
              </div>
              <button
                onClick={() => setActiveTab('resources')}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 self-start cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Accéder à tous les supports PDF ({resources.length})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course: any) => {
                const courseResources = resources.filter((r: any) => r.courseId === course.id || r.courseCode === course.code);
                return (
                  <div key={course.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {course.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{course.hours} Heures Présentielles</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{course.title}</h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{course.description}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400">Formateur responsable :</p>
                          <p className="text-xs text-indigo-600 font-bold">{course.trainerName}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg">
                          {courseResources.length} support(s) PDF
                        </span>
                      </div>

                      {/* Modules avec supports rattachés */}
                      <div className="mt-4 space-y-2.5">
                        <p className="text-xs font-bold text-slate-700">Découpage Modulaire & Supports :</p>
                        {course.modules?.map((m: any, idx: number) => {
                          const moduleResources = courseResources.filter((r: any) => r.moduleId === m.id || (!r.moduleId && idx === 0));
                          return (
                            <div key={m.id || idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span>{m.title}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">Module {idx + 1}</span>
                              </div>

                              {moduleResources.length > 0 ? (
                                <div className="space-y-1.5 pt-1 pl-5 border-l-2 border-indigo-200">
                                  {moduleResources.map((res: any) => (
                                    <div key={res.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100">
                                      <div className="flex items-center gap-2 truncate pr-2">
                                        <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                        <span className="font-semibold text-slate-800 truncate">{res.title}</span>
                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded shrink-0">
                                          N°{res.orderIndex || 1}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          onClick={() => setPreviewPdfResource(res)}
                                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded"
                                          title="Aperçu rapide"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDownloadResource(res)}
                                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                          title="Télécharger le PDF"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic pl-5">Aucun document spécifique pour ce module.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button 
                        onClick={() => {
                          setResourceCourseFilter(course.id);
                          setActiveTab('resources');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Filtrer les supports de cette matière <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4 : MES SUPPORTS (PDFS DIRECTS DU FORMATEUR) */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            {downloadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {downloadSuccess}
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Supports Pédagogiques Officiels & Documents PDF</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Documents de cours et exercices mis en ligne par vos formateurs DTech pour vos travaux en classe.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                    {student.group?.name} • Accès Autorisé
                  </span>
                </div>
              </div>

              {/* Filtres et Recherche de supports */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resourceSearchQuery}
                    onChange={(e) => setResourceSearchQuery(e.target.value)}
                    placeholder="Rechercher par titre, matière, formateur, nom de fichier..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                  />
                  {resourceSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setResourceSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="w-full sm:w-64 shrink-0">
                  <select
                    value={resourceCourseFilter}
                    onChange={(e) => setResourceCourseFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                  >
                    <option value="ALL">Toutes les matières ({resources.length})</option>
                    {courses.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Liste des supports PDF */}
              <div className="divide-y divide-slate-100">
                {filteredResources.length > 0 ? (
                  filteredResources.map((res: any) => (
                    <div key={res.id} className="py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/70 px-3 rounded-xl transition-colors">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {res.courseCode || res.courseTitle}
                            </span>
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              Support {String(res.orderIndex || 1).padStart(2, '0')}
                            </span>
                            <span className="text-[11px] text-slate-400">• {res.fileSizeBytes || '3.5 MB'}</span>
                            {res.fileName && (
                              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                {res.fileName}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">{res.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{res.description}</p>
                          <p className="text-[11px] text-slate-400">
                            Mis en ligne par <span className="font-semibold text-slate-600">{res.authorName}</span> {res.uploadedAt && `le ${res.uploadedAt}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => setPreviewPdfResource(res)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" /> Aperçu
                        </button>
                        <button
                          onClick={() => handleDownloadResource(res)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Télécharger PDF
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Aucun support pédagogique ne correspond à vos critères.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Essayez de modifier votre recherche ou de changer de matière.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setResourceSearchQuery('');
                        setResourceCourseFilter('ALL');
                      }}
                      className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4 bis : EXERCICES & TRAVAUX PRATIQUES */}
        {activeTab === 'exercises' && (
          <StudentExercisesView
            exercises={studentData?.exercises?.length ? studentData.exercises : DTECH_EXERCISES}
            attempts={studentData?.attempts?.length ? studentData.attempts : DTECH_EXERCISE_ATTEMPTS}
            studentProfile={student}
            onRefresh={async () => {
              try {
                const refreshed = await dtechApiService.getStudentDashboard();
                setStudentData(refreshed);
              } catch (e) {
                console.error(e);
              }
            }}
          />
        )}

        {/* TAB 4 ter : MES QUIZ OFFICIELS (ÉTAPE 5) */}
        {activeTab === 'quizzes' && (
          <StudentQuizzesView
            studentProfile={student}
            onRefresh={async () => {
              try {
                const refreshed = await dtechApiService.getStudentDashboard();
                setStudentData(refreshed);
              } catch (e) {
                console.error(e);
              }
            }}
          />
        )}

        {/* TAB 4 quater : MES TENTATIVES & HISTORIQUE DES RÉSULTATS (ÉTAPE 7) */}
        {activeTab === 'attempts' && (
          <StudentAttemptsView
            profile={student}
            onNavigateToEvaluation={(type, id) => {
              if (type === 'quiz') {
                setActiveTab('quizzes');
              } else {
                setActiveTab('exercises');
              }
            }}
          />
        )}

        {/* TAB 5 : MON PLANNING */}
        {activeTab === 'planning' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Emploi du Temps Hebdomadaire</h2>
              <p className="text-xs text-slate-500 mt-0.5">Centre : {student.center?.name} • Promotion : {student.promotion?.name}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Jour</th>
                    <th className="p-3">Horaires</th>
                    <th className="p-3">Matière / Unité</th>
                    <th className="p-3">Salle</th>
                    <th className="p-3">Formateur</th>
                    <th className="p-3">Modalité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Lundi</td>
                    <td className="p-3 text-indigo-700 font-semibold">08h30 - 12h30</td>
                    <td className="p-3 font-medium">Développement Front-End React & TypeScript</td>
                    <td className="p-3 text-slate-600">Lab Alpha</td>
                    <td className="p-3 text-slate-600">Ing. Kodjo AMENYONA</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">100% Pratique</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Mardi</td>
                    <td className="p-3 text-indigo-700 font-semibold">08h30 - 12h30</td>
                    <td className="p-3 font-medium">Backend Node.js & Architecture REST</td>
                    <td className="p-3 text-slate-600">Lab Alpha</td>
                    <td className="p-3 text-slate-600">Ing. Kodjo AMENYONA</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">100% Pratique</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Mercredi</td>
                    <td className="p-3 text-indigo-700 font-semibold">08h30 - 12h30</td>
                    <td className="p-3 font-medium">Comptabilité SYSCOHADA & Gestion Financière</td>
                    <td className="p-3 text-slate-600">Salle 2 Gestion</td>
                    <td className="p-3 text-slate-600">Mme Essivi LAWSON</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-semibold">Tronc Commun</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Jeudi</td>
                    <td className="p-3 text-indigo-700 font-semibold">08h30 - 12h30</td>
                    <td className="p-3 font-medium">Atelier Projet Intégrateur Front-End</td>
                    <td className="p-3 text-slate-600">Lab Alpha</td>
                    <td className="p-3 text-slate-600">Ing. Kodjo AMENYONA</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-semibold">Projet Dirigé</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Vendredi</td>
                    <td className="p-3 text-indigo-700 font-semibold">08h30 - 11h30</td>
                    <td className="p-3 font-medium">Anglais Professionnel des Affaires & Pitch</td>
                    <td className="p-3 text-slate-600">Amphi Delxia</td>
                    <td className="p-3 text-slate-600">M. Koffi MENSAH</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] font-semibold">Bilingue</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6 : MES ÉVALUATIONS & NOTES DU MODULE (ÉTAPE 6) */}
        {activeTab === 'evaluations' && (
          <div className="space-y-6">
            <ModuleEvaluationsView
              currentUser={currentUser}
              role="student"
              studentId={student?.userId || currentUser?.id}
              centerId={student?.centerId || currentUser?.centerId}
            />
          </div>
        )}

        {/* TAB OFFICIEL : MON DIPLÔME VISUEL (ÉTAPE 9) */}
        {activeTab === 'diploma' && (
          <div className="space-y-6">
            <StudentDiplomaView currentUser={currentUser} />
          </div>
        )}

        {/* TAB 7 : MES PRÉSENCES */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Feuille d’Émargement & Assiduité</h2>
                <p className="text-xs text-slate-500 mt-0.5">Contrôle de présence obligatoire pour l’obtention du Diplôme d’État</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                Taux de présence : {attendanceRate}%
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {attendances.map((att: any) => (
                <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{att.courseTitle}</p>
                    <p className="text-slate-500">{att.date} • Formateur : {att.trainerName}</p>
                    {att.comment && <p className="text-amber-700 italic mt-0.5">{att.comment}</p>}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-semibold ${
                    att.status === 'present' 
                      ? 'bg-emerald-100 text-emerald-800'
                      : att.status === 'late'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {att.status === 'present' ? 'Présent' : att.status === 'late' ? 'En retard' : 'Absent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8 : MON INSCRIPTION & REÇU (25 000 FCFA EN LIGNE) */}
        {activeTab === 'registration' && (
          <div className="space-y-6">
            {/* Official Registration Receipt Card */}
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-300 shadow-md max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-extrabold uppercase px-6 py-1 tracking-wider shadow">
                Reçu Officiel Acquitté
              </div>

              <div className="border-b-2 border-slate-900 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-950">DTECH GROUP</h3>
                  <p className="text-xs font-bold text-indigo-900">CABINET DE MANAGEMENT, ÉTUDES & CONSEILS</p>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">AGRÉMENT N° 003 / METFP / CAB / SE-CPO</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-mono font-bold text-slate-900">REÇU N° {student.registrationReceiptNumber}</p>
                  <p className="text-xs text-slate-500">Date : 08 Janvier 2026</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500 font-semibold">Bénéficiaire (Étudiant)</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{student.name}</p>
                  <p className="text-slate-600 font-mono mt-0.5">Matricule : {student.studentNumber}</p>
                  <p className="text-slate-600">{student.phone}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500 font-semibold">Centre & Promotion</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{student.center?.name}</p>
                  <p className="text-slate-600">{student.promotion?.name}</p>
                  <p className="text-indigo-700 font-semibold">{student.group?.name}</p>
                </div>
              </div>

              <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Désignation</th>
                      <th className="p-3">Mode de Paiement</th>
                      <th className="p-3 text-right">Montant Réglé</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 font-medium">
                        Frais d’Inscription en Ligne — {student.formation?.title}
                      </td>
                      <td className="p-3 text-slate-600">T-Money Togocom (*145#)</td>
                      <td className="p-3 text-right font-extrabold text-slate-900 text-sm">25 000 FCFA</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  Note Importante Concernant les Frais de Scolarité
                </p>
                <p className="leading-relaxed">
                  Ce reçu atteste du paiement intégral de vos <strong>frais d’inscription (25 000 FCFA)</strong>. Les frais de scolarité s’échelonnent selon la formule convenue (60% à la rentrée et 40% au 5ème mois) et sont réglés <strong>exclusivement en personne auprès de la caisse du secrétariat de votre centre</strong>.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-slate-500 text-center sm:text-left">
                  <p className="font-bold text-slate-800">DTECH GROUP — Direction des Admissions</p>
                  <p>Document officiel faisant foi pour l’entrée en salle de cours.</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Imprimer le Reçu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9 : GUIDE & DOCUMENTATION PROPRE À L'ÉTUDIANT */}
        {activeTab === 'guide' && (
          <StudentGuideTab 
            student={student} 
            onNavigateToTab={(tabId) => setActiveTab(tabId as any)} 
          />
        )}
      </main>

      {/* MODAL APERÇU DU SUPPORT PDF POUR L'ÉTUDIANT */}
      {previewPdfResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{previewPdfResource.title}</h3>
                  <p className="text-xs text-slate-500">{previewPdfResource.courseTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewPdfResource(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  PDF
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{previewPdfResource.fileName || 'support_officiel_dtech.pdf'}</p>
                  <p className="text-[11px] text-slate-500">Poids : {previewPdfResource.fileSizeBytes || '3.5 MB'} • Format Portable Document</p>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                {previewPdfResource.description || 'Support pédagogique destiné aux cours en présentiel et séances pratiques dans les centres DTech.'}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block">Formateur</span>
                  <span className="font-bold text-slate-800">{previewPdfResource.authorName}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block">Ordre chronologique</span>
                  <span className="font-bold text-indigo-700">Support n° {previewPdfResource.orderIndex || 1}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setPreviewPdfResource(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadResource(previewPdfResource);
                  setPreviewPdfResource(null);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" /> Télécharger pour révision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
