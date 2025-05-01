// utils/cleanup.mjs
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, remove } from 'firebase/database';
import { firebaseConfig } from '../firebase.js'; // Attention : .js obligatoire

// Initialise Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Supprime toutes les bulles d'une session
async function cleanupSession(sessionId) {
  const bubblesRef = ref(db, `sessions/${sessionId}/bubbles`);
  try {
    await remove(bubblesRef);
    console.log(`Session "${sessionId}" nettoyée.`);
  } catch (error) {
    console.error('Erreur lors du nettoyage :', error);
  }
}

// Exemple : à adapter
const sessionId = process.argv[2];
if (!sessionId) {
  console.error('Veuillez fournir un sessionId en argument.');
  process.exit(1);
}

cleanupSession(sessionId);