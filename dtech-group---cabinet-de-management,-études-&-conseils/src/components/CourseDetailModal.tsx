import React from 'react';
import { PlatformCourse } from '../types';
import { 
  X, 
  Clock, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  FileText, 
  Award, 
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface CourseDetailModalProps {
  course: PlatformCourse;
  onClose: () => void;
  onEnroll: (course: PlatformCourse) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onEnroll
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Modal Header with Course Hero Photo */}
        <div className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
          {course.imageUrl && (
            <div className="absolute inset-0 z-0">
              <img 
                src={course.imageUrl} 
                alt={course.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/80"></div>
            </div>
          )}
          <div className="relative z-10 p-5 md:p-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider bg-blue-900/80 px-2.5 py-0.5 border border-blue-700">
                  {course.category}
                </span>
                <span className="text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 border border-slate-700">
                  Niveau : {course.level}
                </span>
                {course.promoDiscount && (
                  <span className="text-[10px] font-black text-slate-950 bg-amber-400 px-2 py-0.5 uppercase tracking-wider">
                    {course.promoDiscount}
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                {course.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xs transition-colors shrink-0"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 text-xs block">Formule & Durée</span>
              <strong className="text-slate-900 text-sm flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-blue-700" />
                {course.durationWeeks}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Frais de scolarité</span>
              <strong className="text-blue-900 text-sm mt-0.5 block">
                {course.priceFCFA.toLocaleString('fr-FR')} FCFA
              </strong>
              <span className="text-[10px] text-slate-500 block">Payable au centre (60%/40%)</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Inscription en ligne</span>
              <strong className="text-amber-800 text-sm flex items-center gap-1 mt-0.5 font-black">
                5 000 FCFA
              </strong>
              <span className="text-[10px] text-slate-500 block">Seul montant payé en ligne</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Délivrance</span>
              <strong className="text-emerald-700 text-sm flex items-center gap-1 mt-0.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                Diplôme & Certificat
              </strong>
            </div>
          </div>

          {/* Description & Objectifs */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5 uppercase tracking-wide">
                Présentation Générale
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs md:text-sm">
                {course.description}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2 uppercase tracking-wide">
                Objectifs Opérationnels Visés
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                {course.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Programme Détaillé par Modules */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3 uppercase tracking-wide flex items-center justify-between">
              <span>Programme Pédagogique ({course.modules.length} Modules)</span>
              <span className="text-xs font-normal text-slate-500 lowercase">supports PDF + vidéos inclus</span>
            </h3>
            
            <div className="space-y-3">
              {course.modules.map((mod, idx) => (
                <div key={mod.id} className="border border-slate-200 bg-white">
                  <div className="bg-slate-100 p-3 flex items-center justify-between font-semibold text-slate-800 text-xs md:text-sm border-b border-slate-200">
                    <span>{mod.title}</span>
                    <span className="text-xs text-blue-700 bg-white px-2 py-0.5 border border-slate-200">
                      {mod.duration}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50/50 space-y-1.5">
                    {mod.materials.map((mat) => (
                      <div key={mat.id} className="flex items-center justify-between text-xs text-slate-600 py-1 px-2 hover:bg-slate-100">
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          {mat.title}
                        </span>
                        <span className="text-[11px] text-slate-400 bg-white px-1.5 py-0.5 border border-slate-200">
                          {mat.sizeOrDuration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sessions programmées disponibles */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3 uppercase tracking-wide">
              Prochaines Sessions Ouvertes aux Inscriptions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {course.sessions.map((sess) => (
                <div key={sess.id} className="border border-slate-200 p-3.5 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <strong className="text-slate-900 text-sm flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-700" />
                        {sess.location}
                      </strong>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        {sess.availableSeats} places libres
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Du <strong>{sess.startDate}</strong> au <strong>{sess.endDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sess.schedule}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Formateur : {sess.instructorName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Titre et Certification */}
          <div className="bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-950 text-xs md:text-sm">Titre délivré à l'issue de la formation</h4>
              <p className="text-blue-900 text-xs mt-0.5">
                {course.certificationTitle} (reconnu par les entreprises partenaires et vérifiable par QR Code sécurisé).
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            <span>Scolarité : <strong>{course.priceFCFA.toLocaleString('fr-FR')} FCFA</strong> (au centre)</span>
            <span className="mx-2">•</span>
            <span className="text-blue-900 font-bold">Frais d'inscription en ligne : 5 000 FCFA</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEnroll(course);
              }}
              className="w-1/2 sm:w-auto px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              S'inscrire (5 000 F en ligne)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
