import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/public/Home';
import './styles/globals.css';

// Placeholder components for other pages
const AboutPage = () => <div style={{ padding: '4rem 2rem' }}><h1>About Us</h1><p>Coming soon...</p></div>;
const ProgramsPage = () => <div style={{ padding: '4rem 2rem' }}><h1>Programs</h1><p>Coming soon...</p></div>;
const JobsPage = () => <div style={{ padding: '4rem 2rem' }}><h1>Jobs</h1><p>Coming soon...</p></div>;
const BlogPage = () => <div style={{ padding: '4rem 2rem' }}><h1>Blog</h1><p>Coming soon...</p></div>;
const ContactPage = () => <div style={{ padding: '4rem 2rem' }}><h1>Contact Us</h1><p>Coming soon...</p></div>;
const LoginPage = () => <div style={{ padding: '4rem 2rem' }}><h1>Login</h1><p>Coming soon...</p></div>;
const GetStartedPage = () => <div style={{ padding: '4rem 2rem' }}><h1>Get Started</h1><p>Coming soon...</p></div>;

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/get-started" element={<GetStartedPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;