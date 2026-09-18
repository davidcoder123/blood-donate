import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCtMYGrCI1lDwNJnLF0cWOL-1yzIGf3ozo",
  authDomain: "notification-for-blooddonate.firebaseapp.com",
  projectId: "notification-for-blooddonate",
  storageBucket: "notification-for-blooddonate.firebasestorage.app",
  messagingSenderId: "549971964399",
  appId: "1:549971964399:web:8b98869d6df793ef75861a",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BBTDQMd1XkvEz9eWMvm31RA_N_qIxPYLdwbMXqCCYenlwrjUMnWvi3LkAFPxBqnGHR6Sc-UuYu9XG5puNZt5r8s", // Generated from Firebase Console -> Cloud Messaging
      });
      return token;
    }
  } catch (error) {
    console.error("Error obtaining FCM token:", error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
