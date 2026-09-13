import React, { useState } from 'react';
import { PlatformCourse, PaymentMethod, StudentEnrollment } from '../types';
import { 
  X, 
  Check, 
  CreditCard, 
  Smartphone, 
  Building, 
  Receipt, 
  ShieldCheck, 
  AlertCircle,
  MapPin,
  Calendar,
  Lock,
  ArrowRight
} from 'lucide-react';

interface EnrollmentPaymentModalProps {
  course: PlatformCourse;
  onClose: () => void;
  onEnrollmentComplete: (enrollment: StudentEnrollment) => void;
}

export const EnrollmentPaymentModal: React.FC<EnrollmentPaymentModalProps> = ({
  course,
  onClose,
  onEnrollmentComplete
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(course.sessions[0]?.id || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+228 ');
  const [city, setCity] = useState<'Lomé' | 'Kara' | 'Autre'>('Lomé');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tmoney');
  const [tMoneyPhone, setTMoneyPhone] = useState('');
  const [floozPhone, setFloozPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [generatedEnrollment, setGeneratedEnrollment] = useState<StudentEnrollment | null>(null);

  // Seuls les frais d'inscription sont prélevés en ligne pour valider et sécuriser la place
  const REGISTRATION_FEE_FCFA = course.registrationFeeFCFA || 5000;
  const TUITION_FEE_TOTAL = course.priceFCFA;

  const selectedSession = course.sessions.find(s => s.id === selectedSessionId) || course.sessions[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setStep('processing');

    setTimeout(() => {
      const refSuffix = Math.floor(100000 + Math.random() * 900000);
      let ref = '';
      if (paymentMethod === 'tmoney') ref = `TM-TG-${refSuffix}`;
      else if (paymentMethod === 'flooz') ref = `FL-TG-${refSuffix}`;
      else if (paymentMethod === 'card') ref = `CB-VISA-${refSuffix}`;
      else if (paymentMethod === 'bank_transfer') ref = `VIR-ECO-${refSuffix}`;
      else ref = `RECU-CAISSE-${city.toUpperCase().slice(0, 2)}-${refSuffix}`;

      const newEnrollment: StudentEnrollment = {
        id: `ENR-2026-${refSuffix.toString().slice(0, 4)}`,
        studentId: `STU-${Math.floor(100 + Math.random() * 900)}`,
        studentName: fullName,
        studentEmail: email,
        studentPhone: phone,
        studentCity: city,
        courseId: course.id,
        courseTitle: course.title,
        sessionId: selectedSession.id,
        sessionDetails: `${selectedSession.location} — Début ${selectedSession.startDate}`,
        enrollmentDate: new Date().toISOString().split('T')[0],
        amountFCFA: REGISTRATION_FEE_FCFA, // Seuls les frais d'inscription sont débités en ligne
        registrationFeeFCFA: REGISTRATION_FEE_FCFA,
        tuitionFeeTotal: TUITION_FEE_TOTAL,
        tuitionFeeRemaining: TUITION_FEE_TOTAL,
        paymentMethod: paymentMethod,
        paymentReference: ref,
        paymentStatus: paymentMethod === 'cash_agency' || paymentMethod === 'bank_transfer' ? 'pending' : 'completed',
        progressPercent: 0,
        completedModulesCount: 0,
        totalModulesCount: course.modules.length,
        certificateIssued: false
      };

      setGeneratedEnrollment(newEnrollment);
      onEnrollmentComplete(newEnrollment);
      setStep('success');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse"></div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Admission Officielle DTECH GROUP</span>
              <h3 className="font-bold text-sm md:text-base text-white">
                Inscription en Ligne — {course.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs md:text-sm text-slate-700">
            
            {/* Note Officielle : Seuls les frais d'inscription sont prélevés en ligne */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[11px] font-black uppercase tracking-wide text-amber-900">
                  Règle d'Admission : Seuls les frais d'inscription sont payés en ligne
                </strong>
                <p className="text-[11px] text-amber-900/90 mt-0.5 leading-relaxed">
                  Pour valider votre dossier et bloquer votre place dans le centre choisi, vous réglez uniquement les <strong>frais d'inscription de {REGISTRATION_FEE_FCFA.toLocaleString('fr-FR')} FCFA</strong> en ligne. La scolarité ({TUITION_FEE_TOTAL.toLocaleString('fr-FR')} FCFA) sera payée directement au secrétariat de votre centre selon l'échéancier par tranches (60% à la rentrée / 40%).
                </p>
              </div>
            </div>

            {/* Résumé Panier & Ventilation Financière */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Filière choisie</span>
                  <span className="font-black text-slate-900 text-sm block">{course.title}</span>
                  <span className="text-[11px] text-slate-600 block mt-0.5 font-medium">
                    Formule : {course.durationWeeks} • Rentrée : 14 Septembre 2026
                  </span>
                </div>
                <div className="sm:text-right bg-white sm:bg-transparent p-2 sm:p-0 border sm:border-0 border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Frais de formation globale</span>
                  <span className="text-sm font-bold text-slate-700">
                    {TUITION_FEE_TOTAL.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="text-[9.5px] text-slate-500 block">Payable au centre (60% / 40%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[11px] font-black uppercase text-blue-900 block">
                    Frais d'inscription à régler en ligne maintenant :
                  </span>
                  <span className="text-[10px] text-slate-500">Valide le dossier & garantit la place immédiatement</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-blue-950">
                    {REGISTRATION_FEE_FCFA.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-600">FCFA</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Choix de la Session */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                1. Choisissez votre centre & session de formation (Togo)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.sessions.map((s) => (
                  <label
                    key={s.id}
                    className={`p-3 border flex flex-col justify-between cursor-pointer transition-colors ${
                      selectedSessionId === s.id
                        ? 'border-blue-700 bg-blue-50/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="sessionId"
                          value={s.id}
                          checked={selectedSessionId === s.id}
                          onChange={() => setSelectedSessionId(s.id)}
                          className="text-blue-600"
                        />
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-700" />
                          {s.location}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2">
                        {s.availableSeats} places
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                      <div>Rentrée : <strong>{s.startDate}</strong></div>
                      <div>Horaires : {s.schedule}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Informations Apprenant */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                2. Coordonnées de l'apprenant (Pour le dossier & l'attestation)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Nom et Prénom complets *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kodjo AMEGANDJIN"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Adresse Email valide *</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: apprenant@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Téléphone / WhatsApp Togo *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+228 90 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Centre / Ville de formation</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Lomé">Lomé Avédji (Siège Principal)</option>
                    <option value="Lomé">Lomé Avépozo</option>
                    <option value="Autre">Kpalimé</option>
                    <option value="Autre">Atakpamé</option>
                    <option value="Autre">Sokodé</option>
                    <option value="Kara">Kara</option>
                    <option value="Autre">Dapaong</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mode de paiement togolais pour les frais d'inscription */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                3. Moyen de paiement des frais d'inscription ({REGISTRATION_FEE_FCFA.toLocaleString('fr-FR')} FCFA)
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tmoney')}
                  className={`p-2.5 text-center border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                    paymentMethod === 'tmoney' ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-2xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-amber-500 mb-0.5"></span>
                  T-Money (Togocom)
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('flooz')}
                  className={`p-2.5 text-center border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                    paymentMethod === 'flooz' ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-blue-500 mb-0.5"></span>
                  Moov Money (Flooz)
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 text-center border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                    paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-2xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Carte Bancaire
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-2.5 text-center border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                    paymentMethod === 'bank_transfer' ? 'border-slate-700 bg-slate-100 text-slate-900 font-bold shadow-2xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building className="w-4 h-4 text-slate-700" />
                  Virement Bancaire
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_agency')}
                  className={`p-2.5 text-center border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                    paymentMethod === 'cash_agency' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Guichet Centre
                </button>
              </div>

              {/* Formulaire selon moyen */}
              <div className="bg-slate-50 border border-slate-200 p-3 text-xs">
                {paymentMethod === 'tmoney' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-800">Paiement instantané T-Money Togo</p>
                    <p className="text-slate-600">Saisissez votre numéro Togocom (+228 90/91/92/93...). Vous recevrez une notification USSD sur votre téléphone pour autoriser le débit des <strong>frais d'inscription de {REGISTRATION_FEE_FCFA.toLocaleString('fr-FR')} FCFA</strong>.</p>
                    <input
                      type="text"
                      placeholder="Ex: 90 12 34 56"
                      value={tMoneyPhone}
                      onChange={(e) => setTMoneyPhone(e.target.value)}
                      className="w-full sm:w-64 bg-white border border-slate-300 p-2 text-xs focus:outline-none"
                    />
                  </div>
                )}

                {paymentMethod === 'flooz' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-800">Paiement instantané Moov Money (Flooz Togo)</p>
                    <p className="text-slate-600">Saisissez votre numéro Moov Africa (+228 96/97/98/99...). Une invite de confirmation pour <strong>{REGISTRATION_FEE_FCFA.toLocaleString('fr-FR')} FCFA</strong> apparaîtra sur votre écran.</p>
                    <input
                      type="text"
                      placeholder="Ex: 98 12 34 56"
                      value={floozPhone}
                      onChange={(e) => setFloozPhone(e.target.value)}
                      className="w-full sm:w-64 bg-white border border-slate-300 p-2 text-xs focus:outline-none"
                    />
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-800">Règlement par Carte Bancaire Sécurisée (Visa / Mastercard)</p>
                    <p className="text-slate-600">Débit sécurisé des frais d'inscription de <strong>{REGISTRATION_FEE_FCFA.toLocaleString('fr-FR')} FCFA</strong>.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Numéro de carte (16 chiffres)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="sm:col-span-2 bg-white border border-slate-300 p-2 text-xs"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-1/2 bg-white border border-slate-300 p-2 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-1/2 bg-white border border-slate-300 p-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <div className="space-y-1.5 text-slate-700">
                    <p className="font-semibold text-slate-900">Virement des frais d'inscription ({REGISTRATION_FEE_FCFA.toLocaleString('fr-FR')} FCFA) vers DTECH GROUP Togo :</p>
                    <div className="bg-white p-2 border border-slate-200 space-y-1 font-mono text-[11px]">
                      <div>• <strong>ECOBANK TOGO</strong> : TG055 01001 021008749001 45</div>
                      <div>• <strong>ORABANK TOGO</strong> : TG044 01002 003948174001 12</div>
                    </div>
                    <p className="text-[11px] text-slate-500">Votre place est pré-réservée dès soumission. La validation définitive sera confirmée par la comptabilité.</p>
                  </div>
                )}

                {paymentMethod === 'cash_agency' && (
                  <div className="space-y-1.5 text-slate-700">
                    <p className="font-semibold text-slate-900">Règlement des frais d'inscription aux caisses des 7 centres DTECH :</p>
                    <p className="text-slate-600">Votre place est bloquée pendant <strong>48 heures</strong>. Présentez votre reçu de pré-inscription au secrétariat de votre centre (Lomé Avédji, Avépozo, Kpalimé, Atakpamé, Sokodé, Kara, Dapaong) pour verser les {REGISTRATION_FEE_FCFA.toLocaleString('fr-FR')} FCFA.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Paiement sécurisé crypté SSL 256-bit</span>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-black px-6 py-2.5 text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Payer l'inscription en ligne ({REGISTRATION_FEE_FCFA.toLocaleString('fr-FR')} FCFA)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Étape Processing */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 className="font-bold text-slate-900 text-base">Traitement sécurisé de l'inscription en ligne...</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Connexion à la passerelle ({paymentMethod.toUpperCase()}) pour le prélèvement des frais d'inscription de {REGISTRATION_FEE_FCFA.toLocaleString('fr-FR')} FCFA et attribution de votre place.
            </p>
          </div>
        )}

        {/* Étape Succès / Reçu officiel */}
        {step === 'success' && generatedEnrollment && (
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
            <div className="bg-emerald-50 border border-emerald-300 p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">Inscription en Ligne Validée avec Succès !</h4>
                <p className="text-emerald-800 text-xs">
                  Vos frais d'inscription ont été reçus. Votre place est officiellement réservée dans la session de rentrée du 14 Septembre 2026.
                </p>
              </div>
            </div>

            {/* Reçu Numérique */}
            <div className="bg-slate-50 border border-slate-300 p-4 space-y-3 font-mono text-[11px]">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div>
                  <strong className="text-slate-900 block text-xs">DTECH GROUP — REÇU D'INSCRIPTION OFFICIEL</strong>
                  <span className="text-slate-500">Agrément N° 003/METFP/CAB/SE-CPO • Togo</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-900">{generatedEnrollment.id}</div>
                  <div className="text-slate-500">{generatedEnrollment.enrollmentDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                <div>
                  <span className="text-slate-500 block">Apprenant :</span>
                  <strong>{generatedEnrollment.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Téléphone / WhatsApp :</span>
                  <span>{generatedEnrollment.studentPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Formation Choisie :</span>
                  <strong>{generatedEnrollment.courseTitle}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Centre de Formation :</span>
                  <span>{generatedEnrollment.sessionDetails}</span>
                </div>
                <div className="bg-emerald-50 p-2 border border-emerald-200">
                  <span className="text-emerald-700 block font-semibold">Frais d'Inscription Payés en Ligne :</span>
                  <strong className="text-emerald-900 text-xs">{REGISTRATION_FEE_FCFA.toLocaleString('fr-FR')} FCFA</strong>
                  <span className="text-[10px] text-emerald-700 block">Statut : Réglé via {generatedEnrollment.paymentMethod.toUpperCase()}</span>
                </div>
                <div className="bg-blue-50 p-2 border border-blue-200">
                  <span className="text-blue-700 block font-semibold">Frais de Scolarité :</span>
                  <strong className="text-blue-950 text-xs">{TUITION_FEE_TOTAL.toLocaleString('fr-FR')} FCFA</strong>
                  <span className="text-[10px] text-blue-800 block">À régler au centre (60% rentrée / 40%)</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Référence de Transaction :</span>
                  <span className="text-slate-900 font-bold">{generatedEnrollment.paymentReference}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                Un email de confirmation contenant votre fiche d'inscription a été envoyé à <strong>{generatedEnrollment.studentEmail}</strong>. Présentez ce reçu au secrétariat de votre centre le jour de la rentrée pour régler votre première tranche de scolarité.
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 text-xs shadow-xs cursor-pointer"
              >
                Terminer & Fermer
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
