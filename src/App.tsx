import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Courses } from './pages/public/Courses';
import { CourseDetail } from './pages/public/CourseDetail';
import { AuthProvider } from './contexts/AuthContext';
import { Alumni } from './pages/public/Alumni';
import { AlumniProfile } from './pages/public/AlumniProfile';
import { Blog } from './pages/public/Blog';
import { BlogPost } from './pages/public/BlogPost';

// ============================================================================
// Admin Pages (Blog)
// ============================================================================
import { AdminBlog } from './pages/admin/Blog';
import { AdminBlogForm } from './pages/admin/BlogForm';

// ============================================================================
// Public Auth Pages
// ============================================================================
import { Register } from './pages/public/auth/Register';
import { RegisterRecruiter } from './pages/public/auth/RegisterRecruiter';
import { Login } from './pages/public/auth/Login';
import { LoginRecruiter } from './pages/public/auth/LoginRecruiter';

// ============================================================================
// Member Pages
// ============================================================================
import { MemberDashboard } from './pages/member/Dashboard';
import { MemberLayout } from './components/layout/member/MemberLayout';

// ============================================================================
// Admin Pages
// ============================================================================
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminAlumni } from './pages/admin/Alumni';
import { AdminAlumniForm } from './pages/admin/AlumniForm';
import { AdminCourses } from './pages/admin/Courses';
import { AdminCourseForm } from './pages/admin/CourseForm';
import { AdminLayout } from './components/layout/admin/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import './styles/globals.css';

// ============================================================================
// Placeholder helper
// ============================================================================

const placeholder = (title: string) => () => (
  <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>Coming soon...</p>
  </div>
);

// ============================================================================
// Public placeholders
// ============================================================================

const JobsPage = placeholder('Jobs');
const ContactPage = placeholder('Contact Us');
const HireFromUsPage = placeholder('Hire From Us');
const ScholarshipsPage = placeholder('Scholarships');
const AiCounselorPage = placeholder('AI Career Counselor');

// ============================================================================
// Member sub-page placeholders
// ============================================================================

const MemberProfilePage = placeholder('My Profile');
const MemberCoursesPage = placeholder('My Courses');
const MemberClassesPage = placeholder('Classes & Live Sessions');
const MemberCalendarPage = placeholder('Calendar');
const MemberCertificatesPage = placeholder('Certificates');
const MemberCareerPage = placeholder('Career Journey');
const MemberReadinessPage = placeholder('Job Readiness Assessment');
const MemberOpportunitiesPage = placeholder('Opportunities');
const MemberCvPage = placeholder('CV Builder');
const MemberPortfolioPage = placeholder('Portfolio');
const MemberLinkedInPage = placeholder('LinkedIn Optimization');
const MemberAiCounselorPage = placeholder('AI Career Counselor');
const MemberResourcesPage = placeholder('Career Resources');
const MemberAlumniPage = placeholder('Alumni Community');
const MemberAnnouncementsPage = placeholder('Announcements');
const MemberSettingsPage = placeholder('Settings');

// ============================================================================
// Admin sub-page placeholders
// ============================================================================

const AdminStudentsPage = placeholder('Manage Students');
const AdminHomepagePage = placeholder('Manage Homepage');
const AdminAboutPage = placeholder('Manage About Us');
const AdminEventsPage = placeholder('Manage Events');
const AdminFaqsPage = placeholder('Manage FAQs');
const AdminTestimonialsPage = placeholder('Manage Testimonials');
const AdminUsersPage = placeholder('Manage Users');
const AdminEnrollmentsPage = placeholder('Manage Enrollments');
const AdminCertificatesPage = placeholder('Manage Certificates');
const AdminTalentPage = placeholder('Manage Talent');
const AdminJobsAdminPage = placeholder('Manage Jobs');
const AdminCareerPage = placeholder('Manage Career');
const AdminServicesPage = placeholder('Manage Services');
const AdminPaymentsPage = placeholder('Manage Payments');
const AdminAnnouncementsPage = placeholder('Manage Announcements');
const AdminReportsPage = placeholder('Reports');
const AdminSettingsPage = placeholder('Settings');

// ============================================================================
// App Component
// ============================================================================

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ==================================================================
              PUBLIC PAGES (Header + Footer)
              ================================================================== */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/courses" element={<Layout><Courses /></Layout>} />
          <Route path="/courses/:slug" element={<Layout><CourseDetail /></Layout>} />
          <Route path="/jobs" element={<Layout><JobsPage /></Layout>} />

          {/* Blog — listing at /blog, detail at /blog/:slug */}
          <Route path="/blog" element={<Layout><Blog /></Layout>} />
          <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />

          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/hire-from-us" element={<Layout><HireFromUsPage /></Layout>} />
          <Route path="/alumni" element={<Layout><Alumni /></Layout>} />
          <Route path="/alumni/:id" element={<Layout><AlumniProfile /></Layout>} />
          <Route path="/scholarships" element={<Layout><ScholarshipsPage /></Layout>} />
          <Route path="/ai-career-counselor" element={<Layout><AiCounselorPage /></Layout>} />

          {/* ==================================================================
              PUBLIC AUTH PAGES
              ================================================================== */}
          <Route path="/register" element={<Register />} />
          <Route path="/register/recruiter" element={<RegisterRecruiter />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/recruiter" element={<LoginRecruiter />} />

          {/* ==================================================================
              MEMBER PAGES (protected — account_type = member)
              ================================================================== */}
          <Route path="/dashboard" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberDashboard /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberProfilePage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/courses" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberCoursesPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/classes" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberClassesPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/calendar" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberCalendarPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/certificates" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberCertificatesPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/career" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberCareerPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/readiness" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberReadinessPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/opportunities" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberOpportunitiesPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/cv" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberCvPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/portfolio" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberPortfolioPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/linkedin" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberLinkedInPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/ai-counselor" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberAiCounselorPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/resources" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberResourcesPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/alumni" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberAlumniPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/announcements" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberAnnouncementsPage /></MemberLayout></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute requiredAccountType="member"><MemberLayout><MemberSettingsPage /></MemberLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — LOGIN
              ================================================================== */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ==================================================================
              ADMIN — DASHBOARD
              ================================================================== */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — STUDENTS
              ================================================================== */}
          <Route path="/admin/students" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminStudentsPage /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — CONTENT MANAGEMENT
              ================================================================== */}
          <Route path="/admin/homepage" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminHomepagePage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/about" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminAboutPage /></AdminLayout></ProtectedRoute>} />

          {/* Blog admin */}
          <Route path="/admin/blog" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminBlog /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/blog/new" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminBlogForm /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/blog/:id/edit" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminBlogForm /></AdminLayout></ProtectedRoute>} />

          <Route path="/admin/events" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminEventsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/faqs" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminFaqsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/testimonials" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminTestimonialsPage /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — COURSES (Phase 10D)
              ================================================================== */}
          <Route path="/admin/courses" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminCourses /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/courses/new" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminCourseForm /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/courses/:id" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminCourseForm /></AdminLayout></ProtectedRoute>} />

          {/* Legacy admin "programs" path redirects to courses */}
          <Route path="/admin/programs" element={<Navigate to="/admin/courses" replace />} />

          {/* ==================================================================
              ADMIN — LEARNING (Enrollments, Certificates)
              ================================================================== */}
          <Route path="/admin/enrollments" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminEnrollmentsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/certificates" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminCertificatesPage /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — USERS
              ================================================================== */}
          <Route path="/admin/users/students" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users/recruiters" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users/admins" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — TALENT
              ================================================================== */}
          <Route path="/admin/talent" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminTalentPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/talent/requests" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminTalentPage /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — JOBS
              ================================================================== */}
          <Route path="/admin/jobs" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminJobsAdminPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/jobs/applications" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminJobsAdminPage /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — CAREER
              ================================================================== */}
          <Route path="/admin/career/readiness" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminCareerPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/career/assessments" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminCareerPage /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — SERVICES
              ================================================================== */}
          <Route path="/admin/services/cv-reviews" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminServicesPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/services/cv-builder" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminServicesPage /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — PAYMENTS
              ================================================================== */}
          <Route path="/admin/payments/transactions" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminPaymentsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/payments/revenue" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminPaymentsPage /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — ALUMNI (Phase 9A)
              ================================================================== */}
          <Route path="/admin/alumni" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminAlumni /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/alumni/new" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminAlumniForm /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/alumni/:id/edit" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminAlumniForm /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — COMMUNITY
              ================================================================== */}
          <Route path="/admin/community/announcements" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminAnnouncementsPage /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              ADMIN — SYSTEM
              ================================================================== */}
          <Route path="/admin/reports" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminReportsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredAccountType="admin"><AdminLayout><AdminSettingsPage /></AdminLayout></ProtectedRoute>} />

          {/* ==================================================================
              REDIRECTS
              ================================================================== */}

          {/* Public legacy */}
          <Route path="/programs" element={<Navigate to="/courses" replace />} />
          <Route path="/get-started" element={<Navigate to="/register" replace />} />
          <Route path="/get-started/student" element={<Navigate to="/register" replace />} />
          <Route path="/get-started/nysc" element={<Navigate to="/register" replace />} />
          <Route path="/get-started/recruiter" element={<Navigate to="/register/recruiter" replace />} />
          <Route path="/login/student" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />

          {/* Admin legacy */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/community/alumni" element={<Navigate to="/admin/alumni" replace />} />

          {/* ==================================================================
              404 FALLBACK
              ================================================================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;