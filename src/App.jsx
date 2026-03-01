import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Verification from './pages/Verification';
import Print from './pages/print';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  return (
    <Router>
      <>
        <Navbar />
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ── Protected routes ── */}
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />

          {/* Verification is shared mapping, actual UI restriction inside Verification.jsx */}
          <Route path="/results" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />

          {/* /verify strictly requires pharmacist role */}
          <Route path="/verify" element={<ProtectedRoute allowedRoles={['pharmacist']}><Verification /></ProtectedRoute>} />

          <Route path="/print" element={<ProtectedRoute><Print /></ProtectedRoute>} />
        </Routes>
      </>
    </Router>
  );
}

export default App;