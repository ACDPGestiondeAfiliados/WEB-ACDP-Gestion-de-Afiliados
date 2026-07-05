// ===============================
// FIREBASE ACDP - v13.8.0 MODULAR
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
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

// ===============================
// CONFIG
// ===============================

const firebaseConfig = {
    apiKey: "AIzaSyBuXoGjEGxmGXuvrWSGbJW_-i8NDydJX38",
    authDomain: "acdp-afiliados.firebaseapp.com",
    projectId: "acdp-afiliados",
    storageBucket: "acdp-afiliados.firebasestorage.app",
    messagingSenderId: "67829346831",
    appId: "1:67829346831:web:2abdb4c55b504b752ce97a"
};

// ===============================
// INIT
// ===============================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// EXPORTS
// ===============================

export {
    db,
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

window.db = db;
window.firebaseApp = app;
