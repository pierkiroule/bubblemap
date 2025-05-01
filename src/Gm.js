// src/Gm.js
import React, { useState } from 'react';
import { ref, set, remove } from 'firebase/database';
import { db } from './firebase'; // ATTENTION : importer correctement

export default function Gm({ sessionId, onClose }) {
  const [chasseActive, setChasseActive] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Démarrer le timer et l'envoyer vers Firebase
  const startTimer = () => {
    if (timerActive) return;
    setTimerActive(true);

    const gmRef = ref(db, `/gamemode/${sessionId}`);
    set(gmRef, { timer: timeLeft, chasseActive: chasseActive });

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          remove(gmRef); // Nettoyer Firebase à la fin
          setTimerActive(false);
          alert('⏳ Temps écoulé !');
          return 0;
        }
        set(gmRef, { timer: prev - 1, chasseActive: chasseActive });
        return prev - 1;
      });
    }, 1000);
  };

  // Activer ou désactiver mode Chasse
  const toggleChasse = () => {
    setChasseActive(!chasseActive);
    const gmRef = ref(db, `/gamemode/${sessionId}`);
    set(gmRef, { timer: timeLeft, chasseActive: !chasseActive });
  };

  // Reset du Game Mode
  const resetGame = () => {
    const gmRef = ref(db, `/gamemode/${sessionId}`);
    remove(gmRef);
    setChasseActive(false);
    setTimerActive(false);
    setScore(0);
    setTimeLeft(600);
    alert('🔄 Partie réinitialisée.');
  };

  // Format minutes:secondes
  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center' }}>⚙️ Game Mode</h2>
      <p><strong>Session :</strong> {sessionId}</p>

      <div style={sectionStyle}>
        <label>
          <input
            type="checkbox"
            checked={chasseActive}
            onChange={toggleChasse}
          /> Activer Chasse aux bulles
        </label>
      </div>

      <div style={sectionStyle}>
        <button onClick={startTimer} style={buttonStyle}>
          {timerActive ? '⏳ Timer en cours...' : '▶️ Démarrer Timer 10min'}
        </button>
        <div style={{ marginTop: 10 }}>
          Temps restant : <strong>{formatTime(timeLeft)}</strong>
        </div>
      </div>

      <div style={sectionStyle}>
        <button onClick={resetGame} style={{ ...buttonStyle, backgroundColor: '#dc3545', color: 'white' }}>
          🔄 Reset Partie
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button onClick={onClose} style={{ ...buttonStyle, backgroundColor: '#333', color: 'white' }}>
          ❌ Fermer
        </button>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  position: 'absolute',
  top: '10%',
  left: '10%',
  right: '10%',
  background: 'white',
  border: '2px solid black',
  borderRadius: '10px',
  padding: '20px',
  zIndex: 2000,
  boxShadow: '2px 2px 12px rgba(0,0,0,0.3)'
};

const sectionStyle = {
  marginTop: '20px',
  padding: '10px',
  borderTop: '1px solid #ddd'
};

const buttonStyle = {
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold'
};