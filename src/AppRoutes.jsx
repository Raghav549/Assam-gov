// ============================================
// APP ROUTES CONFIGURATION
// ============================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

// Auth Pages
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';

// Student Dashboard Pages
import Dashboard from './components/Student/Dashboard';
import HelpEnquiry from './components/Student/HelpEnquiry';
import Scholarships from './components/Student/Scholarships';
import Courses from './components/Student/Courses';
import GovtTracker from './components/Student/GovtTracker';
import SocialFeed from './components/Student/SocialFeed';
import Donations from './components/Student/Donations';
import Profile from './components/Student/Profile';

// Admin Pages
import AdminDashboard from './components/Admin/AdminDashboard';
import ManageUsers from './components/Admin/ManageUsers';
import ManageScholarships from './components/Admin/ManageScholarships';
import ManageCourses from './components/Admin/ManageCourses';
import ManageGovtData from './components/Admin/ManageGovtData';
import ManagePosts from './components/Admin/ManagePosts';
import ManageDonations from './components/Admin/ManageDonations';
import ManageHelpRequests from './components/Admin/ManageHelpRequests';
import ManageNotifications from './components/Admin/ManageNotifications';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (Redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

          {/* Student Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpEnquiry /></ProtectedRoute>} />
          <Route path="/scholarships" element={<ProtectedRoute><Scholarships /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/govt-tracker" element={<ProtectedRoute><GovtTracker /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><SocialFeed /></ProtectedRoute>} />
          <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/scholarships" element={<ProtectedRoute adminOnly><ManageScholarships /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute adminOnly><ManageCourses /></ProtectedRoute>} />
          <Route path="/admin/govt-data" element={<ProtectedRoute adminOnly><ManageGovtData /></ProtectedRoute>} />
          <Route path="/admin/posts" element={<ProtectedRoute adminOnly><ManagePosts /></ProtectedRoute>} />
          <Route path="/admin/donations" element={<ProtectedRoute adminOnly><ManageDonations /></ProtectedRoute>} />
          <Route path="/admin/help-requests" element={<ProtectedRoute adminOnly><ManageHelpRequests /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute adminOnly><ManageNotifications /></ProtectedRoute>} />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default AppRoutes;
