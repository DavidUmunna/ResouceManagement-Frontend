importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js');

firebase.initializeApp({
	apiKey: 'AIzaSyCjULbOigrJFF2uwArhCLlcIINE_aVhJc8',
	authDomain: 'haldenerp.firebaseapp.com',
	projectId: 'haldenerp',
	storageBucket: 'haldenerp.firebasestorage.app',
	messagingSenderId: '72908353994',
	appId: '1:72908353994:web:28b1f92f4e49112a7a5f33'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
	
	const orderId = payload?.data?.orderId;
	const targetPath = payload?.data?.url || (orderId ? `/admin/requestlist#order-${orderId}` : '/admin/requestlist');
	const notificationTitle = payload?.notification?.title || payload?.data?.title || 'New notification';
	const notificationOptions = {
		body: payload?.notification?.body || payload?.data?.body || 'You have a new update.',
		data: {
			url: targetPath,
			orderId: orderId || ''
		}
	};

	self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const notificationUrl = event.notification?.data?.url || '/admin/requestlist';
	const targetUrl = new URL(notificationUrl, self.location.origin).href;

	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
			for (const client of windowClients) {
				if (client.url.startsWith(self.location.origin)) {
					return client.focus().then(() => client.navigate(targetUrl));
				}
			}

			return clients.openWindow(targetUrl);
		})
	);
});
