import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Search, 
  Printer, 
  Clock, 
  FileBadge, 
  Check, 
  X,
  Phone,
  Mail,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AuthUser } from '../types';
import { dtechApiService } from '../services/dtechApiService';
import { 
  DTECH_GROUPS, 
  DTECH_STUDENTS_PROFILES, 
  DTECH_RECEIPTS,
  DTECH_CENTERS
} from '../data/dtechBusinessData';
import { SecretaryGuideTab } from './SecretaryGuideTab';
import { BookOpen } from 'lucide-react';

interface SecretaryPortalViewProps {
  currentUser?: AuthUser | null;
  onNavigate?: (path: string) => void;
}

export const SecretaryPortalView: React.FC<SecretaryPortalViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registrations' | 'students' | 'receipts' | 'guide'>('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Validation dossier
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [assignedGroupId, setAssignedGroupId] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dtechApiService.getSecretaryDashboard();
      setData(res);
      if (res.groups?.length > 0) setAssignedGroupId(res.groups[0].id);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'espace secrétariat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleValidateRegistration = async (regId: string) => {
    try {
      await dtechApiService.validateSecretaryRegistration(regId, assignedGroupId);
      setActionSuccess('Dossier d’inscription validé avec succès !');
      await loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    }
  };

  const secretary = data?.secretary || {
    name: currentUser?.name || 'Mme Sophie AMOUZOU',
    email: currentUser?.email || 'secretaire@dtech.tg',
    centerName: currentUser?.centerName || 'Lomé Avédji (Siège)'
  };

  const center = data?.center || DTECH_CENTERS[0];
  const metrics = data?.metrics || {
    totalRegistrations: 14,
    validatedRegistrations: 12,
    pendingRegistrations: 2,
    totalFeesCollectedFCFA: 350000,
    receiptsIssuedCount: DTECH_RECEIPTS.length,
    studentsCount: DTECH_STUDENTS_PROFILES.length
  };

  const registrations = data?.registrations || [
    {
      id: 'reg-online-2026-001',
      studentName: 'Koffi Mawuli AGBEGNINOU',
      email: 'etudiant@dtech.tg',
      phone: '+228 90 77 88 99',
      formationTitle: 'DÉVELOPPEMENT WEB & MOBILE',
      centerName: 'Lomé Avédji (Siège)',
      programType: '9 mois + Stage',
      amountFCFA: 25000,
      paymentMethod: 'tmoney',
      paymentStatus: 'completed',
      receiptNumber: 'REC-2026-0089',
      status: 'validated',
      createdAt: '2026-01-08T09:30:00Z'
    },
    {
      id: 'reg-online-2026-002',
      studentName: 'Abla Claire GBANDI',
      email: 'etudiante.compta@dtech.tg',
      phone: '+228 92 44 55 66',
      formationTitle: 'GESTION COMMERCIALE & MARKETING',
      centerName: 'Kara (Pôle Septentrional)',
      programType: '9 mois + Stage',
      amountFCFA: 25000,
      paymentMethod: 'flooz',
      paymentStatus: 'completed',
      receiptNumber: 'REC-2026-0112',
      status: 'validated',
      createdAt: '2026-01-10T14:15:00Z'
    }
  ];
  const receipts = (data?.receipts && data.receipts.length > 0) ? data.receipts : DTECH_RECEIPTS;
  const students = (data?.students && data.students.length > 0) ? data.students : DTECH_STUDENTS_PROFILES;
  const groups = (data?.groups && data.groups.length > 0) ? data.groups : DTECH_GROUPS;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b border-indigo-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-2xl shrink-0">
                <FileBadge className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Secrétariat des Admissions
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Centre : {center.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('guide')}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3 text-amber-400" />
                    <span>Guide Secrétariat</span>
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{secretary.name}</h1>
                <p className="text-sm text-slate-300 flex items-center gap-2 mt-0.5">
                  Gestion des dossiers d’inscription, encaissement des frais d’inscription (25 000 FCFA) et émission des reçus
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-xs space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Frais d’Inscription Encaissés :</span>
                <span className="font-bold text-emerald-400">{metrics.totalFeesCollectedFCFA.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Dossiers Reçus :</span>
                <span className="font-bold text-amber-400">{metrics.totalRegistrations}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Reçus Émis :</span>
                <span className="font-bold text-white">{metrics.receiptsIssuedCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 relative">
          <div className="relative flex items-center">
            <button
              onClick={() => {
                const el = document.getElementById('secretary-tab-nav');
                if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
              }}
              aria-label="Défiler vers la gauche"
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white/80 hover:text-white shrink-0 mr-1.5 shadow-sm border border-white/10 z-10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <nav
              id="secretary-tab-nav"
              className="flex items-center space-x-1.5 overflow-x-auto py-2.5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent scroll-smooth w-full no-scrollbar sm:scrollbar-thin"
            >
              {[
                { id: 'dashboard', label: 'Vue d’ensemble', icon: Layers },
                { id: 'registrations', label: 'Inscriptions en Ligne', icon: FileText },
                { id: 'students', label: 'Dossiers Étudiants', icon: Users },
                { id: 'receipts', label: 'Reçus Officiels (25 000 FCFA)', icon: FileBadge },
                { id: 'guide', label: 'Guide Secrétariat', icon: BookOpen }
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
                const el = document.getElementById('secretary-tab-nav');
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
                  <p className="text-xs font-semibold text-slate-500 uppercase">Frais Encaissés</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {metrics.totalFeesCollectedFCFA.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">T-Money & Flooz</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Inscriptions Validées</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.validatedRegistrations}</p>
                  <p className="text-xs text-indigo-600 font-medium">Comptes activés</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Dossiers en Attente</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.pendingRegistrations}</p>
                  <p className="text-xs text-amber-600 font-medium">En attente d’intégration</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Reçus Émis</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.receiptsIssuedCount}</p>
                  <p className="text-xs text-blue-600 font-medium">Imprimables</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Printer className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Dernières Inscriptions en Ligne Reçues</h2>
                  <p className="text-xs text-slate-500">Paiement des frais d’inscription (25 000 FCFA) par Mobile Money</p>
                </div>
                <button 
                  onClick={() => setActiveTab('registrations')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Voir tous les dossiers
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">Dossier</th>
                      <th className="p-3">Candidat</th>
                      <th className="p-3">Filière Choisi</th>
                      <th className="p-3">Mode & Référence</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrations.slice(0, 5).map((reg: any) => (
                      <tr key={reg.id}>
                        <td className="p-3 font-mono font-bold text-indigo-700">{reg.dossierNumber}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{reg.firstName} {reg.lastName}</p>
                          <p className="text-[11px] text-slate-500">{reg.phone}</p>
                        </td>
                        <td className="p-3 text-slate-700 font-medium">{reg.formationTitle}</td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-900 uppercase">{reg.paymentMethod}</span>
                          <p className="text-[11px] text-slate-500 font-mono">{reg.paymentReference}</p>
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            25 000 FCFA Payés
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setActiveTab('receipts')}
                            className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
                          >
                            Reçu
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 : INSCRIPTIONS EN LIGNE */}
        {activeTab === 'registrations' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Registre des Inscriptions en Ligne</h2>
              <p className="text-xs text-slate-500 mt-0.5">Validation administrative et intégration aux groupes de cours</p>
            </div>

            <div className="divide-y divide-slate-100">
              {registrations.map((reg: any) => (
                <div key={reg.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700">{reg.dossierNumber}</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {reg.registrationFeeFCFA} FCFA Réglés
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{reg.firstName} {reg.lastName}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Filière : <strong className="text-slate-800">{reg.formationTitle}</strong> • {reg.preferredSchedule === 'soir' ? 'Cours du Soir' : 'Cours du Jour'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Contact : {reg.phone} • Email : {reg.email} • CNI : {reg.idCardNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-xl">
                      Groupe : {reg.assignedGroupName || 'Groupe 1 (Matin)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3 : DOSSIERS ÉTUDIANTS */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Dossiers Administratifs des Étudiants</h2>
                <p className="text-xs text-slate-500 mt-0.5">Fiches d’inscription, pièces d’identité et conformité financière</p>
              </div>
              <div className="px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-200 self-start sm:self-auto">
                {students.length} Apprenants Inscrits
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Étudiant & Contact</th>
                    <th className="p-3">Matricule</th>
                    <th className="p-3">Filière Choisi</th>
                    <th className="p-3">Groupe / Centre</th>
                    <th className="p-3">Frais Inscription</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((stu: any) => (
                    <tr key={stu.id}>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{stu.fullName}</p>
                        <p className="text-[11px] text-slate-500">{stu.phone || stu.email}</p>
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-700">{stu.studentNumber}</td>
                      <td className="p-3 font-medium text-slate-800">{stu.formationTitle}</td>
                      <td className="p-3 text-slate-600">
                        <span>{stu.groupName}</span>
                        <span className="block text-[10px] text-slate-400">{stu.center?.name || 'Lomé Avédji'}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          25 000 FCFA Acquittés
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setActiveTab('receipts')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          Fiche Reçu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4 : REÇUS OFFICIELS */}
        {activeTab === 'receipts' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Reçus Officiels d’Inscription (25 000 FCFA)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Visualisez et imprimez les reçus officiels émis par le secrétariat</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {receipts.map((rec: any) => (
                <div key={rec.receiptNumber} className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                      <div>
                        <p className="text-xs font-bold text-indigo-900">DTECH GROUP</p>
                        <p className="text-[10px] text-slate-500 font-mono">REÇU N° {rec.receiptNumber}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        25 000 FCFA
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900">{rec.studentName}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{rec.formationTitle}</p>
                    <p className="text-xs text-slate-500 mt-1">Centre : {rec.centerName}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Payé le {rec.paymentDate} via {rec.paymentMethod?.toUpperCase()}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 italic">Scolarité à régler au secrétariat</span>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5 : GUIDE & DOCUMENTATION PROPRE AU SECRÉTARIAT */}
        {activeTab === 'guide' && (
          <SecretaryGuideTab 
            secretary={secretary} 
            center={center} 
            onNavigateToTab={(tabId) => setActiveTab(tabId as any)} 
          />
        )}
      </main>
    </div>
  );
};
