// ===============================
// FIREBASE ACDP MODULAR
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



const firebaseConfig = {

apiKey: "AIzaSyBuXoGjEGxmGXuvrWSGbJW_-i8NDydJX38",

authDomain:
"acdp-afiliados.firebaseapp.com",

projectId:
"acdp-afiliados",

storageBucket:
"acdp-afiliados.firebasestorage.app",

messagingSenderId:
"67829346831",

appId:
"1:67829346831:web:2abdb4c55b504b752ce97a"

};



const app =
initializeApp(firebaseConfig);



const dbFirebase =
getFirestore(app);



window.dbFirebase = dbFirebase;
