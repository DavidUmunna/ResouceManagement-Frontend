importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js');


firebase.initializeApp({
   apiKey: "AIzaSyCjULbOigrJFF2uwArhCLlcIINE_aVhJc8",
  authDomain: "haldenerp.firebaseapp.com",
  projectId: "haldenerp",
  storageBucket: "haldenerp.firebasestorage.app",
  messagingSenderId: "72908353994",
  appId: "1:72908353994:web:28b1f92f4e49112a7a5f33"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
   
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
