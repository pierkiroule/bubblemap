// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Config complète Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCvgmsjktJZEbvaR6J2KBCyoxhvxC1H7ow",
  authDomain: "bubblesound-f11ba.firebaseapp.com",
  databaseURL: "https://bubblesound-f11ba-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bubblesound-f11ba",
  storageBucket: "bubblesound-f11ba.appspot.com", // corrigé ici ton URL storage
  messagingSenderId: "965642225607",
  appId: "1:965642225607:web:f7dfa1cf4d7235664bfbe2"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter la base de données
export const db = getDatabase(app);