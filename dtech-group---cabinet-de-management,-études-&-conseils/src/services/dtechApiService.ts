import { authService } from './authService';

export const dtechApiService = {
  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = authService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || data.error || `Erreur serveur (${response.status})`);
    }

    return data;
  },

  // Espace Étudiant
  async getStudentDashboard() {
    return this.fetchWithAuth('/api/student/dashboard');
  },

  // Espace Formateur
  async getTrainerDashboard() {
    return this.fetchWithAuth('/api/trainer/dashboard');
  },

  async publishTrainerResource(resourceData: {
    title: string;
    description?: string;
    type?: string;
    courseId: string;
    moduleId?: string;
    promotionId?: string;
    groupIds: string[];
    fileName?: string;
    fileUrl?: string;
    fileSizeBytes?: string;
    orderIndex?: number;
    status?: 'published' | 'draft' | 'archived';
  }) {
    return this.fetchWithAuth('/api/trainer/resources/publish', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    });
  },

  async updateTrainerResource(resourceId: string, resourceData: {
    title?: string;
    description?: string;
    moduleId?: string;
    groupIds?: string[];
    status?: 'published' | 'draft' | 'archived';
    orderIndex?: number;
  }) {
    return this.fetchWithAuth(`/api/trainer/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData)
    });
  },

  async deleteTrainerResource(resourceId: string) {
    return this.fetchWithAuth(`/api/trainer/resources/${resourceId}`, {
      method: 'DELETE'
    });
  },

  async recordAttendance(attendanceData: {
    courseId: string;
    groupId: string;
    studentId: string;
    studentName: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    comment?: string;
    date?: string;
  }) {
    return this.fetchWithAuth('/api/trainer/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    });
  },

  async recordGrade(gradeData: {
    evaluationId: string;
    evaluationTitle: string;
    studentId: string;
    studentName: string;
    score: number;
    maxScore?: number;
    comment?: string;
  }) {
    return this.fetchWithAuth('/api/trainer/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData)
    });
  },

  // Espace Directeur des Études
  async getStudyDirectorDashboard() {
    return this.fetchWithAuth('/api/study-director/dashboard');
  },

  async assignTrainerToGroup(groupId: string, trainerId: string) {
    return this.fetchWithAuth('/api/study-director/assign-trainer', {
      method: 'POST',
      body: JSON.stringify({ groupId, trainerId })
    });
  },

  async assignSubjectTrainerToGroup(groupId: string, courseUnitId: string, trainerId: string) {
    return this.fetchWithAuth('/api/study-director/assign-subject-trainer', {
      method: 'POST',
      body: JSON.stringify({ groupId, courseUnitId, trainerId })
    });
  },

  async removeSubjectTrainerFromGroup(assignmentId: string) {
    return this.fetchWithAuth('/api/study-director/remove-subject-trainer', {
      method: 'POST',
      body: JSON.stringify({ assignmentId })
    });
  },

  // Espace Secrétaire
  async getSecretaryDashboard() {
    return this.fetchWithAuth('/api/secretary/dashboard');
  },

  async validateSecretaryRegistration(registrationId: string, assignedGroupId?: string) {
    return this.fetchWithAuth('/api/secretary/validate-registration', {
      method: 'POST',
      body: JSON.stringify({ registrationId, assignedGroupId })
    });
  },

  // Espace Admin Direction Générale
  async getAdminDashboard() {
    return this.fetchWithAuth('/api/admin/dashboard');
  },

  // Inscription en ligne publique
  async submitOnlineRegistration(registrationData: any) {
    const response = await fetch('/api/registration/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Erreur lors de l\'enregistrement de votre dossier');
    }
    return data;
  },

  // Accès sécurisé à un support PDF
  async getSecureResourceAccess(resourceId: string) {
    return this.fetchWithAuth(`/api/resources/secure-access/${resourceId}`);
  },

  // ============================================================================
  // ÉTAPE 4 : MOTEUR D'EXERCICES ET TRAVAUX PRATIQUES
  // ============================================================================
  async getStudentExercises() {
    return this.fetchWithAuth('/api/exercises/student');
  },

  async submitStudentExercise(exerciseId: string, submissionData: {
    answers: Array<{
      questionId: string;
      studentAnswer?: string;
      fileName?: string;
      fileUrl?: string;
      fileSizeBytes?: string;
    }>;
    startedAt?: string;
  }) {
    return this.fetchWithAuth(`/api/student/exercises/${exerciseId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submissionData)
    });
  },

  async getTrainerExercises() {
    return this.fetchWithAuth('/api/exercises/trainer');
  },

  async createTrainerExercise(exerciseData: any) {
    return this.fetchWithAuth('/api/trainer/exercises', {
      method: 'POST',
      body: JSON.stringify(exerciseData)
    });
  },

  async updateTrainerExercise(exerciseId: string, exerciseData: any) {
    return this.fetchWithAuth(`/api/trainer/exercises/${exerciseId}`, {
      method: 'PUT',
      body: JSON.stringify(exerciseData)
    });
  },

  async deleteTrainerExercise(exerciseId: string) {
    return this.fetchWithAuth(`/api/trainer/exercises/${exerciseId}`, {
      method: 'DELETE'
    });
  },

  async gradeStudentAttempt(attemptId: string, gradingData: {
    answersGrading: Array<{
      questionId: string;
      pointsEarned: number;
      trainerComment?: string;
    }>;
    generalFeedback?: string;
    confirmOfficialValidation?: boolean;
    action?: 'save_draft' | 'publish';
  }) {
    return this.fetchWithAuth(`/api/trainer/attempts/${attemptId}/grade`, {
      method: 'POST',
      body: JSON.stringify(gradingData)
    });
  },

  // ==========================================
  // ÉTAPE 5 — API OFFICIELLE DES QUIZ
  // ==========================================
  async getStudentQuizzes() {
    return this.fetchWithAuth('/api/quizzes/student');
  },

  async submitStudentQuiz(quizId: string, answers: Array<{ questionId: string; studentAnswer: any }>) {
    return this.fetchWithAuth(`/api/student/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  async getTrainerQuizzes() {
    return this.fetchWithAuth('/api/quizzes/trainer');
  },

  async getStudyDirectorQuizzes(centerId?: string) {
    const query = centerId ? `?centerId=${centerId}` : '';
    return this.fetchWithAuth(`/api/quizzes/study-director${query}`);
  },

  async createTrainerQuiz(quizData: any) {
    return this.fetchWithAuth('/api/trainer/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
  },

  async updateTrainerQuiz(quizId: string, quizData: any) {
    return this.fetchWithAuth(`/api/trainer/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(quizData)
    });
  },

  async archiveTrainerQuiz(quizId: string) {
    return this.fetchWithAuth(`/api/trainer/quizzes/${quizId}/archive`, {
      method: 'POST'
    });
  },

  async saveQuizSubmissionDraft(submissionId: string, data: {
    answers: Array<{ questionId: string; attributedPoints?: number; trainerComment?: string }>;
    generalComment?: string;
  }) {
    return this.fetchWithAuth(`/api/trainer/quizzes/submissions/${submissionId}/save`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async validateQuizSubmission(submissionId: string, data: {
    answers: Array<{ questionId: string; attributedPoints?: number; trainerComment?: string }>;
    generalComment?: string;
  }) {
    return this.fetchWithAuth(`/api/trainer/quizzes/submissions/${submissionId}/validate`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async reviseQuizSubmission(submissionId: string, data: {
    answers: Array<{ questionId: string; attributedPoints?: number; trainerComment?: string }>;
    revisionReason: string;
    generalComment?: string;
  }) {
    return this.fetchWithAuth(`/api/trainer/quizzes/submissions/${submissionId}/revise`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getQuizSubmissionAudit(submissionId: string) {
    return this.fetchWithAuth(`/api/quizzes/submissions/${submissionId}/audit`);
  },

  async runQuizEngineTests() {
    return this.fetchWithAuth('/api/quizzes/tests/run');
  },

  // ==========================================================================
  // ÉTAPE 7 — MOTEUR DES TENTATIVES & HISTORIQUE DES RÉSULTATS
  // ==========================================================================
  async getStudentAttempts() {
    return this.fetchWithAuth('/api/attempts/student');
  },

  async getTrainerAttempts() {
    return this.fetchWithAuth('/api/attempts/trainer');
  },

  async getStudyDirectorAttempts(centerId?: string) {
    const url = centerId ? `/api/attempts/study-director?centerId=${centerId}` : '/api/attempts/study-director';
    return this.fetchWithAuth(url);
  },

  async reviseAttemptScore(data: { attemptId: string; newScore: number; reason: string }) {
    return this.fetchWithAuth('/api/attempts/revise-score', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getAttemptsAuditLogs() {
    return this.fetchWithAuth('/api/attempts/audit');
  },

  async runAttemptsEngineTests() {
    return this.fetchWithAuth('/api/attempts/tests/run');
  },

  // ==========================================================================
  // ÉTAPE 8 — VALIDATION OFFICIELLE DES MODULES (RÈGLE 60/40 & BEST SCORE)
  // ==========================================================================
  async getStudentModuleValidations() {
    return this.fetchWithAuth('/api/modules/validations/student');
  },

  async getTrainerModuleValidations(params?: { centerId?: string; formationId?: string; studentId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.centerId) searchParams.append('centerId', params.centerId);
    if (params?.formationId) searchParams.append('formationId', params.formationId);
    if (params?.studentId) searchParams.append('studentId', params.studentId);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.fetchWithAuth(`/api/modules/validations/trainer${query}`);
  },

  async getDirectorModuleValidations(params?: { centerId?: string; formationId?: string; studentId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.centerId) searchParams.append('centerId', params.centerId);
    if (params?.formationId) searchParams.append('formationId', params.formationId);
    if (params?.studentId) searchParams.append('studentId', params.studentId);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.fetchWithAuth(`/api/modules/validations/director${query}`);
  },

  async reviseModuleValidationScore(data: {
    recordId?: string;
    studentId: string;
    moduleId: string;
    newScore?: number;
    newStatus?: string;
    reason: string;
  }) {
    return this.fetchWithAuth('/api/modules/validations/revise', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getModuleValidationsAuditLogs(params?: { studentId?: string; moduleId?: string; centerId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.append('studentId', params.studentId);
    if (params?.moduleId) searchParams.append('moduleId', params.moduleId);
    if (params?.centerId) searchParams.append('centerId', params.centerId);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.fetchWithAuth(`/api/modules/validations/audit${query}`);
  },

  async runModuleValidationEngineTests() {
    return this.fetchWithAuth('/api/modules/validations/tests/run');
  },

  // ==========================================================================
  // ÉTAPE 9 — VALIDATION & GÉNÉRATION DES DIPLÔMES DTECH
  // ==========================================================================
  async getMyDiploma() {
    return this.fetchWithAuth('/api/diplomas/my');
  },

  async getDiplomasList(params?: { centerId?: string; formationId?: string; studentId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.centerId) searchParams.append('centerId', params.centerId);
    if (params?.formationId) searchParams.append('formationId', params.formationId);
    if (params?.studentId) searchParams.append('studentId', params.studentId);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.fetchWithAuth(`/api/diplomas/list${query}`);
  },

  async validateDiplomaOfficial(data: { studentId: string; reason?: string }) {
    return this.fetchWithAuth('/api/diplomas/validate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async revokeDiplomaOfficial(data: { studentId: string; reason: string }) {
    return this.fetchWithAuth('/api/diplomas/revoke', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async verifyDiplomaPublic(id: string) {
    const response = await fetch(`/api/diplomas/verify/${encodeURIComponent(id)}`);
    return response.json();
  },

  async runDiplomaEngineTests() {
    return this.fetchWithAuth('/api/diplomas/tests/run');
  }
};

