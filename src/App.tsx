import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import LoginForm from '@components/auth/LoginForm';
import DashboardLayout from '@components/layout/DashboardLayout';
import Dashboard from '@pages/Dashboard';
import Appointments from '@pages/Appointments';
import Customers from '@pages/Customers';
import Services from '@pages/Services';
import NotFound from '@pages/NotFound';
import HolidaySettings from '@pages/HolidaySettings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />

          {/* "/" にアクセスしたら dashboard へ */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* プロテクトされたルート（相対パスに修正） */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="customers" element={<Customers />} />
            <Route path="services" element={<Services />} />
            <Route path="holidays" element={<HolidaySettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default App;