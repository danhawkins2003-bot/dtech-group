import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  UserCheck, 
  Clock, 
  FileText, 
  Plus, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  X,
  RotateCcw,
  Trash2,
  History
} from 'lucide-react';
import { AuthUser } from '../types';
import { dtechApiService } from '../services/dtechApiService';
import { 
  DTECH_COURSE_UNITS, 
  DTECH_GROUPS, 
  DTECH_STUDENTS_PROFILES, 
  DTECH_PROMOTIONS, 
  DTECH_CENTERS,
  DTECH_GROUP_COURSE_ASSIGNMENTS
} from '../data/dtechBusinessData';
import { INITIAL_TRAINERS } from '../data/dtechPlatformData';
import { StudyDirectorGuideTab } from './StudyDirectorGuideTab';
import { ModuleEvaluationsView } from './ModuleEvaluationsView';
import { AttemptsHistoryManagementView } from './AttemptsHistoryManagementView';
import { AdminDiplomaManagementView } from './AdminDiplomaManagementView';

interface StudyDirectorPortalViewProps {
  currentUser?: AuthUser | null;
  onNavigate?: (path: string) => void;
}

export const StudyDirectorPortalView: React.FC<StudyDirectorPortalViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'promotions' | 'trainers' | 'students' | 'courses' | 'exams' | 'attempts' | 'guide'>('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Attribution de formateur par matière au groupe
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedCourseUnitId, setSelectedCourseUnitId] = useState('');
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignmentFilterGroup, setAssignmentFilterGroup] = useState('ALL');
  const [assignmentFilterType, setAssignmentFilterType] = useState<'ALL' | 'common_core' | 'specialization'>('ALL');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dtechApiService.getStudyDirectorDashboard();
      setData(res);
      if (res.groups?.length > 0) {
        setSelectedGroupId(res.groups[0].id);
      }
      if (res.courses?.length > 0) {
        setSelectedCourseUnitId(res.courses[0].id);
      }
      if (res.trainers?.length > 0) {
        setSelectedTrainerId(res.trainers[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données pédagogiques.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !selectedCourseUnitId || !selectedTrainerId) {
      setAssignError('Veuillez sélectionner un groupe, une matière et un formateur.');
      return;
    }

    try {
      setAssignError(null);
      const res = await dtechApiService.assignSubjectTrainerToGroup(selectedGroupId, selectedCourseUnitId, selectedTrainerId);
      setAssignSuccess(res.message || 'Affectation pédagogique enregistrée avec succès.');
      await loadData();
      setTimeout(() => setAssignSuccess(null), 4000);
    } catch (err: any) {
      setAssignError(err.message || 'Erreur lors de l’affectation.');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!window.confirm('Confirmer le retrait de cette affectation pédagogique ?')) return;
    try {
      const res = await dtechApiService.removeSubjectTrainerFromGroup(assignmentId);
      setAssignSuccess(res.message || 'Affectation retirée avec succès.');
      await loadData();
      setTimeout(() => setAssignSuccess(null), 3000);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    }
  };

  const director = data?.director || {
    name: currentUser?.name || 'M. Koffi MENSAH',
    email: currentUser?.email || 'directeur.etudes@dtech.tg',
    centerName: currentUser?.centerName || 'Lomé Avédji (Siège)'
  };

  const center = data?.center || DTECH_CENTERS[0];
  const metrics = data?.metrics || { 
    activeStudentsCount: DTECH_STUDENTS_PROFILES.length, 
    activeGroupsCount: DTECH_GROUPS.length, 
    trainersCount: INITIAL_TRAINERS.length, 
    promotionsCount: DTECH_PROMOTIONS.length, 
    coursesCount: DTECH_COURSE_UNITS.length,
    assignmentsCount: 6
  };
  const groups = (data?.groups && data.groups.length > 0) ? data.groups : DTECH_GROUPS;
  const trainers = (data?.trainers && data.trainers.length > 0) ? data.trainers : INITIAL_TRAINERS;
  const students = (data?.students && data.students.length > 0) ? data.students : DTECH_STUDENTS_PROFILES;
  const promotions = (data?.promotions && data.promotions.length > 0) ? data.promotions : DTECH_PROMOTIONS;
  const courses = (data?.courses && data.courses.length > 0) ? data.courses : DTECH_COURSE_UNITS;
  const assignments = (data?.assignments && data.assignments.length > 0) 
    ? data.assignments 
    : DTECH_GROUP_COURSE_ASSIGNMENTS.filter((a: any) => a.centerId === (center.id || 'center-lome-avedji'));

  // Groupe actuellement sélectionné pour filtrer les matières disponibles
  const currentSelectedGroup = groups.find((g: any) => g.id === selectedGroupId) || groups[0];
  const availableCoursesForGroup = courses.filter((c: any) => 
    c.formationId === 'common' || (currentSelectedGroup && c.formationId === currentSelectedGroup.formationId)
  );

  // Filtrage des affectations pour la matrice
  const filteredAssignments = assignments.filter((a: any) => {
    if (assignmentFilterGroup !== 'ALL' && a.groupId !== assignmentFilterGroup) return false;
    if (assignmentFilterType !== 'ALL') {
      const course = courses.find((c: any) => c.id === a.courseUnitId || c.code === a.courseUnitCode);
      if (assignmentFilterType === 'common_core' && course?.phase !== 'common_core') return false;
      if (assignmentFilterType === 'specialization' && course?.phase !== 'specialization') return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b border-indigo-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-2xl shrink-0 shadow-inner">
                <Building className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Direction des Études
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Centre : {center.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('guide')}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Building className="w-3 h-3 text-amber-400" />
                    <span>Guide Direction des Études</span>
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{director.name}</h1>
                <p className="text-sm text-slate-300 flex items-center gap-2 mt-0.5">
                  Supervision pédagogique, coordination des formateurs et validation du cursus
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-xs space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Étudiants du Centre :</span>
                <span className="font-bold text-amber-400">{metrics.activeStudentsCount}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Groupes Actifs :</span>
                <span className="font-bold text-white">{metrics.activeGroupsCount}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Formateurs Actifs :</span>
                <span className="font-bold text-emerald-400">{metrics.trainersCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 relative">
          <div className="relative flex items-center">
            <button
              onClick={() => {
                const el = document.getElementById('director-tab-nav');
                if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
              }}
              aria-label="Défiler vers la gauche"
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white/80 hover:text-white shrink-0 mr-1.5 shadow-sm border border-white/10 z-10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <nav
              id="director-tab-nav"
              className="flex items-center space-x-1.5 overflow-x-auto py-2.5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent scroll-smooth w-full no-scrollbar sm:scrollbar-thin"
            >
              {[
                { id: 'dashboard', label: 'Vue d’ensemble', icon: Layers },
                { id: 'promotions', label: 'Promotions & Groupes', icon: Calendar },
                { id: 'trainers', label: 'Formateurs & Groupes', icon: UserCheck },
                { id: 'students', label: 'Suivi des Étudiants', icon: Users },
                { id: 'courses', label: 'Parcours & Tronc Commun', icon: BookOpen },
                { id: 'exams', label: 'Examens & Diplômes d’État', icon: Award },
                { id: 'diplomas', label: 'Diplômes & Éligibilité', icon: ShieldCheck },
                { id: 'attempts', label: 'Suivi des Tentatives', icon: History },
                { id: 'guide', label: 'Guide Direction Études', icon: BookOpen }
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
                const el = document.getElementById('director-tab-nav');
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
        {/* TAB 1 : DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Étudiants Actifs</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.activeStudentsCount}</p>
                  <p className="text-xs text-indigo-600 font-medium">Inscrits au centre</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Groupes en Cours</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{groups.length}</p>
                  <p className="text-xs text-amber-600 font-medium">Jour & Soir</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Corps Enseignant</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{trainers.length}</p>
                  <p className="text-xs text-emerald-600 font-medium">Formateurs titulaires</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Unités Pédagogiques</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{courses.length}</p>
                  <p className="text-xs text-blue-600 font-medium">Tronc commun & Métiers</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Groups Grid & Trainers List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Groupes Pédagogiques du Centre</h2>
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
                <h2 className="text-lg font-bold text-slate-900 mb-4">Attribution Pédagogique : Matière → Formateur → Groupe</h2>
                {assignSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                    {assignSuccess}
                  </div>
                )}
                {assignError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                    {assignError}
                  </div>
                )}
                <form onSubmit={handleAssignTrainer} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">1. Groupe Cible :</label>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => {
                        setSelectedGroupId(e.target.value);
                        // Auto-ajuster le premier cours disponible
                        const grp = groups.find((g: any) => g.id === e.target.value);
                        const avail = courses.filter((c: any) => c.formationId === 'common' || (grp && c.formationId === grp.formationId));
                        if (avail.length > 0) setSelectedCourseUnitId(avail[0].id);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {groups.map((g: any) => (
                        <option key={g.id} value={g.id}>{g.name} — {g.formationTitle} ({g.schedule})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">2. Matière / Unité d'Enseignement :</label>
                    <select
                      value={selectedCourseUnitId}
                      onChange={(e) => setSelectedCourseUnitId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <optgroup label="Tronc Commun Obligatoire (3 Matières)">
                        {availableCoursesForGroup.filter((c: any) => c.phase === 'common_core').map((c: any) => (
                          <option key={c.id} value={c.id}>
                            [{c.code}] {c.title}
                          </option>
                        ))}
                      </optgroup>
                      {availableCoursesForGroup.some((c: any) => c.phase === 'specialization') && (
                        <optgroup label="Spécialité & Pratique Métier">
                          {availableCoursesForGroup.filter((c: any) => c.phase === 'specialization').map((c: any) => (
                            <option key={c.id} value={c.id}>
                              [{c.code}] {c.title}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">3. Formateur Titulaire :</label>
                    <select
                      value={selectedTrainerId}
                      onChange={(e) => setSelectedTrainerId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {trainers.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.speciality})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Valider l’Attribution Pédagogique
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 : PROMOTIONS & GROUPES */}
        {activeTab === 'promotions' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Promotions Officielles & Sessions de Formation</h2>
              <p className="text-xs text-slate-500 mt-0.5">Calendrier des rentrées et sessions agréées METFP</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotions.map((p: any) => (
                <div key={p.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                        {p.sessionCode}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.status === 'in_progress' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status === 'in_progress' ? 'En cours' : 'Inscriptions ouvertes'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{p.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">Période : {p.startDate} au {p.endDate}</p>
                    <p className="text-xs text-slate-500 mt-2">Capacité : {p.enrolledCount} / {p.capacity} étudiants inscrits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3 : FORMATEURS & GROUPES */}
        {activeTab === 'trainers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Corps Enseignant & Formateurs Titulaires Agréés</h2>
                <p className="text-xs text-slate-500 mt-0.5">Supervision des formateurs, attributions de cours et qualifications</p>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 self-start sm:self-auto">
                {trainers.length} Formateurs en Activité
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((t: any) => (
                <div key={t.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-base shrink-0">
                        {t.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{t.name}</h3>
                        <p className="text-xs text-indigo-600 font-semibold truncate">{t.speciality}</p>
                        <span className="text-[11px] text-slate-400 block mt-0.5">{t.centerName || 'Lomé Avédji'}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <p className="flex items-center justify-between">
                        <span className="text-slate-400">Statut :</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Formateur Titulaire</span>
                      </p>
                      {t.phone && (
                        <p className="flex items-center justify-between">
                          <span className="text-slate-400">Contact :</span>
                          <span className="font-medium text-slate-800">{t.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedTrainerId(t.id);
                        setActiveTab('dashboard');
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Associer à un groupe →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Attribution Pédagogique Granulaire & Matrice des Affectations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulaire d'affectation */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-1">
                <h3 className="text-base font-bold text-slate-900 mb-1">Nouvelle Affectation Pédagogique</h3>
                <p className="text-xs text-slate-500 mb-4">Relier un groupe, une matière et un formateur titulaire</p>

                {assignSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                    {assignSuccess}
                  </div>
                )}
                {assignError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                    {assignError}
                  </div>
                )}

                <form onSubmit={handleAssignTrainer} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">1. Groupe Pédagogique :</label>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => {
                        setSelectedGroupId(e.target.value);
                        const grp = groups.find((g: any) => g.id === e.target.value);
                        const avail = courses.filter((c: any) => c.formationId === 'common' || (grp && c.formationId === grp.formationId));
                        if (avail.length > 0) setSelectedCourseUnitId(avail[0].id);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {groups.map((g: any) => (
                        <option key={g.id} value={g.id}>{g.name} — {g.formationTitle}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">2. Matière / UE à dispenser :</label>
                    <select
                      value={selectedCourseUnitId}
                      onChange={(e) => setSelectedCourseUnitId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <optgroup label="Tronc Commun (3 Matières Distinctes)">
                        {availableCoursesForGroup.filter((c: any) => c.phase === 'common_core').map((c: any) => (
                          <option key={c.id} value={c.id}>
                            [{c.code}] {c.title}
                          </option>
                        ))}
                      </optgroup>
                      {availableCoursesForGroup.some((c: any) => c.phase === 'specialization') && (
                        <optgroup label="Spécialité Métier">
                          {availableCoursesForGroup.filter((c: any) => c.phase === 'specialization').map((c: any) => (
                            <option key={c.id} value={c.id}>
                              [{c.code}] {c.title}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">3. Formateur Titulaire Qualifié :</label>
                    <select
                      value={selectedTrainerId}
                      onChange={(e) => setSelectedTrainerId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {trainers.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.speciality})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Enregistrer l’Affectation
                  </button>
                </form>
              </div>

              {/* Matrice des Affectations du Centre */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Matrice des Affectations du Centre</h3>
                      <p className="text-xs text-slate-500">Cartographie pédagogique Matière ↔ Formateur par Groupe</p>
                    </div>
                    
                    {/* Filtres rapides */}
                    <div className="flex items-center gap-2">
                      <select
                        value={assignmentFilterGroup}
                        onChange={(e) => setAssignmentFilterGroup(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none"
                      >
                        <option value="ALL">Tous les groupes</option>
                        {groups.map((g: any) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>

                      <select
                        value={assignmentFilterType}
                        onChange={(e) => setAssignmentFilterType(e.target.value as any)}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none"
                      >
                        <option value="ALL">Tous types</option>
                        <option value="common_core">Tronc Commun</option>
                        <option value="specialization">Spécialités</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Groupe</th>
                          <th className="p-3">Matière / UE</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Formateur Responsable</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAssignments.length > 0 ? (
                          filteredAssignments.map((asgn: any) => {
                            const grp = groups.find((g: any) => g.id === asgn.groupId);
                            const crs = courses.find((c: any) => c.id === asgn.courseUnitId || c.code === asgn.courseUnitCode);
                            const isCommon = crs?.phase === 'common_core' || asgn.courseUnitCode?.startsWith('CPT') || asgn.courseUnitCode?.startsWith('INF') || asgn.courseUnitCode?.startsWith('ANG');

                            return (
                              <tr key={asgn.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3 font-bold text-slate-900">
                                  {grp?.name || asgn.groupId}
                                  <span className="block text-[11px] font-normal text-slate-500">{grp?.formationTitle}</span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-slate-100 text-indigo-700 text-[11px]">
                                      {asgn.courseUnitCode || crs?.code}
                                    </span>
                                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                                      {asgn.courseUnitTitle || crs?.title}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isCommon 
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                                      : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                  }`}>
                                    {isCommon ? 'Tronc Commun' : 'Spécialité'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="font-bold text-slate-900">{asgn.trainerName}</div>
                                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">Titulaire</span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAssignment(asgn.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Retirer cette affectation"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-500 bg-slate-50/50">
                              Aucune affectation trouvée avec ces critères.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Total : <strong className="text-slate-800">{filteredAssignments.length}</strong> affectation(s) active(s)</span>
                  <span className="text-emerald-700 font-medium">Isolation stricte par centre de formation</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4 : SUIVI ÉTUDIANTS */}
        {activeTab === 'students' && (() => {
          const q = studentSearchQuery.trim().toLowerCase();
          const filteredStudents = students.filter((stu: any) => {
            if (!q) return true;
            return (
              (stu.fullName && stu.fullName.toLowerCase().includes(q)) ||
              (stu.studentNumber && stu.studentNumber.toLowerCase().includes(q)) ||
              (stu.formationTitle && stu.formationTitle.toLowerCase().includes(q)) ||
              (stu.groupName && stu.groupName.toLowerCase().includes(q))
            );
          });

          return (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Registre Pédagogique des Étudiants du Centre</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Fiches individuelles, suivi de parcours et assiduité</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom, matricule, filière..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none placeholder:text-slate-400"
                    />
                    {studentSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setStudentSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 font-bold rounded-xl text-xs border border-amber-200 shrink-0">
                    {filteredStudents.length} / {students.length}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">Étudiant</th>
                      <th className="p-3">Matricule</th>
                      <th className="p-3">Formation Active</th>
                      <th className="p-3">Groupe</th>
                      <th className="p-3">Progression</th>
                      <th className="p-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((stu: any) => (
                        <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{stu.fullName}</td>
                          <td className="p-3 text-slate-600 font-mono font-semibold">{stu.studentNumber}</td>
                          <td className="p-3 font-medium text-indigo-700">{stu.formationTitle}</td>
                          <td className="p-3 text-slate-600">{stu.groupName}</td>
                          <td className="p-3">
                            <span className="font-bold text-amber-600">{stu.overallProgressPercent}%</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              Actif
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center bg-slate-50">
                          <p className="text-xs font-bold text-slate-700">Aucun étudiant trouvé pour « {studentSearchQuery} »</p>
                          <button
                            type="button"
                            onClick={() => setStudentSearchQuery('')}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
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
          );
        })()}

        {/* TAB 5 : PARCOURS & TRONC COMMUN */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Maquette Pédagogique & Unités d’Enseignement</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tronc commun obligatoire, spécialités métiers et conformité METFP</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course: any) => (
                <div key={course.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold rounded-lg">
                        {course.code || 'UE-DTECH'}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {course.hours || 40} Heures
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{course.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{course.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-700 mb-2">Modules certifiants du syllabus :</p>
                      <div className="space-y-1.5">
                        {course.modules?.map((m: any) => (
                          <div key={m.id || m.title} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{m.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Agrément N° 003/METFP</span>
                    <span className="font-bold text-indigo-700">9 Mois + 3 Mois Stage</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6 : EXAMENS & DIPLÔMES D’ÉTAT */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Calendrier des Examens & Délivrance des Diplômes d’État</h2>
                  <p className="text-xs text-slate-500">Validation des jurys officiels, soutenances de stage et certifications reconnues</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-indigo-600">Étape 1</span>
                  <h4 className="text-sm font-bold text-slate-900">Contrôle Continu (40%)</h4>
                  <p className="text-xs text-slate-600">Évaluations mensuelles pratiques et travaux dirigés dans chaque matière.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-600">Étape 2</span>
                  <h4 className="text-sm font-bold text-slate-900">Examen Terminal National (60%)</h4>
                  <p className="text-xs text-slate-600">Épreuves écrites et pratiques sur table avec commission d'évaluation.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-600">Étape 3</span>
                  <h4 className="text-sm font-bold text-slate-900">Stage & Soutenance (3 Mois)</h4>
                  <p className="text-xs text-slate-600">Rapport de stage en entreprise et délivrance du Diplôme d'État.</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-4">Sessions d'Examens Programmées 2026</h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Session Principale Rentrée 14 Septembre</p>
                      <p className="text-slate-500">Examen terminal d'État — Juin 2027 • Jury National METFP</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg">
                      Confirmé
                    </span>
                  </div>
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Session de Soutenance des Rapports de Stage</p>
                      <p className="text-slate-500">Jury de stage 3 Mois — Septembre 2027 • Entreprises partenaires</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg">
                      Planifié
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MOTEUR D'ÉVALUATION DES MODULES & AUDIT PÉDAGOGIQUE (ÉTAPE 6) */}
            <ModuleEvaluationsView
              currentUser={currentUser}
              role="study_director"
              centerId={currentUser?.centerId}
            />
          </div>
        )}

        {/* TAB 6 ter : GESTION DES DIPLÔMES ACADÉMIQUES & ÉLIGIBILITÉ (ÉTAPE 9) */}
        {activeTab === 'diplomas' && (
          <div className="space-y-6">
            <AdminDiplomaManagementView
              currentUser={currentUser}
              onNavigate={onNavigate}
            />
          </div>
        )}

        {/* TAB 6 bis : CONTRÔLE DES TENTATIVES & HISTORIQUE DES RÉSULTATS (ÉTAPE 7) */}
        {activeTab === 'attempts' && (
          <div className="space-y-6">
            <AttemptsHistoryManagementView
              currentUser={currentUser}
              role="study_director"
              centerId={currentUser?.centerId}
            />
          </div>
        )}

        {/* TAB 7 : GUIDE & DOCUMENTATION PROPRE À LA DIRECTION DES ÉTUDES */}
        {activeTab === 'guide' && (
          <StudyDirectorGuideTab 
            director={director} 
            center={center} 
            onNavigateToTab={(tabId) => setActiveTab(tabId as any)} 
          />
        )}
      </main>
    </div>
  );
};
