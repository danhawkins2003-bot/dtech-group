import React, { useEffect } from 'react';
import { CheckCircle2, Calendar, Award, Info, X, ChevronRight } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notification: AppNotification | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onNavigate
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'payment_validated':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'new_session_opened':
        return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'certificate_issued':
        return <Award className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-300" />;
    }
  };

  const handleClick = () => {
    if (notification.linkPath) {
      const cleanPath = notification.linkPath.replace('#', '');
      onNavigate(cleanPath);
    }
    onClose();
  };

  return (
    <div className="fixed top-16 right-4 z-50 max-w-sm sm:max-w-md bg-slate-900 border-l-4 border-emerald-500 text-white shadow-2xl p-4 border border-slate-700 animate-in fade-in slide-in-from-right duration-200 cursor-pointer group">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-slate-950 border border-slate-800 flex-shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0" onClick={handleClick}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              Notification DTECH Directe
            </span>
            <span className="text-[10px] text-slate-400">À l'instant</span>
          </div>

          <h4 className="text-xs font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
            {notification.title}
          </h4>

          <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
            {notification.message}
          </p>

          <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-400 font-semibold">
            <span>Cliquez pour voir les détails</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-slate-400 hover:text-white p-1"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
