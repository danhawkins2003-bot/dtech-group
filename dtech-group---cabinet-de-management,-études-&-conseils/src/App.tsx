import React, { useState, useEffect } from 'react';
import { 
  AuthUser, 
  PlatformCourse, 
  StudentEnrollment, 
  VerifiedCertificate, 
  Trainer, 
  DTechNews, 
  AdminStats,
  AppNotification
} from './types';
import { 
  INITIAL_COURSES, 
  INITIAL_ENROLLMENTS, 
  INITIAL_CERTIFICATES, 
  INITIAL_TRAINERS, 
  INITIAL_NEWS, 
  INITIAL_ADMIN_STATS,
  INITIAL_NOTIFICATIONS
} from './data/dtechPlatformData';
import { authService } from './services/authService';
import { HeaderNavbar } from './components/HeaderNavbar';
import { CourseCatalogSection } from './components/CourseCatalogSection';
import { CourseDetailModal } from './components/CourseDetailModal';
import { StudentPortalView } from './components/StudentPortalView';
import { TrainerPortalView } from './components/TrainerPortalView';
import { StudyDirectorPortalView } from './components/StudyDirectorPortalView';
import { SecretaryPortalView } from './components/SecretaryPortalView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { CertificateVerifierView } from './components/CertificateVerifierView';
import { DiplomaVerifierView } from './components/DiplomaVerifierView';
import { AdminDiplomaManagementView } from './components/AdminDiplomaManagementView';
import { CorporateServicesSection } from './components/CorporateServicesSection';
import { NewsAndEventsSection } from './components/NewsAndEventsSection';
import { OfficesAndContactSection } from './components/OfficesAndContactSection';
import { AccessDeniedView } from './components/AccessDeniedView';
import { LoginModal } from './components/LoginModal';
import { RegistrationModal } from './components/RegistrationModal';
import { PlatformFooter } from './components/PlatformFooter';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { AIOrientationView } from './components/AIOrientationView';
import { FAQView } from './components/FAQView';
import { NotificationToast } from './components/NotificationToast';

export default function App() {
  // État de session et utilisateur authentifié
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getStoredUser());
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedFormationForRegistration, setSelectedFormationForRegistration] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  // Modales
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<PlatformCourse | null>(null);
  const [activeCertForVerification, setActiveCertForVerification] = useState<VerifiedCertificate | null>(null);

  // Système de Notifications Réactives
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('dtech_notifications_v1');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Routage par hash / chemin
  const normalizeHash = (rawHash: string) => {
    const clean = rawHash.replace(/^#/, '');
    if (!clean) return '/';
    return clean.startsWith('/') ? clean : '/' + clean;
  };

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return normalizeHash(window.location.hash);
  });

  // Synchronisation du hash d'URL
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(normalizeHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
    setCurrentPath(normalizeHash(path));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Vérification de session auprès du backend
  useEffect(() => {
    authService.getMe().then((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
  }, []);

  // Données de la plateforme
  const [courses, setCourses] = useState<PlatformCourse[]>(() => {
    const saved = localStorage.getItem('dtech_courses_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_COURSES.length) {
          return parsed;
        }
      } catch {}
    }
    localStorage.setItem('dtech_courses_v5', JSON.stringify(INITIAL_COURSES));
    return INITIAL_COURSES;
  });

  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>(() => {
    const saved = localStorage.getItem('dtech_enrollments_v2');
    return saved ? JSON.parse(saved) : INITIAL_ENROLLMENTS;
  });

  const [certificates, setCertificates] = useState<VerifiedCertificate[]>(() => {
    const saved = localStorage.getItem('dtech_certificates_v2');
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  });

  const [trainers] = useState<Trainer[]>(INITIAL_TRAINERS);
  const [news] = useState<DTechNews[]>(INITIAL_NEWS);

  // Statistiques Administratives Direction Générale (DG)
  const [adminStats, setAdminStats] = useState<AdminStats>(() => {
    const activeCount = courses.length;
    const totalStudents = 347 + (enrollments.length - INITIAL_ENROLLMENTS.length);
    const monthEnroll = 86 + (enrollments.length - INITIAL_ENROLLMENTS.length);
    const totalRev = enrollments.reduce((acc, curr) => acc + (curr.paymentStatus === 'completed' ? curr.amountFCFA : 0), 29850000);
    const monthRev = 7480000;

    return {
      activeFormations: activeCount,
      totalEnrolledStudents: totalStudents,
      monthlyEnrollments: monthEnroll,
      monthlyRevenueFCFA: monthRev,
      totalRevenueFCFA: totalRev,
      pendingPaymentsCount: enrollments.filter(e => e.paymentStatus === 'pending').length,
      certificatesIssuedCount: certificates.length,
      activeTrainersCount: trainers.length,
      retentionRatePercent: 96.4
    };
  });

  const handleOpenRegistration = (formationId?: string) => {
    setSelectedFormationForRegistration(formationId || null);
    setSelectedCourseForDetail(null);
    setRegistrationModalOpen(true);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setLoginModalOpen(false);

    // Redirection automatique selon le rôle RBAC
    switch (user.role) {
      case 'admin':
        navigateTo('/admin');
        break;
      case 'study_director':
        navigateTo('/study-director');
        break;
      case 'secretary':
        navigateTo('/secretary');
        break;
      case 'trainer':
        navigateTo('/trainer');
        break;
      case 'student':
      default:
        navigateTo('/student');
        break;
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    navigateTo('/');
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleValidatePayment = (enrollmentId: string) => {
    setEnrollments(prev =>
      prev.map(enr => (enr.id === enrollmentId ? { ...enr, paymentStatus: 'completed' as const } : enr))
    );
  };

  const handleIssueCertificate = (enrollmentId: string) => {
    const enr = enrollments.find(e => e.id === enrollmentId);
    if (!enr) return;

    const certNumber = `DTECH-2026-TG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCert: VerifiedCertificate = {
      certificateNumber: certNumber,
      studentName: enr.studentName,
      courseTitle: enr.courseTitle,
      completionDate: new Date().toISOString().split('T')[0],
      grade: 'Mention Très Bien (17.5/20)',
      hours: 60,
      location: `${enr.studentCity}, TOGO`,
      instructorName: 'Directeur de Pôle Pédagogique DTECH',
      directorSignature: 'Dr. Yaovi D. TOSSOU — Directeur Général DTECH GROUP',
      qrVerificationUrl: `https://cabinetdtech.com/certificat/${certNumber}`,
      status: 'valid'
    };

    setCertificates(prev => [newCert, ...prev]);
    setEnrollments(prev =>
      prev.map(e => (e.id === enrollmentId ? { ...e, certificateIssued: true, certificateNumber: certNumber, grade: 'Très Bien' } : e))
    );
  };

  const handleAddSession = (courseId: string, sessionData: any) => {
    setCourses(prevCourses =>
      prevCourses.map(c => (c.id === courseId ? { ...c, sessions: [...c.sessions, sessionData] } : c))
    );
  };

  const handleOpenCertificateFromStudent = (cert: VerifiedCertificate) => {
    setActiveCertForVerification(cert);
    navigateTo('/verify-cert');
  };

  // ==========================================================================
  // CONTRÔLE D'ACCÈS AUX ESPACES PRIVÉS (STRICT ROLE GUARDS)
  // ==========================================================================

  const renderRouteContent = () => {
    const cleanPath = currentPath.split('?')[0];
    const searchString = currentPath.includes('?') 
      ? currentPath.split('?')[1] 
      : (typeof window !== 'undefined' && window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
    const searchParams = new URLSearchParams(searchString);
    const diplomaQueryId = searchParams.get('id') || undefined;

    // 0. PORTAIL PUBLIC : VÉRIFICATION OFFICIELLE DU DIPLÔME PAR QR CODE (ÉTAPE 9)
    if (cleanPath === '/verify-diploma') {
      return (
        <DiplomaVerifierView
          initialDiplomaId={diplomaQueryId}
          onNavigate={navigateTo}
        />
      );
    }

    // 0.1. GESTION DES DIPLÔMES ACADÉMIQUES (DG & DIRECTEUR DES ÉTUDES - ÉTAPE 9)
    if (cleanPath === '/diplomas' || cleanPath === '/admin/diplomas') {
      if (!currentUser) {
        return (
          <AccessDeniedView
            requiredRole="study_director"
            currentUser={null}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        );
      }
      if (currentUser.role !== 'admin' && currentUser.role !== 'study_director') {
        return (
          <AccessDeniedView
            requiredRole="study_director"
            currentUser={currentUser}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
            onGoToOwnSpace={() => {
              if (currentUser.role === 'secretary') navigateTo('/secretary');
              else if (currentUser.role === 'trainer') navigateTo('/trainer');
              else if (currentUser.role === 'student') navigateTo('/student');
            }}
          />
        );
      }
      return (
        <AdminDiplomaManagementView
          currentUser={currentUser}
          onNavigate={navigateTo}
        />
      );
    }

    // 1. ESPACE DIRECTION GÉNÉRALE (ADMIN UNIQUEMENT)
    if (cleanPath === '/admin') {
      if (!currentUser) {
        return (
          <AccessDeniedView
            requiredRole="admin"
            currentUser={null}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        );
      }
      if (currentUser.role !== 'admin') {
        return (
          <AccessDeniedView
            requiredRole="admin"
            currentUser={currentUser}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
            onGoToOwnSpace={() => {
              if (currentUser.role === 'study_director') navigateTo('/study-director');
              else if (currentUser.role === 'secretary') navigateTo('/secretary');
              else if (currentUser.role === 'trainer') navigateTo('/trainer');
              else navigateTo('/student');
            }}
          />
        );
      }
      return (
        <AdminDashboardView
          currentUser={currentUser}
          stats={adminStats}
          enrollments={enrollments}
          courses={courses}
          trainers={trainers}
          certificates={certificates}
          onValidatePayment={handleValidatePayment}
          onIssueCertificate={handleIssueCertificate}
          onAddSession={handleAddSession}
          onNavigate={navigateTo}
        />
      );
    }

    // 2. ESPACE DIRECTEUR DES ÉTUDES (STUDY_DIRECTOR OU ADMIN)
    if (cleanPath === '/study-director') {
      if (!currentUser) {
        return (
          <AccessDeniedView
            requiredRole="study_director"
            currentUser={null}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        );
      }
      if (currentUser.role !== 'study_director' && currentUser.role !== 'admin') {
        return (
          <AccessDeniedView
            requiredRole="study_director"
            currentUser={currentUser}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
            onGoToOwnSpace={() => {
              if (currentUser.role === 'secretary') navigateTo('/secretary');
              else if (currentUser.role === 'trainer') navigateTo('/trainer');
              else if (currentUser.role === 'student') navigateTo('/student');
              else navigateTo('/admin');
            }}
          />
        );
      }
      return (
        <StudyDirectorPortalView
          currentUser={currentUser}
          onNavigate={navigateTo}
        />
      );
    }

    // 3. ESPACE SECRÉTARIAT (SECRETARY OU ADMIN)
    if (cleanPath === '/secretary') {
      if (!currentUser) {
        return (
          <AccessDeniedView
            requiredRole="secretary"
            currentUser={null}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        );
      }
      if (currentUser.role !== 'secretary' && currentUser.role !== 'admin') {
        return (
          <AccessDeniedView
            requiredRole="secretary"
            currentUser={currentUser}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
            onGoToOwnSpace={() => {
              if (currentUser.role === 'study_director') navigateTo('/study-director');
              else if (currentUser.role === 'trainer') navigateTo('/trainer');
              else if (currentUser.role === 'student') navigateTo('/student');
              else navigateTo('/admin');
            }}
          />
        );
      }
      return (
        <SecretaryPortalView
          currentUser={currentUser}
          onNavigate={navigateTo}
        />
      );
    }

    // 4. ESPACE FORMATEUR (TRAINER OU ADMIN)
    if (cleanPath === '/trainer') {
      if (!currentUser) {
        return (
          <AccessDeniedView
            requiredRole="trainer"
            currentUser={null}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        );
      }
      if (currentUser.role !== 'trainer' && currentUser.role !== 'admin') {
        return (
          <AccessDeniedView
            requiredRole="trainer"
            currentUser={currentUser}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
            onGoToOwnSpace={() => {
              if (currentUser.role === 'study_director') navigateTo('/study-director');
              else if (currentUser.role === 'secretary') navigateTo('/secretary');
              else if (currentUser.role === 'student') navigateTo('/student');
              else navigateTo('/admin');
            }}
          />
        );
      }
      return (
        <TrainerPortalView
          currentUser={currentUser}
          onNavigate={navigateTo}
        />
      );
    }

    // 5. ESPACE ÉTUDIANT (STUDENT OU ADMIN)
    if (cleanPath === '/student') {
      if (!currentUser) {
        return (
          <AccessDeniedView
            requiredRole="student"
            currentUser={null}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        );
      }
      if (currentUser.role !== 'student' && currentUser.role !== 'admin') {
        return (
          <AccessDeniedView
            requiredRole="student"
            currentUser={currentUser}
            onGoHome={() => navigateTo('/')}
            onOpenLogin={() => setLoginModalOpen(true)}
            onGoToOwnSpace={() => {
              if (currentUser.role === 'study_director') navigateTo('/study-director');
              else if (currentUser.role === 'secretary') navigateTo('/secretary');
              else if (currentUser.role === 'trainer') navigateTo('/trainer');
              else navigateTo('/admin');
            }}
          />
        );
      }
      return (
        <StudentPortalView
          currentUser={currentUser}
          certificates={certificates}
          onOpenCertificate={handleOpenCertificateFromStudent}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onNavigate={navigateTo}
        />
      );
    }

    // 6. PORTAIL PUBLIC : SERVICES AUX ENTREPRISES
    if (cleanPath === '/services') {
      return <CorporateServicesSection />;
    }

    // 7. PORTAIL PUBLIC : ACTUALITÉS & SESSIONS
    if (cleanPath === '/news') {
      return <NewsAndEventsSection news={news} />;
    }

    // 8. PORTAIL PUBLIC : CENTRES DE FORMATION
    if (cleanPath === '/centres' || cleanPath === '/contact') {
      return <OfficesAndContactSection />;
    }

    // 9. PORTAIL PUBLIC : VÉRIFICATION DE CERTIFICAT
    if (cleanPath === '/verify-cert') {
      return (
        <CertificateVerifierView
          certificates={certificates}
          selectedCertFromStudent={activeCertForVerification}
        />
      );
    }

    // 10. PORTAIL PUBLIC : ASSISTANT IA & ORIENTATION CARRIÈRE
    if (cleanPath === '/assistant-ia' || cleanPath === '/orientation-ia') {
      return (
        <AIOrientationView
          courses={courses}
          onSelectCourse={(c) => setSelectedCourseForDetail(c)}
          onEnrollCourse={(c) => handleOpenRegistration(c.id)}
          onNavigate={navigateTo}
        />
      );
    }

    // 11. PORTAIL PUBLIC : FOIRE AUX QUESTIONS (FAQ)
    if (cleanPath === '/faq') {
      return (
        <FAQView onNavigate={navigateTo} />
      );
    }

    // 12. PORTAIL PUBLIC PAR DÉFAUT : ACCUEIL & CATALOGUE DES FORMATIONS
    return (
      <CourseCatalogSection
        courses={courses}
        onSelectCourseForDetail={(c) => setSelectedCourseForDetail(c)}
        onEnrollCourse={(c) => handleOpenRegistration(c.id)}
        searchQuery={searchQuery}
      />
    );
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-800 selection:text-white overflow-x-hidden">
      
      {/* Barre de navigation institutionnelle */}
      <HeaderNavbar
        currentUser={currentUser}
        currentPath={currentPath}
        onNavigate={navigateTo}
        onOpenLogin={() => setLoginModalOpen(true)}
        onOpenRegister={() => handleOpenRegistration()}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onToggleAiAssistant={() => setAiAssistantOpen(prev => !prev)}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onDeleteNotification={handleDeleteNotification}
      />

      {/* Contenu Principal selon la Route et le Rôle */}
      <main className="flex-grow">
        {renderRouteContent()}
      </main>

      {/* Toast Notification Flottant en Temps Réel */}
      <NotificationToast
        notification={activeToast}
        onClose={() => setActiveToast(null)}
        onNavigate={navigateTo}
      />

      {/* Widget Flottant & Conseiller Pédagogique DTECH GROUP */}
      <AIAssistantWidget
        isOpen={aiAssistantOpen}
        onToggle={() => setAiAssistantOpen(prev => !prev)}
        onNavigate={navigateTo}
        onSelectCourse={(c) => setSelectedCourseForDetail(c)}
        onEnrollCourse={(c) => handleOpenRegistration(c.id)}
        courses={courses}
      />

      {/* Footer Institutionnel */}
      <PlatformFooter
        currentUser={currentUser}
        onNavigate={navigateTo}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Modale d'Authentification Sécurisée (5 Rôles) */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenRegister={() => handleOpenRegistration()}
        onNavigate={navigateTo}
      />

      {/* Modale Détail Formation */}
      {selectedCourseForDetail && (
        <CourseDetailModal
          course={selectedCourseForDetail}
          onClose={() => setSelectedCourseForDetail(null)}
          onEnroll={(c) => handleOpenRegistration(c.id)}
        />
      )}

      {/* Modale d’Inscription en Ligne (7 Étapes & 25 000 FCFA Mobile Money) */}
      {registrationModalOpen && (
        <RegistrationModal
          initialFormationId={selectedFormationForRegistration}
          onClose={() => setRegistrationModalOpen(false)}
          onSuccessLogin={(email) => {
            setLoginModalOpen(true);
          }}
        />
      )}

    </div>
  );
}
