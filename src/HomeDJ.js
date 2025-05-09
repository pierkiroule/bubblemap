import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MODES } from './ModeManager';
import { setSessionMeta, useSessionMeta } from './Sync';

export default function HomeDJ() {
  const [sessionId, setSessionId] = useState('');
  const [mode, setMode] = useState('blind');
  const navigate = useNavigate();
  const meta = useSessionMeta(sessionId);

  const handleStart = () => {
    if (!sessionId.trim()) return;
    setSessionMeta(sessionId, { mode, plan: meta?.plan || 'free' });
    navigate(`/dj/${sessionId}`);
  };

  const handleTogglePlan = () => {
    const next = meta?.plan === 'pro' ? 'free' : 'pro';
    setSessionMeta(sessionId, { ...meta, plan: next });
  };

  const isProMode = mode !== 'blind' && (meta?.plan || 'free') === 'free';

  useEffect(() => {
    const container = document.getElementById('bubble-bg');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const size = Math.random() * 40 + 10;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.animationDuration = `${10 + Math.random() * 20}s`;
      bubble.style.backgroundColor = `rgba(0, ${100 + Math.random() * 100}, 255, ${0.2 + Math.random() * 0.4})`;
      container.appendChild(bubble);
    }
  }, []);

  return (
    <>
      <div className="bubble-background" id="bubble-bg"></div>

      <div style={{ padding: '2rem', fontFamily: 'sans-serif', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: '2.5rem', marginBottom: 0 }}>
          BubbleMap
        </h1>
        <p style={{ fontFamily: "'Quicksand', sans-serif", fontSize: '1.1rem', color: '#555' }}>
          Hello my DJ bubbles •°○
        </p>

        <h2>Créer ou rejoindre une session</h2>

        <input
          type="text"
          placeholder="Nom de session"
          value={sessionId}
          onChange={e => setSessionId(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem', width: '100%', maxWidth: 300 }}
        />

        <br /><br />

        <label>
          Mode :
          <select
            value={mode}
            onChange={e => setMode(e.target.value)}
            style={{ marginLeft: 8, padding: '0.4rem' }}
          >
            {Object.entries(MODES).map(([key, m]) => (
              <option key={key} value={key}>{m.name}</option>
            ))}
          </select>
        </label>

        {isProMode && (
          <div style={{
            marginTop: 8,
            fontSize: 12,
            color: 'orange',
            background: '#fff5e6',
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid #f0c080',
            maxWidth: 300
          }}>
            Ce mode est réservé au plan <strong>Pro</strong>. Basculer le plan ci-dessous pour tester.
          </div>
        )}

        <br /><br />

        <button
          onClick={handleStart}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}
        >
          Lancer session
        </button>

        {sessionId && (
          <button
            onClick={() =>
              navigate(mode === 'timer' ? `/p/${sessionId}` : `/p/${sessionId}?mode=${mode}`)
            }
            style={{
              marginTop: 12,
              padding: '4px 8px',
              fontSize: 12,
              background: '#f0f8ff',
              border: '1px solid #ccc',
              borderRadius: 4
            }}
          >
            Ouvrir en tant que participant ({MODES[mode].name})
          </button>
        )}

        {sessionId && meta && (
          <button
            onClick={handleTogglePlan}
            style={{
              marginTop: 12,
              marginLeft: 10,
              fontSize: 12,
              padding: '4px 8px',
              background: '#eee',
              border: '1px solid #ccc',
              borderRadius: 4
            }}
          >
            Plan actuel : <strong>{meta.plan}</strong> (cliquer pour basculer)
          </button>
        )}
      </div>
    </>
  );
}