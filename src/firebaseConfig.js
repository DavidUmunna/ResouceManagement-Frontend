import axios from "axios";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCjULbOigrJFF2uwArhCLlcIINE_aVhJc8",
  authDomain: "haldenerp.firebaseapp.com",
  projectId: "haldenerp",
  storageBucket: "haldenerp.firebasestorage.app",
  messagingSenderId: "72908353994",
  appId: "1:72908353994:web:28b1f92f4e49112a7a5f33"
};

const app = initializeApp(firebaseConfig);
const rawApiUrl = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");
const VAPID_KEY = "BLb5LA3GmmC9uRCzoYT4t6bapOPqv2-3_Bcch8pCNfK4W49Ylyz1kZ1noALOhns6904Vu7Ma5ZAzN09vOhFJCL0";

export let messaging = null;

// Register service worker once at app start
export async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    messaging = getMessaging(app);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    throw error;
  }
}

export async function EnableNotifications() {
  try {
    if (!rawApiUrl) {
      throw new Error("REACT_APP_API_URL is not configured.");
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
     
      if (!messaging) {
        messaging = getMessaging(app);
      }

      let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (!registration) {
        registration = await registerServiceWorker();
      }

      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        console.log("Token:", currentToken);
        await axios.post(`${rawApiUrl}/api/save-token`, { currentToken }, { withCredentials: true });
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
    return null;
  }
}

// Silently refresh + persist the FCM token on app load — ONLY if the user has
// already granted notification permission (no prompt). FCM tokens rotate and
// expire; this keeps each logged-in user's saved token live instead of relying
// on the one-time manual "Enable Notifications" click.
export async function ensureFreshToken() {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return null;
    if (!rawApiUrl) return null;

    if (!messaging) messaging = getMessaging(app);

    let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!registration) registration = await registerServiceWorker();

    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      await axios.post(`${rawApiUrl}/api/save-token`, { currentToken }, { withCredentials: true });
    }
    return currentToken || null;
  } catch (error) {
    console.error("ensureFreshToken failed:", error);
    return null;
  }
}

export function subscribeToForegroundMessages(callback) {
  if (!messaging) {
    messaging = getMessaging(app);
  }

  return onMessage(messaging, (payload) => {
    if (typeof callback === "function") {
      callback(payload);
      return;
    }

    // Data-only messages carry title/body in `data`
    const title = payload?.data?.title || payload?.notification?.title || "New notification";
    const body = payload?.data?.body || payload?.notification?.body || "You have a new update.";

    if (Notification.permission === "granted") {
      navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js').then((registration) => {
        if (registration) {
          registration.showNotification(title, { body, data: payload?.data || {} });
        }
      });
    }
  });
}