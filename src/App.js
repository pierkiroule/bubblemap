import { useEffect, useState } from 'react';
import AppDJF from './AppDJF';
import AppParticipant from './AppParticipant';
import { database } from './firebaseClient';
import { ref, onValue, set } from 'firebase/database';

export default function App() {
  const [pseudo, setPseudo] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [availableSessions, setAvailableSessions] = useState([]);
  const [validated, setValidated] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  useEffect(() => {
    const sessionsRef = ref(database, 'bulles');
    return onValue(sessionsRef, (snap) => {
      const data = snap.val();
      setAvailableSessions(data ? Object.keys(data) : []);
    });
  }, []);

  const handleCreateSession = () => {
    const trimmedName = newSessionName.trim();
    if (!trimmedName) return;
    if (availableSessions.includes(trimmedName)) {
      alert('Session déjà existante');
      return;
    }
    set(ref(database, `bulles/${trimmedName}`), {}); // Créer une session vide
    setAvailableSessions((prev) => [...prev, trimmedName]);
    setSessionId(trimmedName);
    setNewSessionName('');
  };

  if (validated) {
    const isDJ = pseudo.toLowerCase() === 'dj';
    return isDJ ? <AppDJF sessionId={sessionId} /> : <AppParticipant sessionId={sessionId} />;
  }

  return (
    <div style={styles.container}>
      <h2>Bienvenue dans DJ Bulle</h2>
      <input
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
        placeholder="Entrez votre pseudo"
        style={styles.input}
      />
      <select
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        style={styles.select}
      >
        <option value="">Sélectionnez une session</option>
        {availableSessions.map((sid) => (
          <option key={sid} value={sid}>{sid}</option>
        ))}
      </select>

      <div style={{ marginTop: 20, width: '80%' }}>
        <input
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          placeholder="Créer une nouvelle session"
          style={styles.input}
        />
        <button
          onClick={handleCreateSession}
          style={{ ...styles.button, backgroundColor: '#28a745' }}
          disabled={!newSessionName.trim()}
        >
          Créer une session
        </button>
      </div>

      <button
        disabled={!pseudo || !sessionId}
        onClick={() => setValidated(true)}
        style={styles.button}
      >
        Entrer
      </button>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9'
  },
  input: {
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    width: '100%',
    borderRadius: 6,
    border: '1px solid #ccc'
  },
  select: {
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    width: '100%',
    borderRadius: 6,
    border: '1px solid #ccc'
  },
  button: {
    padding: 10,
    fontSize: 18,
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    width: '50%',
    marginTop: 10
  }
};