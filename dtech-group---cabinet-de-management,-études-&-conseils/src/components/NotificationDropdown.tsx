import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Calendar, 
  Award, 
  CreditCard, 
  Check, 
  Trash2, 
  ExternalLink, 
  ChevronRight, 
  Info, 
  MapPin 
} from 'lucide-react';
import { AppNotification, AuthUser } from '../types';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  currentUser: AuthUser | null;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNavigate: (path: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  currentUser,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'payment' | 'sessions'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrer les notifications selon l'utilisateur connecté ou le public
  const visibleNotifications = notifications.filter(n => {
    // Si c'est pour tous, tout le monde la voit
    if (n.userId === 'all' || !n.userId) return true;
    // Si un utilisateur est connecté
    if (currentUser) {
      if (currentUser.role === 'admin') return true;
      if (currentUser.id === n.userId || currentUser.email === n.userId) return true;
      // Pour les étudiants de démo STU-001
      if (n.userId === 'STU-001' && (currentUser.role === 'student' || currentUser.email.includes('etudiant') || currentUser.email.includes('koffi'))) {
        return true;
      }
    }
    return false;
  });

  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  const filteredList = visibleNotifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'payment') return n.type === 'payment_validated';
    if (activeFilter === 'sessions') return n.type === 'new_session_opened';
    return true;
  });

  // Fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      onMarkAsRead(notif.id);
    }
    if (notif.linkPath) {
      const cleanPath = notif.linkPath.replace('#', '');
      onNavigate(cleanPath);
      setIsOpen(false);
    }
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'payment_validated':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'new_session_opened':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'certificate_issued':
        return <Award className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBadgeStyle = (type: AppNotification['type']) => {
    switch (type) {
      case 'payment_validated':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'new_session_opened':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'certificate_issued':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton Cloche */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors rounded-xs focus:outline-none"
        title="Notifications Pédagogiques & Sessions"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Menu Déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 shadow-2xl text-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* En-tête */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Centre de Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-blue-900/80 text-blue-300 text-[10px] font-mono font-bold px-1.5 py-0.2 border border-blue-700">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline"
              >
                <Check className="w-3 h-3" />
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Filtres Rapides */}
          <div className="flex border-b border-slate-800 text-[11px] bg-slate-900/90 px-2 py-1.5 gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 font-semibold rounded-xs transition-colors whitespace-nowrap ${
                activeFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Toutes ({visibleNotifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 font-semibold rounded-xs transition-colors whitespace-nowrap ${
                activeFilter === 'unread' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Non lues ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('payment')}
              className={`px-2.5 py-1 font-semibold rounded-xs transition-colors whitespace-nowrap ${
                activeFilter === 'payment' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paiements
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('sessions')}
              className={`px-2.5 py-1 font-semibold rounded-xs transition-colors whitespace-nowrap ${
                activeFilter === 'sessions' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sessions
            </button>
          </div>

          {/* Liste des Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
            {filteredList.length === 0 ? (
              <div className="py-8 px-4 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                <p className="text-xs">Aucune notification dans cette catégorie.</p>
              </div>
            ) : (
              filteredList.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 transition-colors cursor-pointer group relative ${
                    notif.read ? 'bg-slate-900 hover:bg-slate-850' : 'bg-slate-800/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 bg-slate-950 border border-slate-700 flex-shrink-0">
                      {getNotifIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 border ${getBadgeStyle(notif.type)}`}>
                          {notif.type === 'payment_validated' ? 'Paiement Validé' :
                           notif.type === 'new_session_opened' ? 'Nouvelle Session' :
                           notif.type === 'certificate_issued' ? 'Certificat' : 'Information'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {notif.createdAt}
                        </span>
                      </div>

                      <h4 className={`text-xs font-bold leading-snug mb-1 ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                        {notif.message}
                      </p>

                      {/* Métadonnées contextuelles */}
                      {notif.metadata && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-1">
                          {notif.metadata.amountFCFA && (
                            <span className="font-bold text-emerald-400 font-mono">
                              {notif.metadata.amountFCFA.toLocaleString('fr-FR')} FCFA
                            </span>
                          )}
                          {notif.metadata.location && (
                            <span className="flex items-center gap-1 text-slate-300">
                              <MapPin className="w-2.5 h-2.5 text-amber-400" />
                              {notif.metadata.location}
                            </span>
                          )}
                          {notif.metadata.certificateNumber && (
                            <span className="font-mono text-blue-300">
                              N° {notif.metadata.certificateNumber}
                            </span>
                          )}
                          <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 ml-auto font-semibold">
                            Consulter <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action supprimer */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNotification(notif.id);
                      }}
                      className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer la notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!notif.read && (
                    <span className="absolute top-3 left-1.5 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pied de Menu */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center flex items-center justify-between text-[11px] text-slate-400">
            <span>DTECH GROUP Alertes 2026</span>
            <button
              type="button"
              onClick={() => {
                onNavigate(currentUser?.role === 'student' ? '/student' : '/');
                setIsOpen(false);
              }}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Voir tout dans mon espace →
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
