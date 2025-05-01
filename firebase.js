import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCvgmsjktJZEbvaR6J2KBCyoxhvxC1H7ow",
  authDomain: "bubblesound-f11ba.firebaseapp.com",
  databaseURL: "https://bubblesound-f11ba-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bubblesound-f11ba",
  storageBucket: "bubblesound-f11ba.appspot.com",
  messagingSenderId: "965642225607",
  appId: "1:965642225607:web:f7dfa1cf4d7235664bfbe2"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);