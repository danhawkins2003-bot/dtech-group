import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Building,
  ShieldCheck
} from 'lucide-react';
import { DTECH_INFO } from '../data/dtechData';

export const ContactSection: React.FC = () => {
  const [targetCentre, setTargetCentre] = useState<'lome' | 'kara'>('lome');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'Renseignement général',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-900/60 px-3 py-1 rounded-full border border-blue-700/50">
            Contact & Rendez-vous
          </span>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Contactez le Cabinet DTECH GROUP
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Notre équipe d'experts et nos coordinateurs de formation à Lomé et Kara sont à votre entière disposition.
          </p>
        </div>

        {/* Grid: Coordinates on Left & Contact Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Siège Lomé Card */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <span>Siège Social - Lomé</span>
                </h3>
                <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                  National
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Boulevard Circulaire, Quartier d'Affaires, Lomé - Togo
              </p>
              <div className="text-xs text-slate-300 space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+228 90 12 34 56 / +228 99 87 65 43</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>contact@cabinetdtech.com</span>
                </div>
              </div>
            </div>

            {/* Centre Kara Card */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-400" />
                  <span>Centre Régional - Kara</span>
                </h3>
                <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Pôle Nord
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Quartier Administratif, Proche Université, Kara - Togo
              </p>
              <div className="text-xs text-slate-300 space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+228 91 23 45 67 / +228 98 76 54 32</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>kara@cabinetdtech.com</span>
                </div>
              </div>
            </div>

            {/* General info & hours */}
            <div className="bg-blue-950/60 border border-blue-800/60 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Horaires d'Ouverture des Bureaux & Salles :</span>
              </div>
              <p>Lundi au Vendredi : 08h00 à 18h00 sans interruption</p>
              <p>Samedi : 08h30 à 13h00 (Formations & Consultations programmées)</p>
            </div>

          </div>

          {/* Right: Interactive Message Form */}
          <div className="lg:col-span-7 bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Message bien reçu !
                </h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                  Merci <strong>{formData.fullName}</strong>. Notre secrétariat de DTECH GROUP ({targetCentre === 'kara' ? 'Centre de Kara' : 'Siège de Lomé'}) vous répondra par téléphone ou par email sous 24 heures.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ fullName: '', email: '', phone: '', subject: 'Renseignement général', message: '' });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span>Formulaire de Contact Direct</span>
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setTargetCentre('lome')}
                      className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                        targetCentre === 'lome' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Lomé
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetCentre('kara')}
                      className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                        targetCentre === 'kara' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Kara
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Nom & Prénoms *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Ex: Jean Koffi"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Téléphone / WhatsApp Togo *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+228 90 00 00 00"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Adresse Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre.email@domaine.tg"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Objet de votre demande *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Renseignement général">Renseignement général</option>
                      <option value="Inscription Formation">Inscription à une formation certifiante</option>
                      <option value="Étude de faisabilité / Business Plan">Étude de faisabilité / Business Plan</option>
                      <option value="Assistance comptable & fiscale">Assistance comptable & fiscale (SYSCOHADA)</option>
                      <option value="Formation Intra-entreprise">Formation sur-mesure pour entreprise</option>
                      <option value="Partenariat & Recrutement">Partenariat & Recrutement</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Votre Message / Détails du besoin *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Expliquez brièvement vos attentes ou la formation souhaitée..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer ma demande à DTECH GROUP ({targetCentre === 'kara' ? 'Centre de Kara' : 'Siège de Lomé'})</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
