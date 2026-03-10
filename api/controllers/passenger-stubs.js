// Retourne un JSON de test
export const stubHandler = (req, res) => {
  res.json({
    success: true,
    route: req.originalUrl,
    user: req.user || null
  });
};

// Tous les controllers principaux pointent vers stubHandler
export const adminController = {
  getScholarships: stubHandler,
  createScholarship: stubHandler,
  assignScholarshipAndFees: stubHandler,
  createTeacher: stubHandler,
  createClass: stubHandler,
  getClasses: stubHandler,
  createTimetable: stubHandler,
  getTimetables: stubHandler,
  deleteTimetable: stubHandler,
  createAnnouncement: stubHandler,
  getAnnouncements: stubHandler,
  getAdminStats: stubHandler
};

export const assignmentsController = {
  getAssignments: stubHandler
};

export const attendanceController = {
  markAttendance: stubHandler,
  getMyAttendance: stubHandler,
  getAttendanceByCourse: stubHandler
};

export const authController = {
  register: stubHandler,
  login: stubHandler
};

export const formationsController = {
  getFormations: stubHandler,
  getFormationById: stubHandler,
  enrollUser: stubHandler,
  getFormationStats: stubHandler
};

export const gradesController = {
  assignGrade: stubHandler,
  getMyGrades: stubHandler,
  getGradesByCourse: stubHandler,
  exportGradesPDF: stubHandler
};

export const paymentsController = {
  initiatePayment: stubHandler,
  mobileMoneyCallback: stubHandler,
  getStudentPayments: stubHandler,
  getAllPayments: stubHandler
};

export const statsController = {
  studentStats: stubHandler,
  adminStats: stubHandler
};

export const studentController = {
  dashboard: stubHandler,
  getMyAssignments: stubHandler,
  submitAssignment: stubHandler,
  getMyGrades: stubHandler,
  getMyAttendance: stubHandler
};

export const superAdminController = {
  getSuperAdminStats: stubHandler,
  createNews: stubHandler,
  getAllNews: stubHandler,
  getNewsById: stubHandler,
  updateNews: stubHandler,
  deleteNews: stubHandler,
  deleteUser: stubHandler
};

export const syncController = {
  syncOfflineActions: stubHandler
};

export const teacherController = {
  getMyCourses: stubHandler,
  getStudentsByCourse: stubHandler,
  createAssignment: stubHandler,
  addGrade: stubHandler,
  markAttendance: stubHandler,
  exportTeacherStatsExcel: stubHandler
};