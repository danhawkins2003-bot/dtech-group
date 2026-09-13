import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  X, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Send, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Phone, 
  Mail, 
  Building, 
  ShieldCheck, 
  Printer,
  Sparkles,
  Lock,
  ArrowRight,
  Search,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { DTECH_CENTERS, DTECH_PROMOTIONS } from '../data/dtechBusinessData';
import { INITIAL_COURSES } from '../data/dtechPlatformData';
import { dtechApiService } from '../services/dtechApiService';

interface RegistrationModalProps {
  initialFormationId?: string | null;
  onClose: () => void;
  onSuccessLogin?: (email: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ 
  initialFormationId, 
  onClose,
  onSuccessLogin
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('2002-05-15');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [address, setAddress] = useState('');
  const [idCardType, setIdCardType] = useState<'CNI' | 'Passeport' | 'Acte de Naissance'>('CNI');
  const [idCardNumber, setIdCardNumber] = useState('');

  // Step 2 & 3 & 4
  const [selectedCenterId, setSelectedCenterId] = useState(DTECH_CENTERS[0].id);
  const [selectedFormationId, setSelectedFormationId] = useState(initialFormationId || INITIAL_COURSES[0].id);
  const [selectedPromotionId, setSelectedPromotionId] = useState(DTECH_PROMOTIONS[3]?.id || DTECH_PROMOTIONS[0].id);
  const [preferredSchedule, setPreferredSchedule] = useState<'jour' | 'soir'>('jour');

  // Search & Filter state for Step 3 (Formations)
  const [formationSearch, setFormationSearch] = useState('');
  const [durationFilter, setDurationFilter] = useState<'ALL' | '9mois' | '3mois'>('ALL');

  // Filtered formations
  const filteredCourses = useMemo(() => {
    return INITIAL_COURSES.filter((course) => {
      const query = formationSearch.trim().toLowerCase();
      const matchesSearch = !query || 
        course.title.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        (course.programType && course.programType.toLowerCase().includes(query)) ||
        (course.description && course.description.toLowerCase().includes(query));

      const is9Months = course.id.startsWith('c9-') || (course.programType && course.programType.includes('09'));
      const matchesDuration = 
        durationFilter === 'ALL' ||
        (durationFilter === '9mois' && is9Months) ||
        (durationFilter === '3mois' && !is9Months);

      return matchesSearch && matchesDuration;
    });
  }, [formationSearch, durationFilter]);

  // Step 6 : Payment
  const [paymentMethod, setPaymentMethod] = useState<'tmoney' | 'flooz'>('tmoney');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentOtp, setPaymentOtp] = useState('');

  const selectedCenter = DTECH_CENTERS.find(c => c.id === selectedCenterId) || DTECH_CENTERS[0];
  const selectedFormation = INITIAL_COURSES.find(c => c.id === selectedFormationId) || INITIAL_COURSES[0];
  const selectedPromotion = DTECH_PROMOTIONS.find(p => p.id === selectedPromotionId) || DTECH_PROMOTIONS[0];

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      const result = await dtechApiService.submitOnlineRegistration({
        firstName,
        lastName,
        email,
        phone,
        whatsapp: whatsapp || phone,
        birthDate,
        gender,
        address,
        idCardType,
        idCardNumber: idCardNumber || 'TG-DOC-OFFICIAL',
        centerId: selectedCenter.id,
        formationId: selectedFormation.id,
        formationTitle: selectedFormation.title,
        promotionId: selectedPromotion.id,
        preferredSchedule,
        paymentMethod,
        paymentReference: `${paymentMethod.toUpperCase()}-${Date.now()}`
      });

      setRegistrationResult(result);
      setCurrentStep(7);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!firstName || !lastName || !email || !phone) {
        alert('Veuillez remplir vos informations personnelles (Nom, Prénom, Email, Téléphone).');
        return;
      }
      if (!paymentPhone) setPaymentPhone(phone);
    }
    setCurrentStep(prev => Math.min(prev + 1, 7));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 text-slate-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stepper Progress Bar */}
        {currentStep < 7 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="text-indigo-600 font-extrabold">Étape {currentStep} sur 6</span>
              <span>
                {currentStep === 1 && '1. Identité du Candidat'}
                {currentStep === 2 && '2. Choix du Centre'}
                {currentStep === 3 && '3. Filière & Formation'}
                {currentStep === 4 && '4. Promotion & Horaire'}
                {currentStep === 5 && '5. Récapitulatif'}
                {currentStep === 6 && '6. Frais d’Inscription (25 000 FCFA)'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: INFORMATIONS PERSONNELLES */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Inscription Officielle DTECH GROUP
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">Vos Coordonnées Personnelles</h2>
              <p className="text-xs text-slate-500">Renseignez vos informations pour la création de votre dossier d’admission.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom de famille *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: KOFFI"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prénoms *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mawuli Jean-Luc"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Numéro Téléphone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+228 90 XX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse Email *</label>
                <input
                  type="email"
                  required
                  placeholder="votre.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pièce d’identité</label>
                <select
                  value={idCardType}
                  onChange={(e) => setIdCardType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="CNI">Carte Nationale d’Identité (CNI)</option>
                  <option value="Passeport">Passeport Togolais / CEDEAO</option>
                  <option value="Acte de Naissance">Acte de Naissance</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Numéro de la pièce</label>
                <input
                  type="text"
                  placeholder="ex: TG-01928-89"
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CHOIX DU CENTRE */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Réseau National DTECH
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">Choisissez votre Centre de Formation</h2>
              <p className="text-xs text-slate-500">Sélectionnez le centre DTECH le plus proche de votre résidence au Togo.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {DTECH_CENTERS.map((c) => {
                const isSelected = selectedCenterId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCenterId(c.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.address}</p>
                    <p className="text-[11px] font-semibold text-indigo-600 mt-2">{c.phone}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: CHOIX DE LA FORMATION */}
        {currentStep === 3 && (
          <div className="space-y-3.5">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Diplôme d’État & Pratique
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1.5">Choisissez votre Formation</h2>
              <p className="text-xs text-slate-500">Parcourez les 40 spécialités professionnelles et diplômantes DTECH GROUP.</p>
            </div>

            {/* Barre de Recherche Rapide & Filtres */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formationSearch}
                  onChange={(e) => setFormationSearch(e.target.value)}
                  placeholder="Rechercher une formation (ex: Web, Comptabilité, RH, Graphisme...)"
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                />
                {formationSearch && (
                  <button
                    type="button"
                    onClick={() => setFormationSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtres de Durée & Compteur */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDurationFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      durationFilter === 'ALL'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Toutes ({INITIAL_COURSES.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationFilter('9mois')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      durationFilter === '9mois'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    09 Mois + Stage
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationFilter('3mois')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      durationFilter === '3mois'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    03 Mois Pratiques
                  </button>
                </div>

                <span className="text-[11px] font-semibold text-slate-500">
                  {filteredCourses.length} formation{filteredCourses.length > 1 ? 's' : ''} trouvée{filteredCourses.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Liste des Formations */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => {
                  const isSelected = selectedFormationId === course.id;
                  return (
                    <div
                      key={course.id}
                      onClick={() => setSelectedFormationId(course.id)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-600/30'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded">
                            {course.category}
                          </span>
                          <span className="text-[11px] text-indigo-700 font-semibold">{course.programType}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 line-clamp-1">{course.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Scolarité : <strong className="text-slate-800">{course.priceFCFA?.toLocaleString('fr-FR')} FCFA</strong> (Frais d'inscription : 25 000 FCFA)
                        </p>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 ml-2" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-700">Aucune formation ne correspond à votre recherche "{formationSearch}"</p>
                  <p className="text-[11px] text-slate-500 mt-1">Vérifiez l'orthographe ou réinitialisez vos filtres.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormationSearch('');
                      setDurationFilter('ALL');
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Réinitialiser la recherche
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: PROMOTION ET HORAIRE */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Session & Organisation
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">Choisissez votre Promotion & Horaire</h2>
              <p className="text-xs text-slate-500">Sélectionnez la période de rentrée et votre créneau souhaité.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Promotion / Rentrée :</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DTECH_PROMOTIONS.map((promo) => {
                  const isSelected = selectedPromotionId === promo.id;
                  return (
                    <div
                      key={promo.id}
                      onClick={() => setSelectedPromotionId(promo.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer ${
                        isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-800">{promo.sessionCode}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-1">{promo.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Début : {promo.startDate}</p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3">
                <label className="block text-xs font-bold text-slate-700 mb-2">Créneau Horaire :</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPreferredSchedule('jour')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer text-center ${
                      preferredSchedule === 'jour' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">Cours du Jour</p>
                    <p className="text-[11px] text-slate-500">08h30 - 12h30 (Lun - Ven)</p>
                  </div>
                  <div
                    onClick={() => setPreferredSchedule('soir')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer text-center ${
                      preferredSchedule === 'soir' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">Cours du Soir</p>
                    <p className="text-[11px] text-slate-500">18h30 - 20h30 (Lun - Ven)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: RÉCAPITULATIF */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Vérification du Dossier
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">Récapitulatif de votre Inscription</h2>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Candidat :</span>
                <span className="font-bold text-slate-900">{lastName} {firstName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Téléphone / WhatsApp :</span>
                <span className="font-bold text-slate-900">{phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Email :</span>
                <span className="font-bold text-slate-900">{email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Centre Retenu :</span>
                <span className="font-bold text-indigo-700">{selectedCenter.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Filière / Formation :</span>
                <span className="font-bold text-slate-900">{selectedFormation.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Promotion :</span>
                <span className="font-bold text-slate-900">{selectedPromotion.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Horaire :</span>
                <span className="font-bold text-slate-900">{preferredSchedule === 'jour' ? 'Cours du Jour' : 'Cours du Soir'}</span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
              <p className="font-bold">Frais d’Inscription en Ligne : 25 000 FCFA</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Le paiement des 25 000 FCFA valide immédiatement votre place et génère votre reçu officiel. Les frais de scolarité s’échelonnent et sont payés directement à la caisse du centre.
              </p>
            </div>
          </div>
        )}

        {/* STEP 6: PAIEMENT EN LIGNE (25 000 FCFA PAR T-MONEY OU FLOOZ) */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Paiement Sécurisé Togo
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">Règlement des Frais d’Inscription (25 000 FCFA)</h2>
              <p className="text-xs text-slate-500">Choisissez votre opérateur Mobile Money au Togo.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setPaymentMethod('tmoney')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'tmoney' ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  TM
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1">Togocom T-Money</p>
                <span className="text-[10px] font-mono text-slate-500">*145#</span>
              </div>

              <div
                onClick={() => setPaymentMethod('flooz')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentMethod === 'flooz' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  FL
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1">Moov Africa Flooz</p>
                <span className="text-[10px] font-mono text-slate-500">*155#</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Numéro Mobile Money ({paymentMethod.toUpperCase()}) :</label>
                <input
                  type="tel"
                  placeholder="+228 90 XX XX XX"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Montant à débiter :</span>
                <span className="text-base font-extrabold text-slate-900">25 000 FCFA</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: CONFIRMATION & REÇU OFFICIEL */}
        {currentStep === 7 && registrationResult && (
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                Admission Confirmée & Reçu Émis
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                Félicitations {firstName} !
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Vos frais d’inscription de <strong>25 000 FCFA</strong> ont été acquittés avec succès. Votre compte étudiant a été activé.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-5 text-left text-xs space-y-2">
              <div className="flex justify-between font-mono font-bold text-indigo-700 border-b border-slate-200 pb-2">
                <span>N° REÇU : {registrationResult.receipt?.receiptNumber}</span>
                <span>N° DOSSIER : {registrationResult.registration?.dossierNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Filière :</span>
                <span className="font-bold text-slate-900">{registrationResult.registration?.formationTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Centre :</span>
                <span className="font-bold text-slate-900">{registrationResult.registration?.centerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Groupe Assigné :</span>
                <span className="font-bold text-emerald-700">{registrationResult.registration?.assignedGroupName || 'Groupe 1 — Matin'}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Montant Réglé :</span>
                <span className="text-sm text-emerald-700">25 000 FCFA (Acquitté)</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900">
              <p className="font-bold">Identifiants de votre Espace Étudiant :</p>
              <p className="mt-0.5">Email : <strong>{email}</strong> | Mot de passe initial : <strong>etudiant2026</strong></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Imprimer le Reçu Officiel
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onSuccessLogin) onSuccessLogin(email);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                Se Connecter à Mon Espace <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons for Steps 1-6 */}
        {currentStep < 7 && (
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Précédent
              </button>
            ) : <div />}

            {currentStep < 6 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                Continuer <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Traitement du paiement...' : 'Valider le Paiement (25 000 FCFA)'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
