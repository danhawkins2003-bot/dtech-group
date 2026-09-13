import React, { useState } from 'react';
import { VerifiedCertificate } from '../types';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  QrCode,
  Download,
  Building
} from 'lucide-react';

interface CertificateVerifierViewProps {
  certificates: VerifiedCertificate[];
  selectedCertFromStudent?: VerifiedCertificate | null;
}

export const CertificateVerifierView: React.FC<CertificateVerifierViewProps> = ({
  certificates,
  selectedCertFromStudent
}) => {
  const [certInput, setCertInput] = useState(selectedCertFromStudent?.certificateNumber || 'DTECH-2026-TG-8841');
  const [searchedCert, setSearchedCert] = useState<VerifiedCertificate | null>(
    selectedCertFromStudent || certificates.find(c => c.certificateNumber === 'DTECH-2026-TG-8841') || null
  );
  const [hasSearched, setHasSearched] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = certInput.trim().toUpperCase();
    const found = certificates.find(c => c.certificateNumber.toUpperCase() === cleanId);
    setSearchedCert(found || null);
    setHasSearched(true);
  };

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* En-tête Institutionnel */}
        <div className="bg-slate-900 border-l-4 border-emerald-500 text-white p-6 md:p-8 mb-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Portail Public d'Authentification Sécurisée
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Vérification de Certificat Officiel DTECH GROUP
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Ce service permet aux recruteurs, directions des ressources humaines et partenaires de contrôler en temps réel l'authenticité et la validité des parchemins délivrés par nos centres de Lomé et Kara.
          </p>
        </div>

        {/* Passerelle vers la vérification du Diplôme d'État (Étape 9) */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Vous souhaitez vérifier un Diplôme d'État DTECH ?</p>
              <p className="text-[11px] text-slate-600">Accédez au portail officiel de vérification des parchemins d'État avec QR code d'intégrité.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { window.location.hash = '/verify-diploma'; }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            Vérifier un Diplôme d'État &rarr;
          </button>
        </div>

        {/* Barre de Recherche du Numéro de Certificat */}
        <form onSubmit={handleSearch} className="bg-white border border-slate-200 p-5 shadow-xs mb-8">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
            Saisissez le numéro unique du certificat (figurant sous le QR Code) :
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                placeholder="Ex: DTECH-2026-TG-8841"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm px-4 py-2.5 uppercase focus:outline-none focus:border-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-6 py-2.5 shadow-xs uppercase tracking-wide"
            >
              Vérifier l'authenticité
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Exemples de numéros test :</span>
            {certificates.map(c => (
              <button
                key={c.certificateNumber}
                type="button"
                onClick={() => {
                  setCertInput(c.certificateNumber);
                  setSearchedCert(c);
                  setHasSearched(true);
                }}
                className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 hover:underline border border-blue-200"
              >
                {c.certificateNumber}
              </button>
            ))}
          </div>
        </form>

        {/* Résultat de la vérification */}
        {hasSearched && (
          searchedCert ? (
            <div className="bg-white border-2 border-emerald-600 shadow-md">
              
              {/* Bandeau Statut Valide */}
              <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="font-bold text-sm uppercase tracking-wide">
                    Certificat Authentique & Valide dans le Registre DTECH TOGO
                  </span>
                </div>
                <span className="font-mono text-xs bg-emerald-900/60 px-2.5 py-1">
                  ID: {searchedCert.certificateNumber}
                </span>
              </div>

              {/* Fiche d'Authenticité */}
              <div className="p-6 md:p-8 space-y-6 text-slate-800">
                
                {/* Visualisation Institutionnelle */}
                <div className="border-4 border-double border-slate-300 p-6 bg-slate-50/50 text-center space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-serif text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">
                    <span>RÉPUBLIQUE TOGOLAISE</span>
                    <span className="font-sans font-bold text-blue-900 text-xs">CABINET DTECH GROUP</span>
                    <span>LOMÉ & KARA</span>
                  </div>

                  <div className="py-1">
                    <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold block">ATTESTATION D'ACQUIS PROFESSIONNELS</span>
                    <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900 mt-1 uppercase">
                      {searchedCert.courseTitle}
                    </h2>
                  </div>

                  <div className="text-base font-bold text-blue-950 font-serif border-b border-dashed border-slate-300 pb-1 max-w-sm mx-auto">
                    Titulaire : {searchedCert.studentName}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-slate-200 text-left">
                    <div className="bg-white p-2.5 border border-slate-200">
                      <span className="text-slate-500 text-[10px] block uppercase">Résultat & Mention</span>
                      <strong className="text-emerald-700 text-xs">{searchedCert.grade}</strong>
                    </div>

                    <div className="bg-white p-2.5 border border-slate-200">
                      <span className="text-slate-500 text-[10px] block uppercase">Volume Réalisé</span>
                      <strong className="text-slate-900 text-xs">{searchedCert.hours} Heures de pratique</strong>
                    </div>

                    <div className="bg-white p-2.5 border border-slate-200">
                      <span className="text-slate-500 text-[10px] block uppercase">Date d'évaluation</span>
                      <strong className="text-slate-900 text-xs">{searchedCert.completionDate}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-600 gap-4">
                    <div className="flex items-center gap-2 text-left">
                      <QrCode className="w-10 h-10 text-slate-800" />
                      <div className="text-[10px] font-mono text-slate-500">
                        Signature électronique sécurisée<br/>
                        Enregistré aux registres de Lomé
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-slate-700">Délivré sous l'autorité de :</div>
                      <div className="font-serif italic font-bold text-slate-900 text-sm">Dr. Yaovi D. TOSSOU</div>
                      <div className="text-[10px] text-slate-500">Directeur Général DTECH GROUP</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500">
                    Format officiel certifié conforme par le secrétariat général de DTECH GROUP TOGO.
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Téléchargement de l'attestation numérique signée ${searchedCert.certificateNumber}...`)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 flex items-center gap-2 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger l'Attestation en PDF
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white border border-red-300 p-8 text-center text-slate-700">
              <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">Numéro de Certificat Non Trouvé</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Le numéro « <strong>{certInput}</strong> » ne correspond à aucun document certifié actif dans nos archives de Lomé ou Kara. Veuillez vérifier la saisie ou contacter le secrétariat.
              </p>
            </div>
          )
        )}

      </div>
    </div>
  );
};
