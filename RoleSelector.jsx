import { useState, useEffect } from 'react';
import { database } from './firebaseClient';
import { ref, onValue, set } from 'firebase/database';

export default function RoleSelector({ onSessionSelected }) {
  const [role, setRole] = useState(null);
  const [sessions, setSessions] = useState([]);

  const handleDJ = () => {
    const djId = 'dj_' + Date.now(); // à personnaliser
    const sessionRef = ref(database, 'sessions/' + djId);
    set(sessionRef, { id: djId, createdAt: Date.now() });
    onSessionSelected({ role: 'dj', sessionId: djId });
  };

  const handleParticipant = () => {
    setRole('participant');
  };

  useEffect(() => {
    if (role === 'participant') {
      const sessionsRef = ref(database, 'sessions');
      onValue(sessionsRef, (snapshot) => {
        const data = snapshot.val();
        setSessions(data ? Object.values(data) : []);
      });
    }
  }, [role]);

  const handleJoin = (sessionId) => {
    onSessionSelected({ role: 'participant', sessionId });
  };

  return (
    <div style={{ padding: 20 }}>
      {!role && (
        <>
          <h2>Choisis ton rôle :</h2>
          <button onClick={handleDJ}>Je suis DJ</button>
          <button onClick={handleParticipant} style={{ marginLeft: 10 }}>Je suis Participant</button>
        </>
      )}

      {role === 'participant' && (
        <>
          <h3>Choisis une session DJ disponible :</h3>
          {sessions.length === 0 && <p>Aucune session disponible</p>}
          <ul>
            {sessions.map((s) => (
              <li key={s.id}>
                <button onClick={() => handleJoin(s.id)}>
                  Rejoindre session {s.id}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
