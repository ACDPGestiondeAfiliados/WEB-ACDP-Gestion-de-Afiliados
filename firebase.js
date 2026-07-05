// ===============================
// FIREBASE ACDP - v11.0.2 MODULAR
// ===============================

import {
initializeApp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import {

getFirestore,
collection,
doc,
getDoc,
getDocs,
addDoc,
setDoc,
updateDoc,
deleteDoc,
query,
where,
orderBy,
onSnapshot

} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import {

getMessaging,
getToken,
onMessage

} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging.js";


// ===============================
// CONFIG
// ===============================

const firebaseConfig={

apiKey:"AIzaSyBuXoGjEGxmGXuvrWSGbJW_-i8NDydJX38",

authDomain:"acdp-afiliados.firebaseapp.com",

projectId:"acdp-afiliados",

storageBucket:"acdp-afiliados.firebasestorage.app",

messagingSenderId:"67829346831",

appId:"1:67829346831:web:2abdb4c55b504b752ce97a"

};


// ===============================
// INIT
// ===============================

const app=
initializeApp(firebaseConfig);

const db=
getFirestore(app);

const messaging=
getMessaging(app);

const VAPID_KEY=
"BFRTgtYSQ0HZYB5v6gRaZ_wyYqKN8j5qIU33aFNe5iActb94gnVXohvCvF11X2uoNgdlsFEB0TN1_blXLDU2vUs";


// ===============================
// EXPORTS
// ===============================

export{

db,

messaging,

VAPID_KEY,

getToken,

onMessage,

collection,

doc,

getDoc,

getDocs,

addDoc,

setDoc,

updateDoc,

deleteDoc,

query,

where,

orderBy,

onSnapshot

};


window.db=db;

window.firebaseApp=app;
