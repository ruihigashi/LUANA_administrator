// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging }  from 'firebase/messaging';

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
