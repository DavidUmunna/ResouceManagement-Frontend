import axios from "axios";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCjULbOigrJFF2uwArhCLlcIINE_aVhJc8",
  authDomain: "haldenerp.firebaseapp.com",
  projectId: "haldenerp",
  storageBucket: "haldenerp.firebasestorage.app",
  messagingSenderId: "72908353994",
  appId: "1:72908353994:web:28b1f92f4e49112a7a5f33"
};

const app = initializeApp(firebaseConfig);

export let messaging = null;

// Register service worker once at app start
export async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service worker registered');
    messaging = getMessaging(app);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    throw error;
  }
}

export async function EnableNotifications() {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
     
      if (!messaging) {
        messaging = getMessaging(app);
      }

      const registration = await navigator.serviceWorker.getRegistration();

      const currentToken = await getToken(messaging, {
        vapidKey: "BLb5LA3GmmC9uRCzoYT4t6bapOPqv2-3_Bcch8pCNfK4W49Ylyz1kZ1noALOhns6904Vu7Ma5ZAzN09vOhFJCL0",
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        const API_URL = process.env.REACT_APP_API_URL;
        console.log("Token:", currentToken);
        await axios.post(`${API_URL}/save-token`, { currentToken }, { withCredentials: true });
        return currentToken;
      } else {
        console.log("No registration token available.");
        return null;
      }
    } else {
      console.log("Permission not granted.");
      return null;
    }
  } catch (error) {
    console.error("Error enabling notifications:", error);
    
  }
}