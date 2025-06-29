/// <reference types="vite/client" />

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
import { messaging } from './lib/firebase';
import { onMessage } from 'firebase/messaging';

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
  // 通知受信の設定
  useEffect(() => {
    // 通知許可をリクエスト
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          console.log('通知許可状態:', permission);
        } catch (error) {
          console.error('通知許可リクエストエラー:', error);
        }
      }
    };

    requestNotificationPermission();

    // フォアグラウンドでの通知受信
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('フォアグラウンドで通知を受信:', payload);
      
      // ブラウザ通知を表示
      if (Notification.permission === 'granted') {
        try {
          const notification = new Notification(
            payload.notification?.title || '新しい通知',
            {
              body: payload.notification?.body || '',
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              tag: 'reservation-notification',
              requireInteraction: true,
              data: payload.data
            }
          );

          // 通知クリック時の処理
          notification.onclick = () => {
            console.log('通知がクリックされました:', payload.data);
            window.focus();
            notification.close();
            
            // 予約一覧ページに遷移
            if (payload.data?.url) {
              console.log('遷移先URL:', payload.data.url);
              window.location.href = payload.data.url;
            }
          };

          // 通知エラー時の処理
          notification.onerror = (error) => {
            console.error('通知表示エラー:', error);
          };

          console.log('通知を表示しました:', payload.notification?.title);
        } catch (error) {
          console.error('通知作成エラー:', error);
        }
      } else {
        console.log('通知許可がありません。許可状態:', Notification.permission);
      }
    });

    return () => {
      console.log('通知リスナーを解除しました');
      unsubscribe();
    };
  }, []);

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
            <Route index element={<Dashboard />} />
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
