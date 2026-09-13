import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ShieldCheck, Building2, Award } from 'lucide-react';
import { DTECH_INSTITUTIONAL_DATA, heroTrainingImg, webDevImg } from '../data/dtechPlatformData';
import { DTechCity } from '../types';

export const OfficesAndContactSection: React.FC = () => {
  const [formSent, setFormSent] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('+228 ');
  const [contactLocation, setContactLocation] = useState<DTechCity>('Lomé Avédji');
  const [contactSubject, setContactSubject] = useState('Inscription Formation 9 Mois + 3 Mois');
  const [contactMessage, setContactMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Institutionnel */}
        <div className="bg-slate-900 border-l-4 border-amber-400 text-white p-6 md:p-8 mb-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {DTECH_INSTITUTIONAL_DATA.accreditationNumber} | Partenaire {DTECH_INSTITUTIONAL_DATA.partner}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Nos 7 Centres de Formation & Contacts Directs au Togo
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            DTECH GROUP déploie ses centres pédagogiques et laboratoires multimédias dans 7 localités : Lomé Avédji, Avépozo, Kpalimé, Atakpamé, Sokodé, Kara et Dapaong. Rentrée générale : <strong>{DTECH_INSTITUTIONAL_DATA.nextCohortDate}</strong> ({DTECH_INSTITUTIONAL_DATA.trainingFormula}).
          </p>
        </div>

        {/* 7 Centres Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {DTECH_INSTITUTIONAL_DATA.centers.map((centre) => (
            <div key={centre.id} className="bg-white border-2 border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">{centre.city}</h2>
                    <span className="text-[10px] text-blue-700 font-semibold uppercase">{centre.name}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Ouvert
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 border border-slate-100">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                  <span><strong>Repère :</strong> {centre.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span><strong>Tél :</strong> <a href={`tel:${centre.phone.replace(/[^0-9+]/g, '')}`} className="font-bold text-slate-900 hover:text-blue-700">{centre.phone}</a></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Horaires :</strong> {centre.openingHours}</span>
                </div>
              </div>

              <a
                href={`tel:${centre.phone.replace(/[^0-9+]/g, '')}`}
                className="w-full text-center block bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold py-1.5 border border-slate-300 transition-colors"
              >
                Appeler le centre ({centre.phone})
              </a>
            </div>
          ))}
        </div>

        {/* Formulaire de Contact Direct */}
        <div className="bg-white border-2 border-slate-200 p-6 md:p-8 shadow-xs max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900">Demande d'Inscription ou de Renseignement</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Remplissez ce formulaire pour être contacté sous 24h par le responsable pédagogique du centre choisi.
          </p>

          {formSent ? (
            <div className="bg-emerald-50 border border-emerald-300 p-6 text-center text-emerald-900 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base">Demande Reçue avec Succès !</h3>
              <p className="text-xs text-emerald-800">
                Merci {contactName}. Le conseiller pédagogique DTECH du centre <strong>{contactLocation}</strong> vous appellera sur le <strong>{contactPhone}</strong> pour finaliser votre dossier d'admission.
              </p>
              <button
                type="button"
                onClick={() => setFormSent(false)}
                className="mt-3 bg-emerald-700 text-white text-xs font-bold px-4 py-2"
              >
                Envoyer une autre demande
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Votre Nom & Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Koffi MENSAH"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Votre Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: etudiant@gmail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Téléphone / WhatsApp Togo *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+228 90 00 00 00"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Centre DTECH de rattachement *</label>
                  <select
                    value={contactLocation}
                    onChange={(e) => setContactLocation(e.target.value as DTechCity)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                  >
                    {DTECH_INSTITUTIONAL_DATA.centers.map(c => (
                      <option key={c.id} value={c.city}>
                        {c.city} — {c.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Objet de votre demande</label>
                <select
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Inscription Formation 9 Mois + 3 Mois">Inscription Formation Longue (9 mois + 3 mois de stage)</option>
                  <option value="Formation Modulaire Certifiante">Formation Modulaire Courte Certifiante</option>
                  <option value="Étude de projet & Business Plan">Étude de faisabilité / Business plan d'entreprise</option>
                  <option value="Conseil Fiscal OTR">Audit ou conseil fiscal OTR</option>
                  <option value="Formation Intra-Entreprise">Formation continue pour personnel d'entreprise</option>
                  <option value="Autre">Autre renseignement</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Votre Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Précisez votre filière de prédilection ou vos questions..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 text-xs flex items-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                Envoyer ma demande au centre de {contactLocation}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
