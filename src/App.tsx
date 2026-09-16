import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/public/Home';
import { AuthProvider } from './contexts/AuthContext';

// ============================================================================
// Public Auth Pages
// ============================================================================
import { GetStarted } from './pages/public/auth/GetStarted';
import { StudentSignup } from './pages/public/auth/StudentSignup';
import { NyscSignup } from './pages/public/auth/NyscSignup';
import { RecruiterSignup } from './pages/public/auth/RecruiterSignup';
import { StudentLogin } from './pages/public/auth/StudentLogin';
import { RecruiterLogin } from './pages/public/auth/RecruiterLogin';

// ============================================================================
// Admin Pages
// ============================================================================
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminLayout } from './components/layout/admin/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import './styles/globals.css';

// ============================================================================
// Placeholder pages (to be built in Phase 4)
// ============================================================================
const AboutPage = () => (
  <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
    <h1>About Us</h1>
    <p>Coming soon...</p>
  </div>
);

const ProgramsPage = () => (
  <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
    <h1>Programs</h1>
    <p>Coming soon...</p>
  </div>
);

const JobsPage = () => (
  <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
    <h1>Jobs</h1>
    <p>Coming soon...</p>
  </div>
);

const BlogPage = () => (
  <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
    <h1>Blog</h1>
    <p>Coming soon...</p>
  </div>
);

const ContactPage = () => (
  <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
    <h1>Contact Us</h1>
    <p>Coming soon...</p>
  </div>
);

// ============================================================================
// App Component
// ============================================================================

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ==================================================================
              PUBLIC PAGES (with global Layout: Header + Footer)
              ================================================================== */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <AboutPage />
              </Layout>
            }
          />
          <Route
            path="/programs"
            element={
              <Layout>
                <ProgramsPage />
              </Layout>
            }
          />
          <Route
            path="/jobs"
            element={
              <Layout>
                <JobsPage />
              </Layout>
            }
          />
          <Route
            path="/blog"
            element={
              <Layout>
                <BlogPage />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout>
                <ContactPage />
              </Layout>
            }
          />

          {/* ==================================================================
              PUBLIC AUTH PAGES (with AuthLayout — no global Header/Footer)
              ================================================================== */}
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/get-started/student" element={<StudentSignup />} />
          <Route path="/get-started/nysc" element={<NyscSignup />} />
          <Route path="/get-started/recruiter" element={<RecruiterSignup />} />

          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/login/recruiter" element={<RecruiterLogin />} />

          {/* ==================================================================
              ADMIN PAGES
              ================================================================== */}

          {/* Admin Login — public route (no protection) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Dashboard — protected, requires role='admin' */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================================================================
              REDIRECTS
              ================================================================== */}

          {/* Legacy /login redirects to student login by default */}
          <Route path="/login" element={<Navigate to="/login/student" replace />} />

          {/* Legacy /signup redirects to get-started */}
          <Route path="/signup" element={<Navigate to="/get-started" replace />} />

          {/* /admin → /admin/dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* ==================================================================
              404 FALLBACK (redirect to home for now; proper 404 in Phase 4)
              ================================================================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;