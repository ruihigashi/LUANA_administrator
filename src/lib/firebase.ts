// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken }  from 'firebase/messaging';
import { createClient } from '@supabase/supabase-js';

const firebaseConfig = {
  apiKey:            'AIzaSyBV-LH2wxWi0qdDk97QPmdaW-BcmhO-Gkk',
  projectId:         'luana-b337b',
  messagingSenderId: '702933620606',
  appId:             '1:702933620606:web:4f6e1b3dfa86140c6e452f',
  // 下記はあってもなくても動きます（ログインなどしないなら不要）
  authDomain:        'luana-b337b.firebaseapp.com',
  storageBucket:     'luana-b337b.firebasestorage.app',
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// VAPIDキー（Firebase Consoleから取得した実際の値）
const VAPID_KEY = '76QY0aMZIAl7I29t7sr008115Z2aAuxf6wUzZLEb0AI';

// Supabaseクライアント
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * FCMトークンを取得する関数
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });
    return token;
  } catch (error) {
    console.error('FCMトークン取得エラー:', error);
    return null;
  }
}

/**
 * 管理者のFCMトークンをSupabaseに保存する関数
 */
export async function registerAdminToken(): Promise<void> {
  try {
    // 通知許可をリクエスト
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('通知許可が拒否されました');
        return;
      }
    }

    // FCMトークンを取得
    const token = await getFCMToken();
    if (!token) {
      console.error('FCMトークンの取得に失敗しました');
      return;
    }

    // Supabaseに管理者トークンを保存
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert({ 
        user_id: 'admin', 
        token,
        is_admin: true 
      });

    if (error) {
      console.error('管理者トークン保存エラー:', error);
    } else {
      console.log('管理者トークンが正常に保存されました');
    }
  } catch (error) {
    console.error('管理者トークン登録エラー:', error);
  }
}
