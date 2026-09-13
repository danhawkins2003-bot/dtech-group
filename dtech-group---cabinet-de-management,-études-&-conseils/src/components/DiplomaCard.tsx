import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { DiplomaRecord } from '../types';
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle, QrCode } from 'lucide-react';

interface DiplomaCardProps {
  diploma: DiplomaRecord;
  showWatermark?: boolean;
}

export const DiplomaCard: React.FC<DiplomaCardProps> = ({ diploma }) => {
  const isFinal = diploma.status === 'final_validated';
  const isRevoked = diploma.status === 'revoked';
  const isPartial = diploma.status === 'partial';

  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>(diploma.qrCodeDataUrl);

  // Génération dynamique du QR Code si non pré-généré ou si le statut vient d'être mis à jour
  useEffect(() => {
    if (diploma.qrCodeDataUrl) {
      setQrDataUrl(diploma.qrCodeDataUrl);
      return;
    }

    const verificationUrl = diploma.qrVerificationUrl || (
      typeof window !== 'undefined'
        ? `${window.location.origin}/#verify-diploma?id=${diploma.id}`
        : `https://dtech-group.tg/#verify-diploma?id=${diploma.id}`
    );

    QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#0f172a', // Slate 900
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Erreur génération QR code carte :', err));
  }, [diploma.id, diploma.qrCodeDataUrl, diploma.qrVerificationUrl, isFinal]);

  // Formatage de la date en ISO (YYYY-MM-DD) comme sur la maquette officielle
  const formattedIsoDate = diploma.issuanceDate
    ? new Date(diploma.issuanceDate).toISOString().split('T')[0]
    : '2026-07-28';

  // Intitulé officiel de la formation
  const displayTitle = (diploma.specialityTitle || diploma.formationTitle || 'INFOGRAPHIE').toUpperCase();

  return (
    <div className="relative w-full max-w-lg mx-auto select-none font-sans">
      
      {/* BADGE D'ÉTAT SUPÉRIEUR DISCRET */}
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>Registre Officiel DTech Group Togo</span>
        </div>
        <div>
          {isFinal ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Diplôme Validé par l'État
            </span>
          ) : isRevoked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Diplôme Invalidé
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <Clock className="w-3 h-3 text-amber-600" />
              Version Partielle (En cours)
            </span>
          )}
        </div>
      </div>

      {/* CADRE RECTANGULAIRE DOUBLE DU DIPLÔME (MAQUETTE OFFICIELLE DTECH) */}
      <div 
        id="dtech-diploma-card"
        className="relative bg-white border border-slate-300 p-2 sm:p-2.5 shadow-xl rounded-sm transition-all duration-300"
      >
        {/* CADRE INTÉRIEUR FIN RECTANGULAIRE */}
        <div className="border border-slate-300/90 p-5 sm:p-7 bg-white relative space-y-4 sm:space-y-5 text-slate-800">

          {/* FILIGRANE DISCRET SI VERSION PARTIELLE */}
          {isPartial && (
            <div className="absolute top-2 right-2 pointer-events-none opacity-20">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-dashed border-slate-400 px-2 py-0.5 rounded">
                SPECIMEN PROVISOIRE
              </span>
            </div>
          )}

          {/* EN-TÊTE SUPÉRIEUR (3 COLONNES CONFORMES À LA MAQUETTE) */}
          <div className="flex items-start justify-between gap-2 text-center border-b border-slate-200 pb-3">
            {/* Colonne Gauche : RÉPUBLIQUE TOGOLAISE */}
            <div className="text-left w-1/3">
              <span className="block text-[10px] sm:text-[11px] font-serif font-semibold tracking-wider text-slate-500 uppercase leading-tight">
                RÉPUBLIQUE
              </span>
              <span className="block text-[10px] sm:text-[11px] font-serif font-semibold tracking-wider text-slate-500 uppercase leading-tight">
                TOGOLAISE
              </span>
            </div>

            {/* Colonne Centrale : CABINET DTECH GROUP */}
            <div className="text-center w-1/3">
              <span className="block text-[11px] sm:text-xs font-black text-blue-900 tracking-widest uppercase leading-tight">
                CABINET
              </span>
              <span className="block text-xs sm:text-sm font-black text-blue-900 tracking-widest uppercase leading-tight">
                DTECH GROUP
              </span>
            </div>

            {/* Colonne Droite : LOMÉ & KARA */}
            <div className="text-right w-1/3">
              <span className="block text-[10px] sm:text-[11px] font-serif font-semibold tracking-wider text-slate-500 uppercase leading-tight">
                LOMÉ &
              </span>
              <span className="block text-[10px] sm:text-[11px] font-serif font-semibold tracking-wider text-slate-500 uppercase leading-tight">
                KARA
              </span>
            </div>
          </div>

          {/* SOUS-TITRE & TITRE DE LA QUALIFICATION (RECTANGULAIRE & PUR) */}
          <div className="text-center space-y-1 pt-0.5">
            <div className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
              ATTESTATION D'ACQUIS PROFESSIONNELS
            </div>
            <h2 className="text-lg sm:text-2xl font-serif font-black text-slate-900 tracking-tight uppercase leading-snug">
              {displayTitle} (DIPLÔME AGRÉÉ PAR L'ÉTAT)
            </h2>
          </div>

          {/* NOM DU TITULAIRE AVEC LIGNE POINTILLÉE INFÉRIEURE */}
          <div className="text-center py-0.5">
            <div className="text-base sm:text-xl font-serif font-bold text-slate-900 tracking-wide">
              Titulaire : {diploma.studentFullName}
            </div>
            <div className="border-b border-dashed border-slate-300 w-full mt-3 mb-1" />
          </div>

          {/* LES 3 BOÎTES RECTANGULAIRES STRUCTURÉES */}
          <div className="space-y-3 pt-1">
            
            {/* BOÎTE 1 : RÉSULTAT & MENTION */}
            <div className="bg-white border border-slate-200 p-3 sm:p-3.5 text-left shadow-2xs">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                RÉSULTAT & MENTION
              </span>
              {isFinal ? (
                <div className="text-emerald-700 font-bold text-sm sm:text-base">
                  Mention {diploma.academicMention || 'Bien'} ({(diploma.overallAverageScore || 15).toFixed(1)}/20)
                </div>
              ) : isPartial ? (
                <div className="text-emerald-700 font-bold text-sm sm:text-base flex items-center justify-between">
                  <span>
                    Mention {diploma.academicMention || 'Bien'} ({(diploma.overallAverageScore || 14.8).toFixed(1)}/20)
                  </span>
                  <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">
                    En cours
                  </span>
                </div>
              ) : (
                <div className="text-rose-700 font-bold text-sm sm:text-base">
                  Titre révoqué par décision administrative
                </div>
              )}
            </div>

            {/* BOÎTE 2 : VOLUME RÉALISÉ */}
            <div className="bg-white border border-slate-200 p-3 sm:p-3.5 text-left shadow-2xs">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                VOLUME RÉALISÉ
              </span>
              <div className="text-slate-900 font-bold text-sm sm:text-base">
                {diploma.totalHours ? `${diploma.totalHours} Heures de pratique` : '360 Heures de pratique'}
              </div>
            </div>

            {/* BOÎTE 3 : DATE D'ÉVALUATION */}
            <div className="bg-white border border-slate-200 p-3 sm:p-3.5 text-left shadow-2xs">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                DATE D'ÉVALUATION
              </span>
              <div className="text-slate-900 font-bold text-sm sm:text-base font-mono">
                {formattedIsoDate}
              </div>
            </div>

          </div>

          {/* BAS DE PAGE : QR CODE, SIGNATURE ET MACARON OFFICIEL DG */}
          <div className="pt-3 flex items-end justify-between gap-3 relative border-t border-slate-100">
            
            {/* Colonne Gauche : QR Code officiel et signature électronique */}
            <div className="flex items-center gap-2.5 max-w-[210px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center shadow-2xs">
                {isFinal && qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="QR Code de Vérification Officielle" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-[8px] text-center p-0.5 leading-none bg-slate-50/50">
                    <QrCode className="w-5 h-5 mb-0.5 text-slate-400" />
                    <span className="font-mono text-[7px]">QR Code</span>
                  </div>
                )}
              </div>
              <div className="text-left font-mono text-[9px] sm:text-[10px] text-slate-500 leading-tight">
                <p className="font-semibold text-slate-700">Signature électronique sécurisée</p>
                <p>Enregistré aux registres de {diploma.centerCity || 'Lomé'}</p>
              </div>
            </div>

            {/* Colonne Centrale : Autorité de Délivrance */}
            <div className="text-center flex-1 px-1">
              <span className="text-[10px] sm:text-[11px] text-slate-500 italic block mb-0.5">
                Délivré sous l'autorité de :
              </span>
              <span className="text-xs sm:text-sm font-serif italic font-black text-slate-900 block leading-tight">
                Dr. Yaovi D. TOSSOU
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium block">
                Directeur Général DTECH GROUP
              </span>
            </div>

            {/* Colonne Droite : Macaron officiel circulaire du Directeur Général */}
            <div className="shrink-0 relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&q=80"
                  alt="Dr. Yaovi D. TOSSOU — Directeur Général DTECH GROUP"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Voyant vert de certification active */}
              <div 
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                  isFinal ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                title={isFinal ? 'Certifié et validé par l’État' : 'En cours de validation'}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

          </div>

        </div>
      </div>
      
      {/* MENTION INSTITUTIONNELLE EN SOUS-FACE */}
      <div className="text-center mt-3">
        <span className="text-[10px] text-slate-400 font-medium">
          DTECH GROUP • Lomé Avédji & Avépozo • Kpalimé • Atakpamé • Sokodé • Kara • Dapaong
        </span>
      </div>

    </div>
  );
};
