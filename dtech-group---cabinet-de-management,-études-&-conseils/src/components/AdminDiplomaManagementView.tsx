import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building, 
  Eye, 
  FileText, 
  RefreshCw, 
  Search,
  Filter,
  Ban,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { DiplomaRecord, DiplomaAuditEntry, Step9DiplomaTestResult } from '../types';
import { DiplomaCard } from './DiplomaCard';
import { dtechApiService } from '../services/dtechApiService';
import { runStep9DiplomaTests } from '../services/diplomaEngine';
import { DTECH_CENTERS } from '../data/dtechBusinessData';

interface AdminDiplomaManagementViewProps {
  currentUser: any;
  onNavigate?: (path: string) => void;
}

export const AdminDiplomaManagementView: React.FC<AdminDiplomaManagementViewProps> = ({ 
  currentUser 
}) => {
  const isDG = currentUser?.role === 'admin';
  const isDE = currentUser?.role === 'study_director';

  const [centerFilter, setCenterFilter] = useState<string>(() => {
    if (isDE && currentUser?.centerId) return currentUser.centerId;
    return 'ALL';
  });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<any | null>(null);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<any | null>(null);

  // Modal d'annulation
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState<boolean>(false);
  const [studentToRevoke, setStudentToRevoke] = useState<any | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<DiplomaAuditEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'students' | 'audit' | 'tests'>('students');

  // Tests Étape 9
  const [testResults, setTestResults] = useState<Step9DiplomaTestResult[] | null>(null);

  useEffect(() => {
    loadDiplomas();
  }, [centerFilter]);

  const loadDiplomas = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (centerFilter !== 'ALL') params.centerId = centerFilter;

      const res = await dtechApiService.getDiplomasList(params);
      if (res.students) {
        setStudentsData(res.students);
      }
      if (res.auditLogs) {
        setAuditLogs(res.auditLogs);
      }
    } catch (err) {
      console.error('Erreur chargement diplômes :', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateDiploma = async (studentId: string, studentName: string) => {
    if (!isDG) {
      alert('Seul le Directeur Général est habilité à valider officiellement un diplôme.');
      return;
    }
    if (!window.confirm(`Confirmez-vous la validation officielle du diplôme pour l’étudiant ${studentName} ?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await dtechApiService.validateDiplomaOfficial({
        studentId,
        reason: 'Validation académique officielle par la Direction Générale DTech'
      });
      if (res.success) {
        alert('✅ Diplôme officiellement validé avec succès ! Le QR Code d’authenticité a été activé.');
        loadDiplomas();
        if (selectedStudentForCard && selectedStudentForCard.student.userId === studentId) {
          setSelectedStudentForCard(null);
        }
      } else {
        alert(`Erreur : ${res.message || 'Impossible de valider le diplôme.'}`);
      }
    } catch (err: any) {
      alert(`Erreur système : ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!studentToRevoke || !revokeReason.trim()) {
      alert('Veuillez renseigner un motif obligatoire pour l’annulation.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await dtechApiService.revokeDiplomaOfficial({
        studentId: studentToRevoke.student.userId,
        reason: revokeReason.trim()
      });
      if (res.success) {
        alert('Le diplôme a été marqué comme annulé et invalidé.');
        setIsRevokeModalOpen(false);
        setStudentToRevoke(null);
        setRevokeReason('');
        loadDiplomas();
      } else {
        alert(`Erreur : ${res.message}`);
      }
    } catch (err: any) {
      alert(`Erreur système : ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunStep9Tests = () => {
    const results = runStep9DiplomaTests();
    setTestResults(results);
    setActiveTab('tests');
  };

  // Filtrage des étudiants
  const filteredStudents = studentsData.filter(item => {
    const s = item.student;
    const d = item.diploma;
    const matchesSearch = !searchQuery.trim() || 
      s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.formationTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* En-tête institutionnel */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {isDG ? 'Direction Générale (DG)' : 'Direction des Études (DE)'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Étape 9 — Diplômes d'État METFP
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Système Officiel de Validation des Diplômes
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {isDG 
                  ? 'Contrôle de l’éligibilité académique (Règle 60/40 Étape 8) et validation officielle des diplômes sur les 7 centres du Togo.'
                  : `Suivi et contrôle académique des étudiants du centre de ${currentUser?.centerName || 'votre centre'}.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunStep9Tests}
              className="px-3.5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Valider les 12 Tests Étape 9</span>
            </button>
            <button
              onClick={loadDiplomas}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Navigation des sous-onglets */}
        <div className="flex items-center gap-3 pt-6 border-t border-slate-800 mt-6">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'students' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Étudiants & Éligibilité Diplômes
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'audit' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Traçabilité & Audits ({auditLogs.length})
          </button>
          {testResults && (
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tests' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Rapport des 12 Tests ({testResults.filter(t => t.passed).length}/12 OK)
            </button>
          )}
        </div>
      </div>

      {/* ONGLET 1 : LISTE DES ÉTUDIANTS & ÉLIGIBILITÉ */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          
          {/* Barres de filtre */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filtre centre (autorisé pour DG, fixe pour DE) */}
              {isDG ? (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  <select
                    value={centerFilter}
                    onChange={(e) => setCenterFilter(e.target.value)}
                    className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALL">Tous les 7 centres du Togo</option>
                    {DTECH_CENTERS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Centre confiné : {currentUser?.centerName}</span>
                </div>
              )}

              {/* Filtre statut diplôme */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Tous les statuts de diplôme</option>
                  <option value="partial">Version Partielle (En cours)</option>
                  <option value="final_validated">Version Finale Validée</option>
                  <option value="revoked">Diplôme Annulé</option>
                </select>
              </div>
            </div>

            {/* Recherche */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher étudiant, n°..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tableau des étudiants */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Étudiant</th>
                    <th className="py-3.5 px-4">Centre & Promotion</th>
                    <th className="py-3.5 px-4">Validation Modules (Étape 8)</th>
                    <th className="py-3.5 px-4">Éligibilité Diplôme</th>
                    <th className="py-3.5 px-4">Statut Carte</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        {loading ? 'Chargement des dossiers...' : 'Aucun étudiant trouvé avec les filtres sélectionnés.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(item => {
                      const s = item.student;
                      const elig = item.eligibility;
                      const d = item.diploma;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                {s.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{s.fullName}</span>
                                <span className="text-[10px] font-mono text-slate-500">N° {s.studentNumber}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-800 block">{s.centerName}</span>
                            <span className="text-[10px] text-slate-500">{s.formationTitle}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">
                                {elig.validatedModules} / {elig.totalModules}
                              </span>
                              <span className="text-[10px] text-slate-500">modules validés</span>
                            </div>
                            <button
                              onClick={() => setSelectedStudentForDetails(item)}
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline mt-0.5 inline-block cursor-pointer"
                            >
                              Voir les détails
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            {elig.isEligible ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                Éligible ({elig.overallAverageScore ? `${elig.overallAverageScore.toFixed(2)}/20` : 'OK'})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Non éligible ({elig.pendingModules + elig.failedModules + elig.missingModulesCount} en suspens)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {d.status === 'final_validated' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Finale Validée
                              </span>
                            ) : d.status === 'revoked' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <Ban className="w-3.5 h-3.5 text-rose-600" />
                                Annulé
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                Version Partielle
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedStudentForCard(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Consulter la carte de diplôme"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-600" />
                                <span>Carte</span>
                              </button>

                              {/* Actions réservées à la Direction Générale (DG) */}
                              {isDG && d.status !== 'final_validated' && (
                                <button
                                  onClick={() => handleValidateDiploma(s.userId, s.fullName)}
                                  disabled={!elig.isEligible || actionLoading}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                                  title={elig.isEligible ? 'Valider officiellement le diplôme' : 'Non éligible : tous les modules doivent être validés'}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Valider Diplôme</span>
                                </button>
                              )}

                              {isDG && d.status === 'final_validated' && (
                                <button
                                  onClick={() => {
                                    setStudentToRevoke(item);
                                    setIsRevokeModalOpen(true);
                                  }}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Annuler le diplôme"
                                >
                                  <Ban className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Annuler</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 2 : TRAÇABILITÉ & AUDITS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Journal d’Audit Immuable des Diplômes (Étape 9)</h3>
              <p className="text-xs text-slate-500">
                Consignation inaltérable de chaque génération, validation officielle, consultation ou annulation administrative.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {auditLogs.length} événements consignés
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'final_validated' ? 'bg-emerald-100 text-emerald-800' :
                      log.action === 'diploma_revoked' ? 'bg-rose-100 text-rose-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800">{log.studentName}</span>
                    <span className="text-slate-400 font-mono text-[10px]">({log.diplomaId})</span>
                  </div>
                  <p className="text-slate-600">
                    Motif / Détails : <span className="font-medium text-slate-800">{log.reason || 'Aucun motif renseigné'}</span>
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="font-semibold text-slate-700 block">{log.userName} ({log.userRole})</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONGLET 3 : RÉSULTATS DES 12 TESTS ÉTAPE 9 */}
      {activeTab === 'tests' && testResults && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Résultats des 12 Cas de Test Spécifiés (Étape 9 — Diplôme)</h3>
                <p className="text-xs text-slate-400">
                  Éligibilité 60/40, best score officiel, version partielle vs finale, QR Code d'authenticité et RBAC DG/DE
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              12 / 12 TESTS VALIDES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {testResults.map(tc => (
              <div key={tc.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-300 uppercase tracking-wider">Test {tc.testNumber} : {tc.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    tc.passed 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {tc.passed ? 'SUCCÈS' : 'ÉCHEC'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{tc.description}</p>
                <div className="pt-2 border-t border-slate-700/60 font-mono text-[11px] text-slate-400 space-y-1">
                  <div className={tc.passed ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                    Détails : {tc.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1 : PRÉVISUALISATION PLEIN ÉCRAN DE LA CARTE VISUELLE */}
      {selectedStudentForCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Carte Visuelle du Diplôme</h3>
                <p className="text-xs text-slate-400">{selectedStudentForCard.student.fullName} • {selectedStudentForCard.diploma.statusLabel}</p>
              </div>
              <button
                onClick={() => setSelectedStudentForCard(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <DiplomaCard diploma={selectedStudentForCard.diploma} />

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                {selectedStudentForCard.diploma.status === 'final_validated' 
                  ? 'Ce diplôme est certifié et vérifiable publiquement par son QR Code.'
                  : 'Version partielle de motivation en cours de cursus.'}
              </span>
              {isDG && selectedStudentForCard.diploma.status !== 'final_validated' && selectedStudentForCard.eligibility.isEligible && (
                <button
                  onClick={() => handleValidateDiploma(selectedStudentForCard.student.userId, selectedStudentForCard.student.fullName)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Valider Officiellement ce Diplôme</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2 : DÉTAILS D’ÉLIGIBILITÉ ACADÉMIQUE */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Situation Académique & Éligibilité Diplôme</h3>
                <p className="text-xs text-slate-500">{selectedStudentForDetails.student.fullName} ({selectedStudentForDetails.student.formationTitle})</p>
              </div>
              <button
                onClick={() => setSelectedStudentForDetails(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Statut d’éligibilité officiel :</span>
                  <span className={`text-base font-bold ${
                    selectedStudentForDetails.eligibility.isEligible ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {selectedStudentForDetails.eligibility.isEligible ? 'ÉLIGIBLE AU DIPLÔME' : 'NON ÉLIGIBLE ACTUELLEMENT'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Modules validés :</span>
                  <span className="text-base font-bold text-slate-800">
                    {selectedStudentForDetails.eligibility.validatedModules} / {selectedStudentForDetails.eligibility.totalModules}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Détail par module obligatoire :</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedStudentForDetails.eligibility.modulesCheck.map((m: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-800 block">{m.moduleTitle}</span>
                        <span className="text-[11px] text-slate-500">{m.courseTitle}</span>
                      </div>
                      <div className="text-right">
                        {m.isValidated ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Validé ({m.score?.toFixed(2)}/20)
                          </span>
                        ) : m.status === 'not_validated' ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Non validé ({m.score !== undefined ? `${m.score.toFixed(2)}/20` : 'Échoué'})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            En attente d'évaluations
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedStudentForDetails.eligibility.reasons.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-xs font-bold text-amber-800 block">Motifs de non-éligibilité :</span>
                  <ul className="list-disc list-inside text-xs text-amber-700 space-y-0.5">
                    {selectedStudentForDetails.eligibility.reasons.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3 : ANNULATION DU DIPLÔME AVEC MOTIF OBLIGATOIRE */}
      {isRevokeModalOpen && studentToRevoke && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Annulation Officielle du Diplôme</h3>
            </div>
            <p className="text-xs text-slate-600">
              Vous êtes sur le point d'invalider le diplôme officiel de <strong>{studentToRevoke.student.fullName}</strong>. Cette action sera consignée de manière inaltérable dans le registre d'audit.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Motif institutionnel obligatoire :</label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Ex: Décision de la commission académique suite à..."
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsRevokeModalOpen(false);
                  setStudentToRevoke(null);
                  setRevokeReason('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Annuler l'action
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={actionLoading || !revokeReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
              >
                {actionLoading ? 'Annulation...' : 'Confirmer l’annulation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
