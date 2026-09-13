import React, { useState, useEffect } from 'react';
import { DiplomaRecord } from '../types';
import { DiplomaCard } from './DiplomaCard';
import { dtechApiService } from '../services/dtechApiService';
import { getWhatsAppShareText } from '../services/diplomaEngine';
import { CheckCircle2, MessageCircle, RefreshCw } from 'lucide-react';

interface StudentDiplomaViewProps {
  currentUser: any;
}

export const StudentDiplomaView: React.FC<StudentDiplomaViewProps> = () => {
  const [diploma, setDiploma] = useState<DiplomaRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudentDiploma();
  }, []);

  const loadStudentDiploma = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dtechApiService.getMyDiploma();
      if (res.diploma) {
        setDiploma(res.diploma);
      } else {
        setError('Impossible de charger votre diplôme.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la carte de diplôme.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!diploma) return;

    const shareText = getWhatsAppShareText(diploma);

    // Si l'appareil supporte le partage natif (notamment mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Diplôme DTech Group — ${diploma.studentFullName}`,
          text: shareText,
          url: diploma.qrVerificationUrl || window.location.href
        });
        return;
      } catch (err) {
        // En cas d'annulation ou d'erreur sur navigator.share, fallback direct sur WhatsApp
      }
    }

    // Fallback direct vers l'application ou l'API web WhatsApp
    const encodedText = encodeURIComponent(shareText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 mx-auto text-amber-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Génération de votre carte de diplôme DTech Group...</p>
      </div>
    );
  }

  if (error || !diploma) {
    return (
      <div className="py-12 text-center max-w-md mx-auto space-y-3">
        <p className="text-sm text-slate-600">{error || 'Carte non disponible.'}</p>
        <button
          onClick={loadStudentDiploma}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const isFinal = diploma.status === 'final_validated';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* MESSAGE SUCCÈS SI VERSION FINALE VALIDÉE */}
      {isFinal && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">✅ Diplôme généré avec succès</h3>
              <p className="text-xs text-emerald-800">
                Votre diplôme a été officiellement homologué et validé par la Direction Générale DTech Group.
              </p>
            </div>
          </div>

          {/* BOUTON OFFICIEL DE PARTAGE SUR WHATSAPP */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>📱 Partager sur WhatsApp</span>
          </button>
        </div>
      )}

      {/* CARTE VISUELLE DU DIPLÔME (UN SEUL DIPLÔME AVEC DEUX ÉTATS) */}
      <DiplomaCard diploma={diploma} />

      {/* BOUTON WHATSAPP ÉGALEMENT SOUS LA CARTE SI FINAL */}
      {isFinal && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleShareWhatsApp}
            className="px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm flex items-center gap-2.5 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>📱 Partager sur WhatsApp</span>
          </button>
        </div>
      )}
    </div>
  );
};
