import React, { useState } from 'react';
import { 
  Calculator, 
  Send, 
  CheckCircle2, 
  Building, 
  Briefcase, 
  GraduationCap, 
  Clock, 
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { DTECH_INFO } from '../data/dtechData';

interface ProjectSimulatorProps {
  initialService?: string;
  onClose?: () => void;
}

export const ProjectSimulator: React.FC<ProjectSimulatorProps> = ({ initialService, onClose }) => {
  const [projectType, setProjectType] = useState<string>(initialService || 'etude-projet');
  const [companySize, setCompanySize] = useState<string>('pme');
  const [urgency, setUrgency] = useState<string>('normal');
  const [preferredCentre, setPreferredCentre] = useState<string>('lome');
  const [teamCount, setTeamCount] = useState<number>(3);
  const [includeAudit, setIncludeAudit] = useState<boolean>(false);
  const [includeFollowUp, setIncludeFollowUp] = useState<boolean>(true);

  // Form submission state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientDetails, setClientDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Calculate indicative estimate in FCFA
  const calculateEstimate = () => {
    let basePrice = 250000; // FCFA
    
    switch (projectType) {
      case 'etude-projet':
        basePrice = 450000;
        break;
      case 'conseil-management':
        basePrice = 600000;
        break;
      case 'compta-fiscalite':
        basePrice = 300000;
        break;
      case 'formation-equipe':
        basePrice = 180000 + (teamCount * 45000);
        break;
      case 'digital-bi':
        basePrice = 500000;
        break;
      case 'recrutement':
        basePrice = 350000;
        break;
      default:
        basePrice = 300000;
    }

    if (companySize === 'tpe') basePrice *= 0.8;
    if (companySize === 'grande') basePrice *= 1.4;
    if (urgency === 'urgent') basePrice *= 1.25;
    if (includeAudit) basePrice += 150000;
    if (includeFollowUp) basePrice += 100000;

    return Math.round(basePrice / 10000) * 10000;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section id="simulateur" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
            Outil d'Estimation Rapide
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            Simulateur de Projet & Demande de Devis Personnalisé
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Configurez vos besoins en conseil, études économiques ou formations pour obtenir une estimation indicative et être recontacté sous 24h par nos experts.
          </p>
        </div>

        {/* Interactive Simulator Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          {isSubmitted ? (
            <div className="max-w-xl mx-auto text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Votre demande a été transmise avec succès !
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Merci <strong>{clientName}</strong>. Un consultant senior de DTECH GROUP ({preferredCentre === 'kara' ? 'Centre de Kara' : 'Siège de Lomé'}) analysera votre cahier des charges et prendra contact avec vous au <strong>{clientPhone}</strong> ou par email sous 24h ouvrées.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    if (onClose) onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800 transition-colors"
                >
                  Faire une autre simulation
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Configuration Form */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Type de mission */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    1. Nature de votre besoin principal :
                  </label>
                  <select
                    id="simulator-project-type"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="etude-projet">Étude de Faisabilité & Business Plan bancable</option>
                    <option value="conseil-management">Audit Organisationnel & Conseil en Management</option>
                    <option value="compta-fiscalite">Tenue Comptable SYSCOHADA & Fiscalité OTR</option>
                    <option value="formation-equipe">Formation d'Équipe / Intra-entreprise</option>
                    <option value="digital-bi">Tableaux de bord Power BI & Digitalisation Sage</option>
                    <option value="recrutement">Recrutement & Gestion des Compétences</option>
                  </select>
                </div>

                {/* 2. Centre d'attachement Togo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Centre DTECH de référence :
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPreferredCentre('lome')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        preferredCentre === 'lome'
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-semibold">Siège Principal - Lomé</div>
                      <div className="text-[11px] text-slate-500">Zone Maritime & Sud Togo</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredCentre('kara')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        preferredCentre === 'kara'
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-semibold">Centre Régional - Kara</div>
                      <div className="text-[11px] text-slate-500">Pôle Nord & Savanes</div>
                    </button>
                  </div>
                </div>

                {/* 3. Taille de la structure */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    3. Profil de votre organisation :
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'tpe', label: 'TPE / Porteur de projet' },
                      { id: 'pme', label: 'PME / PMI établie' },
                      { id: 'grande', label: 'Grande Entreprise / ONG' },
                    ].map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setCompanySize(size.id)}
                        className={`p-2.5 rounded-xl border text-center text-xs cursor-pointer transition-all ${
                          companySize === size.id
                            ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition for training team size */}
                {projectType === 'formation-equipe' && (
                  <div className="space-y-2 bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                    <label className="text-xs font-bold text-blue-900 flex justify-between">
                      <span>Nombre de collaborateurs à former :</span>
                      <span className="font-extrabold text-blue-700">{teamCount} personnes</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={teamCount}
                      onChange={(e) => setTeamCount(parseInt(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                )}

                {/* Options complémentaires */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    4. Options d'accompagnement souhaitées :
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-white border border-slate-300 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAudit}
                        onChange={(e) => setIncludeAudit(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-xs text-slate-700">
                        Diagnostic / Audit préalable des processus existants (+150 000 FCFA)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white border border-slate-300 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeFollowUp}
                        onChange={(e) => setIncludeFollowUp(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-xs text-slate-700">
                        Accompagnement opérationnel & suivi post-mission sur 3 mois (+100 000 FCFA)
                      </span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Estimate Summary & Direct Lead Capture */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Estimation Indicative
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-blue-700">
                    {calculateEstimate().toLocaleString('fr-FR')} <span className="text-lg font-semibold text-slate-600">FCFA</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    *Montant estimatif HT. Un devis formel détaillé vous sera transmis après cadrage avec notre équipe d'experts.
                  </p>
                </div>

                {/* Contact capture form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="text-xs font-bold text-slate-800">
                    Recevoir ma proposition personnalisée :
                  </div>

                  <div>
                    <input
                      id="simulator-input-name"
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nom complet ou Raison sociale *"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <input
                      id="simulator-input-phone"
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Téléphone / WhatsApp Togo (+228) *"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <input
                      id="simulator-input-email"
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Adresse email *"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <textarea
                      id="simulator-input-details"
                      rows={2}
                      value={clientDetails}
                      onChange={(e) => setClientDetails(e.target.value)}
                      placeholder="Précisions sur votre projet (optionnel)..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    id="simulator-submit-btn"
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer la demande de devis</span>
                  </button>
                </form>

                <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-100">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Traitement confidentiel garanti par DTECH GROUP Togo.</span>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>
    </section>
  );
};
