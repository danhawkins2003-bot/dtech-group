import React from 'react';
import { DTechNews } from '../types';
import { Newspaper, Calendar, MapPin, User, ArrowRight, Tag } from 'lucide-react';
import { heroTrainingImg, graphicDesignImg, accountingPowerBiImg } from '../data/dtechPlatformData';

interface NewsAndEventsSectionProps {
  news: DTechNews[];
}

export const NewsAndEventsSection: React.FC<NewsAndEventsSectionProps> = ({ news }) => {
  // Mapping photos pour chaque article d'actualité
  const newsImages = [heroTrainingImg, graphicDesignImg, accountingPowerBiImg];

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Institutionnel */}
        <div className="bg-slate-900 border-l-4 border-amber-600 text-white p-6 md:p-8 mb-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Centre d'Information & Événements
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Actualités, Sessions & Opportunités DTECH GROUP
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Restez informé des lancements de cohortes de formation, des séminaires d'experts, des opportunités d'insertion professionnelle et des partenariats au Togo.
          </p>
        </div>

        {/* Liste des Actualités avec Photos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, idx) => (
            <article key={item.id} className="bg-white border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-400 transition-colors shadow-2xs">
              
              {/* Photo d'en-tête de l'actualité */}
              <div className="relative h-40 overflow-hidden bg-slate-950">
                <img 
                  src={newsImages[idx % newsImages.length]} 
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                <div className="absolute bottom-2.5 left-3">
                  <span className="text-[10px] font-bold text-white bg-blue-700/90 backdrop-blur-xs border border-blue-600 px-2 py-0.5 uppercase">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-700" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" />
                      {item.location}
                    </span>
                  </div>

                  <h2 className="font-bold text-slate-900 text-sm md:text-base leading-snug mb-2">
                    {item.title}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {item.summary}
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed mb-3">
                    {item.content}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px] font-medium text-slate-600">{item.author}</span>
                  <span className="text-blue-700 font-bold text-[11px]">DTECH TOGO</span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};
