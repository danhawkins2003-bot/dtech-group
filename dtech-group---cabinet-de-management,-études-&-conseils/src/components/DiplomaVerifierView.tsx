import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, CheckCircle2, AlertTriangle, Search, ArrowLeft, Building, Calendar, Sparkles } from 'lucide-react';
import { dtechApiService } from '../services/dtechApiService';
import { DiplomaCard } from './DiplomaCard';

interface DiplomaVerifierViewProps {
  onNavigate?: (path: string) => void;
}

export const DiplomaVerifierView: React.FC<DiplomaVerifierViewProps> = ({ onNavigate }) => {
  const [searchId, setSearchId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extraction automatique de l'ID depuis l'URL ou le hash (ex: #verify-diploma?id=dip-usr_student_01-...)
  useEffect(() => {
    const extractIdFromUrl = () => {
      const fullUrl = window.location.href;
      const urlObj = new URL(fullUrl.replace('/#', '/'));
      const idParam = urlObj.searchParams.get('id');
      if (idParam) {
        setSearchId(idParam);
        verifyDiploma(idParam);
      }
    };

    extractIdFromUrl();
  }, []);

  const verifyDiploma = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const res = await dtechApiService.verifyDiplomaPublic(idToVerify.trim());
      if (res.verified) {
        setVerificationResult(res.diploma);
      } else {
        setError(res.message || 'Diplôme introuvable ou non certifié.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification du diplôme.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyDiploma(searchId);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        {/* En-tête institutionnel */}
        <div className="text-center space-y-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold mb-4 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'accueil</span>
            </button>
          )}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Vérification Officielle d'Authenticité
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Portail de certification des diplômes délivrés par le Cabinet DTech Group, agréé par le Ministère de l'Enseignement Technique et de la Formation Professionnelle (METFP Togo).
          </p>
        </div>

        {/* Barre de recherche d'identifiant */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Ex: dip-usr_student_01-c9..."
              className="w-full pl-11 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-md shrink-0 cursor-pointer"
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>

        {/* ERREUR OU INTROUVABLE */}
        {error && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2 max-w-xl mx-auto">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-rose-200">Diplôme Non Authentifié</h3>
            <p className="text-xs text-rose-300">{error}</p>
          </div>
        )}

        {/* RÉSULTAT DE LA VÉRIFICATION OFFICIELLE */}
        {verificationResult && (
          <div className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6 max-w-2xl mx-auto">
            
            {/* Statut d'authenticité */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
              verificationResult.status === 'final_validated'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                verificationResult.status === 'final_validated' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {verificationResult.status === 'final_validated' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="text-xs uppercase font-bold tracking-wider">
                  {verificationResult.status === 'final_validated' ? 'Authenticité Certifiée' : 'Statut Invalide'}
                </div>
                <div className="text-base font-extrabold text-white">
                  {verificationResult.status === 'final_validated' 
                    ? 'Diplôme Officiel DTech Group Enregistré' 
                    : 'Diplôme Annulé ou Non Homologué'}
                </div>
              </div>
            </div>

            {/* Données publiques du diplôme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700/60">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Titulaire</span>
                <span className="text-base font-bold text-white">{verificationResult.studentFullName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Formation d'État</span>
                <span className="text-sm font-bold text-amber-300 uppercase">{verificationResult.formationTitle}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Centre de formation</span>
                <span className="text-sm text-slate-200 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  {verificationResult.centerName}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Promotion</span>
                <span className="text-sm text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {verificationResult.promotionName}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Date de délivrance</span>
                <span className="text-sm text-slate-200">
                  {verificationResult.issuanceDate 
                    ? new Date(verificationResult.issuanceDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '2026'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Mention Académique</span>
                <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {verificationResult.academicMention ? `Mention ${verificationResult.academicMention}` : 'Admis'}
                </span>
              </div>
            </div>

            {/* Note de sécurité */}
            <div className="pt-4 border-t border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400">
                Ce certificat d'authenticité confirme que ce diplôme a été émis et validé conformément aux normes pédagogiques du Ministère de l'Enseignement Technique et de la Formation Professionnelle du Togo.
              </span>
            </div>

          </div>
        )}

        {/* CARTE VISUELLE DU DIPLÔME OFFICIEL (RECTANGULAIRE) */}
        {verificationResult && verificationResult.status === 'final_validated' && (
          <div className="pt-4">
            <DiplomaCard diploma={verificationResult} />
          </div>
        )}

      </div>

      <div className="text-center pt-12">
        <p className="text-xs text-slate-400">
          © 2026 Cabinet DTech Group • Lomé, Togo • Système Officiel de Certification
        </p>
      </div>
    </div>
  );
};
