import React from 'react';

export function StatusBar({ dbConnected, sessionId, onLoadPlaylist }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      left: 10,
      zIndex: 1000,
      backgroundColor: 'white',
      padding: '8px 12px',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div>
        Session : <strong>{sessionId}</strong>
      </div>
      <div style={{ color: dbConnected ? 'green' : 'red' }}>
        {dbConnected ? 'Connecté' : 'Déconnecté'}
      </div>
      {onLoadPlaylist && (
        <label style={{ cursor: 'pointer', background: '#007bff', color: 'white', padding: '4px 8px', borderRadius: '6px' }}>
          Charger playlist
          <input
            type="file"
            accept=".txt"
            onChange={onLoadPlaylist}
            style={{ display: 'none' }}
          />
        </label>
      )}
    </div>
  );
}