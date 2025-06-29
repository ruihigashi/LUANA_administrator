// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken }  from 'firebase/messaging';
import supabase from './supabase';

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
const VAPID_KEY = 'BLl31oUG76kR0zJvcNHOOwlxFshCOz97zHqm8XozfQTWJ38CVWIrauKuEjFD-vqjKRAXdMkuKDLC-kj5rRyJeyY';

/**
 * FCMトークンを取得する関数
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    console.log('FCMトークン取得開始');
    console.log('VAPIDキー:', VAPID_KEY);
    console.log('Messaging:', messaging);
    
    // 通知許可の確認
    if ('Notification' in window) {
      console.log('通知許可状態:', Notification.permission);
      if (Notification.permission !== 'granted') {
        console.log('通知許可がありません。許可をリクエストします。');
        const permission = await Notification.requestPermission();
        console.log('通知許可リクエスト結果:', permission);
        if (permission !== 'granted') {
          console.error('通知許可が拒否されました');
          return null;
        }
      }
    } else {
      console.error('このブラウザは通知をサポートしていません');
      return null;
    }

    console.log('getToken呼び出し開始');
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });
    
    if (token) {
      console.log('FCMトークン取得成功:', token.substring(0, 20) + '...');
    } else {
      console.error('FCMトークンがnullでした');
    }
    
    return token;
  } catch (error) {
    console.error('FCMトークン取得エラー:', error);
    if (error instanceof Error) {
      console.error('エラー詳細:', error.message);
      console.error('エラースタック:', error.stack);
    }
    return null;
  }
}

/**
 * 管理者のFCMトークンをSupabaseに保存する関数
 */
export async function registerAdminToken(): Promise<void> {
  try {
    console.log('管理者トークン登録開始');
    
    // 通知許可をリクエスト
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('通知許可が拒否されました');
        alert('通知を許可してください。');
        return;
      }
    }

    // FCMトークンを取得
    const token = await getFCMToken();
    if (!token) {
      console.error('FCMトークンの取得に失敗しました');
      alert('FCMトークンの取得に失敗しました。');
      return;
    }

    console.log('FCMトークン取得成功:', token.substring(0, 20) + '...');

    // まずテーブルが存在するかチェック
    try {
      const { error: tableError } = await supabase
        .from('fcm_tokens')
        .select('count', { count: 'exact', head: true });

      if (tableError) {
        console.error('fcm_tokensテーブルエラー:', tableError);
        alert('fcm_tokensテーブルが存在しません。Supabaseでテーブルを作成してください。');
        return;
      }
    } catch (error) {
      console.error('テーブルチェックエラー:', error);
      alert('テーブルアクセスに失敗しました。');
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
      alert(`管理者トークン保存エラー: ${error.message}`);
    } else {
      console.log('管理者トークンが正常に保存されました');
    }
  } catch (error) {
    console.error('管理者トークン登録エラー:', error);
    alert('管理者トークン登録に失敗しました。');
  }
}
