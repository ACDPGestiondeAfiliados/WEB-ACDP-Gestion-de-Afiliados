// ===============================
// ACDP - FIREBASE MESSAGING SW
// ===============================

importScripts(
"https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js"
);

importScripts(
"https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js"
);

firebase.initializeApp({

apiKey:"AIzaSyBuXoGjEGxmGXuvrWSGbJW_-i8NDydJX38",

authDomain:"acdp-afiliados.firebaseapp.com",

projectId:"acdp-afiliados",

storageBucket:"acdp-afiliados.firebasestorage.app",

messagingSenderId:"67829346831",

appId:"1:67829346831:web:2abdb4c55b504b752ce97a"

});

const messaging =
firebase.messaging();

messaging.onBackgroundMessage(payload=>{

const titulo=
payload.notification?.title
||
"ACDP";

const opciones={

body:
payload.notification?.body
||
"",

icon:
"./iconos/notif.png",

badge:
"./iconos/notif.png"

};

self.registration.showNotification(
titulo,
opciones
);

});

self.addEventListener(
"notificationclick",
event=>{

event.notification.close();

event.waitUntil(

clients.openWindow(
"/"
)

);

});
