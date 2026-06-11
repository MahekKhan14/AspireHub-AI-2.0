import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CareerProvider } from './context/CareerContext';
import Navbar from './components/Navbar';
import ChatbotWidget from './components/ChatbotWidget';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import AdminPage from './pages/AdminPage';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
        <Route path="/results/:assessmentId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isAuthenticated && <ChatbotWidget />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#0F172A', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '12px', fontFamily: 'Poppins, sans-serif' },
          success: { iconTheme: { primary: '#F59E0B', secondary: '#0f172a' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#0f172a' } }
        }}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CareerProvider>
          <AppContent />
        </CareerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
