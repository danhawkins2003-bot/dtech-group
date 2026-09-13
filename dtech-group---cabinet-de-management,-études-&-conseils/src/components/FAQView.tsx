import React from 'react';
import { DynamicCatalogFAQ } from './DynamicCatalogFAQ';
import { HelpCircle, Phone, ArrowLeft, MessageSquare } from 'lucide-react';

interface FAQViewProps {
  onNavigate: (path: string) => void;
}

export const FAQView: React.FC<FAQViewProps> = ({ onNavigate }) => {
  return (
    <div className="w-full bg-slate-100 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Breadcrumb & Titre */}
        <div className="mb-6 bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au Catalogue des Formations</span>
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
              <span>Assistance Étudiants & Professionnels Togo</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Foire Aux Questions (FAQ) & Guide Pratique
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Retrouvez ici toutes les réponses détaillées concernant les inscriptions (5 000 FCFA en ligne), le règlement échelonné de la scolarité au centre, les paiements mobiles T-Money et Flooz, et la délivrance des certificats officiels.
          </p>
        </div>

        {/* Composant FAQ Interactif Complet */}
        <div className="bg-white p-6 sm:p-8 border border-slate-200 shadow-xs">
          <DynamicCatalogFAQ onContactClick={() => onNavigate('/contact')} />
        </div>

      </div>
    </div>
  );
};
