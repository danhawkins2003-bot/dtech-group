import React, { useState } from 'react';
import { AdminStats, StudentEnrollment, PlatformCourse, Trainer, VerifiedCertificate, AuthUser } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  UserCheck, 
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  Building,
  MapPin,
  Calendar,
  Check,
  Phone,
  Mail
} from 'lucide-react';
import { DTECH_INSTITUTIONAL_DATA } from '../data/dtechPlatformData';
import { AdminGuideTab } from './AdminGuideTab';
import { AdminDiplomaManagementView } from './AdminDiplomaManagementView';

interface AdminDashboardViewProps {
  currentUser?: AuthUser | null;
  stats: AdminStats;
  enrollments: StudentEnrollment[];
  courses: PlatformCourse[];
  trainers: Trainer[];
  certificates: VerifiedCertificate[];
  onValidatePayment: (enrollmentId: string) => void;
  onIssueCertificate: (enrollmentId: string) => void;
  onAddSession?: (courseId: string, sessionData: any, broadcastNotification: boolean) => void;
  onNavigate?: (path: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  stats,
  enrollments,
  courses,
  trainers,
  certificates,
  onValidatePayment,
  onIssueCertificate,
  onAddSession,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'kpi' | 'enrollments' | 'courses' | 'trainers' | 'certificates' | 'guide'>('kpi');
  const [filterCity, setFilterCity] = useState<'all' | 'Lomé Avédji' | 'Kara' | 'Avépozo' | 'Kpalimé' | 'Atakpamé' | 'Sokodé' | 'Dapaong'>('all');
  const [searchStudent, setSearchStudent] = useState('');

  // Modal d'ajout de nouvelle session avec diffusion de notification
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [newSessionCourseId, setNewSessionCourseId] = useState<string>(courses[0]?.id || '');
  const [newSessionLocation, setNewSessionLocation] = useState<string>('Lomé Avédji');
  const [newSessionStartDate, setNewSessionStartDate] = useState('2026-09-14');
  const [newSessionEndDate, setNewSessionEndDate] = useState('2027-06-14');
  const [newSessionSchedule, setNewSessionSchedule] = useState('Cours du jour (08h30 - 12h30) ou du soir (18h30 - 20h30)');
  const [newSessionTotalSeats, setNewSessionTotalSeats] = useState(25);
  const [newSessionInstructor, setNewSessionInstructor] = useState('M. Fabrice AMEGANDJIN');
  const [broadcastNotification, setBroadcastNotification] = useState(true);

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionCourseId) return;

    const newSession = {
      id: `sess-${Date.now()}`,
      location: newSessionLocation,
      startDate: newSessionStartDate,
      endDate: newSessionEndDate,
      schedule: newSessionSchedule,
      totalSeats: Number(newSessionTotalSeats) || 25,
      availableSeats: Number(newSessionTotalSeats) || 25,
      instructorName: newSessionInstructor
    };

    if (onAddSession) {
      onAddSession(newSessionCourseId, newSession, broadcastNotification);
    }

    setIsAddSessionModalOpen(false);
  };

  const filteredEnrollments = enrollments.filter((e) => {
    const matchesCity = filterCity === 'all' || e.studentCity === filterCity;
    const matchesSearch = searchStudent === '' ||
      e.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      e.courseTitle.toLowerCase().includes(searchStudent.toLowerCase()) ||
      e.id.toLowerCase().includes(searchStudent.toLowerCase()) ||
      e.paymentReference.toLowerCase().includes(searchStudent.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="py-4 sm:py-6 bg-slate-100 min-h-[calc(100vh-140px)] w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        
        {/* =========================================================================
            BANDEAU DIRECTION GÉNÉRALE
           ========================================================================= */}
        <div className="bg-slate-900 border-l-4 border-amber-500 rounded-xl text-white p-4 sm:p-5 mb-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-500/20 text-amber-300 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-amber-500/40">
                  Direction Générale & Pédagogique
                </span>
                <span className="text-xs text-slate-400">Siège Lomé & Pôle Kara</span>
              </div>
              <h1 className="text-base sm:text-xl font-black text-white">
                DTECH GROUP & INSTITUT DELXIA
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilotage consolidé des effectifs, trésorerie FCFA, cohortes 14 Septembre et certifications d'État.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <BookOpen className="w-4 h-4 text-slate-950" />
                <span>Guide Administrateur</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Exportation du rapport consolidé des inscriptions 2026-2027 (Format Excel/PDF)...')}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Exporter Rapport Consolidation</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Cartes KPIs Directives */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
              <span>Apprenants Inscrits</span>
              <Users className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats.totalEnrolledStudents}</div>
            <div className="text-[10px] text-emerald-700 font-bold mt-0.5">7 Centres Agréés Togo</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
              <span>Trésorerie / Inscriptions</span>
              <DollarSign className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-base sm:text-xl font-black text-emerald-800 mt-1">
              {(stats.monthlyRevenueFCFA || 24500000).toLocaleString('fr-FR')} <span className="text-[10px]">FCFA</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">T-Money & Flooz validés</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
              <span>Filières Actives</span>
              <BookOpen className="w-4 h-4 text-indigo-700" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{courses.length}</div>
            <div className="text-[10px] text-indigo-700 font-bold mt-0.5">Rentrée 14 Septembre</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
              <span>Diplômes & Certificats</span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">{stats.certificatesIssuedCount}</div>
            <div className="text-[10px] text-amber-800 font-bold mt-0.5">Agrément N° 003/METFP</div>
          </div>
        </div>

        {/* Barre de navigation des modules Admin */}
        <div className="bg-white rounded-xl border border-slate-200 mb-5 shadow-2xs overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-none border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('kpi')}
              className={`px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'kpi' ? 'border-amber-600 text-amber-900 bg-amber-50/60' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Tableau de Bord & Filières</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('enrollments')}
              className={`px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'enrollments' ? 'border-amber-600 text-amber-900 bg-amber-50/60' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Inscriptions & Validation Paiements ({enrollments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'courses' ? 'border-amber-600 text-amber-900 bg-amber-50/60' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Centres & Salles Climatisees ({courses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('trainers')}
              className={`px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'trainers' ? 'border-amber-600 text-amber-900 bg-amber-50/60' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Formateurs Titulaires ({trainers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('certificates')}
              className={`px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'certificates' ? 'border-amber-600 text-amber-900 bg-amber-50/60' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4 text-purple-600" />
              <span>Certificats Délivrés ({certificates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diplomas')}
              className={`px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'diplomas' ? 'border-amber-600 text-amber-900 bg-amber-50/60' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Diplômes d'État (Étape 9)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-4 sm:px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'guide' ? 'border-amber-600 text-amber-900 bg-amber-50/60' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Guide & Manuel Admin</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            ONGLET KPI & FILIÈRES
           ========================================================================= */}
        {activeTab === 'kpi' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs">
              <h3 className="text-base font-black text-slate-900 mb-3">
                Répartition des Effectifs par Filière (Promo Rentrée 14 Septembre 2026)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {courses.slice(0, 6).map((c) => (
                  <div key={c.id} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {c.category}
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {c.enrolledStudentsCount} inscrits
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{c.title}</h4>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, (c.enrolledStudentsCount / 30) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Tarif : {c.priceFCFA.toLocaleString('fr-FR')} FCFA</span>
                      <span className="text-emerald-700 font-bold">25 places max / salle</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET INSCRIRE / PAIEMENTS
           ========================================================================= */}
        {activeTab === 'enrollments' && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher par nom d'apprenant, ID, référence T-Money..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={filterCity}
                  onChange={(e: any) => setFilterCity(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                >
                  <option value="all">Tous les 7 Centres</option>
                  <option value="Lomé Avédji">Lomé Avédji</option>
                  <option value="Kara">Kara</option>
                  <option value="Avépozo">Avépozo</option>
                  <option value="Kpalimé">Kpalimé</option>
                  <option value="Atakpamé">Atakpamé</option>
                  <option value="Sokodé">Sokodé</option>
                  <option value="Dapaong">Dapaong</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black">
                  <tr>
                    <th className="p-3 border-b">Apprenant</th>
                    <th className="p-3 border-b">Filière / Centre</th>
                    <th className="p-3 border-b">Règlement FCFA</th>
                    <th className="p-3 border-b">Statut Dossier</th>
                    <th className="p-3 border-b text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEnrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{enr.studentName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{enr.studentId} • {enr.studentPhone}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{enr.courseTitle}</div>
                        <span className="text-[10px] text-blue-700 font-bold">{enr.studentCity}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">
                          {enr.amountFCFA.toLocaleString('fr-FR')} FCFA
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">{enr.paymentMethod} • {enr.paymentReference}</div>
                      </td>
                      <td className="p-3">
                        {enr.paymentStatus === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" /> Validé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                            <AlertCircle className="w-3 h-3" /> En attente
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {enr.paymentStatus !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => onValidatePayment(enr.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded text-[11px] cursor-pointer"
                            >
                              Valider T-Money
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onIssueCertificate(enr.id)}
                            className="bg-purple-700 hover:bg-purple-600 text-white font-bold px-2.5 py-1 rounded text-[11px] cursor-pointer"
                          >
                            Émettre Certificat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET SESSIONS & CENTRES
           ========================================================================= */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Salles Climatisees & Cohortes Rentrée 14 Septembre 2026
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Gestion des 7 centres au Togo (Lomé Avédji, Kara, Avépozo, Kpalimé, Atakpamé, Sokodé, Dapaong).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddSessionModalOpen(true)}
                className="bg-blue-700 hover:bg-blue-600 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Ouvrir une Nouvelle Cohorte</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <div key={c.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900">{c.title}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Rentrée : 14 Septembre
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Durée : <strong>9 mois + 3 mois stage</strong> • Certification : {c.certificationTitle}
                  </p>
                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 font-medium">
                    Sessions prévues : Cours du jour (08h30 - 12h30) & Cours du soir (18h30 - 20h30).
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET FORMATEURS
           ========================================================================= */}
        {activeTab === 'trainers' && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Corps des Formateurs Titulaires Agréés DTECH
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainers.map((t) => (
                <div key={t.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                      <p className="text-[11px] text-slate-500">{t.title}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-200">
                    <div>Centre : <strong>{t.location}</strong></div>
                    <div>Spécialité : <strong>{t.speciality}</strong></div>
                    <div>Apprenants formés : <strong>{t.totalStudentsTrained}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET CERTIFICATS
           ========================================================================= */}
        {activeTab === 'certificates' && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Registre des Certificats Officiels Délivrés (Agrément N° 003 / METFP)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black">
                  <tr>
                    <th className="p-3 border-b">N° Certificat</th>
                    <th className="p-3 border-b">Apprenant Récipiendaire</th>
                    <th className="p-3 border-b">Filière Validée</th>
                    <th className="p-3 border-b">Mention & Heures</th>
                    <th className="p-3 border-b">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((cert) => (
                    <tr key={cert.certificateNumber} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-900">{cert.certificateNumber}</td>
                      <td className="p-3 font-bold text-slate-900">{cert.studentName}</td>
                      <td className="p-3 text-slate-700">{cert.courseTitle}</td>
                      <td className="p-3 text-slate-600">{cert.grade} ({cert.hours}H)</td>
                      <td className="p-3">
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          Authentifié METFP
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            ONGLET 5 bis : GESTION DES DIPLÔMES D'ÉTAT & ÉLIGIBILITÉ (ÉTAPE 9)
           ========================================================================= */}
        {activeTab === 'diplomas' && (
          <div className="space-y-6">
            <AdminDiplomaManagementView
              currentUser={currentUser}
              onNavigate={onNavigate}
            />
          </div>
        )}

        {/* =========================================================================
            ONGLET 6 : GUIDE & MANUEL ADMINISTRATEUR DTECH
           ========================================================================= */}
        {activeTab === 'guide' && (
          <AdminGuideTab onNavigateToTab={(tabId) => setActiveTab(tabId as any)} />
        )}

      </div>

      {/* Modale Ajout Nouvelle Cohorte */}
      {isAddSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Ouvrir une Nouvelle Cohorte (14 Sept)</h3>
              <button 
                type="button" 
                onClick={() => setIsAddSessionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleCreateSessionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Filière de formation</label>
                <select
                  value={newSessionCourseId}
                  onChange={(e) => setNewSessionCourseId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Centre d'accueil</label>
                  <select
                    value={newSessionLocation}
                    onChange={(e) => setNewSessionLocation(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Lomé Avédji">Lomé Avédji</option>
                    <option value="Kara">Kara</option>
                    <option value="Avépozo">Avépozo</option>
                    <option value="Kpalimé">Kpalimé</option>
                    <option value="Atakpamé">Atakpamé</option>
                    <option value="Sokodé">Sokodé</option>
                    <option value="Dapaong">Dapaong</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacité Salle (Max 25)</label>
                  <input
                    type="number"
                    max={25}
                    value={newSessionTotalSeats}
                    onChange={(e) => setNewSessionTotalSeats(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Créneaux horaires</label>
                <input
                  type="text"
                  value={newSessionSchedule}
                  onChange={(e) => setNewSessionSchedule(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg uppercase tracking-wider text-xs cursor-pointer mt-2"
              >
                Créer & Publier la Cohorte
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
