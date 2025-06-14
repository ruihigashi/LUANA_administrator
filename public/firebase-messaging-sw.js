// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            'AIzaSyBV-LH2wxWi0qdDk97QPmdaW-BcmhO-Gkk',
  projectId:         'luana-b337b',
  messagingSenderId: '702933620606',
  appId:             '1:702933620606:web:4f6e1b3dfa86140c6e452f',
  // 下記はあってもなくても動きます（ログインなどしないなら不要）
  authDomain:        'luana-b337b.firebaseapp.com',
  storageBucket:     'luana-b337b.firebasestorage.app',
})

const messaging = firebase.messaging()
messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(
    payload.notification.title,
    { body: payload.notification.body }
  )
})
