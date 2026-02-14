import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIAssistant } from './components/AIAssistant';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Subscription } from './pages/Subscription';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { ExploreFarms } from './pages/ExploreFarms';
import { Profile } from './pages/Profile';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './utils/auth';
import { LanguageProvider } from './utils/language';

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Determine if we're on a page that should show the navbar/footer
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isLogin = location.pathname === '/login';
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen flex flex-col">
      {!isLogin && !isDashboard && <Navbar isLoggedIn={isLoggedIn} />}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/preview_page.html" element={<Navigate to="/" replace />} />
          <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/explore-farms" element={<ExploreFarms />} />
          <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {!isLogin && !isDashboard && <Footer />}
      
      {/* AI Assistant - Available on all pages except login */}
      {!isLogin && <AIAssistant />}
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}
