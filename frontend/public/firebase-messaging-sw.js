importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCtMYGrCI1lDwNJnLF0cWOL-1yzIGf3ozo",
  authDomain: "notification-for-blooddonate.firebaseapp.com",
  projectId: "notification-for-blooddonate",
  storageBucket: "notification-for-blooddonate.firebasestorage.app",
  messagingSenderId: "549971964399",
  appId: "1:549971964399:web:8b98869d6df793ef75861a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
