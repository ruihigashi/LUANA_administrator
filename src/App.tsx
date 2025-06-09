/// <reference types="vite/client" />
alert('App.tsx が読み込まれました');

import React, { useEffect } from 'react';
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
import { supabase } from './lib/supabase';

// VAPID 公開キーを Uint8Array に変換するユーティリティ
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

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
  // ── ここから追加 ──
  useEffect(() => {
    // 通知の権限をリクエスト
    Notification.requestPermission().then((permission) => {
      if (permission !== 'granted') return;
      // Service Worker の準備完了を待ってから購読開始
      navigator.serviceWorker.ready.then(async (registration) => {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            import.meta.env.VITE_VAPID_PUBLIC_KEY!
          ),
        });
        const { error } = await supabase
          .from('push_subscriptions')
          .insert({ subscription: subscription.toJSON() });
        if (error) {
          console.error('Failed to save subscription:', error);
        } else {
          console.log('Push subscription saved!');
        }
      });
    });
  }, []);
  // ── ここまで追加 ──

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />

          {/* / に来たら /dashboard へ */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 認証保護されたルート */}
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
