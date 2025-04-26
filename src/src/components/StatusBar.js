// src/components/StatusBar.js
import React from 'react';

export function StatusBar({ 
  dbConnected, 
  sessionId, 
  djPosition, 
  bulles = [], 
  audioPlayer, 
  onLoadPlaylist, 
  onCenterMap, 
  onStopAudio 
}) {
  return (
    <div style={{
      position: 'fixed',
      top: 8,
      right: 8,
      zIndex: 999,
      backgroundColor: '#fff',
      padding: 8,
      border: '1px solid #ccc',
      borderRadius: 6,
      fontSize: 12,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      minWidth: 200
    }}>
      <div style={{
        backgroundColor: dbConnected ? 'green' : 'red',
        color: 'white',
        padding: '4px 8px',
        borderRadius: 4,
        marginBottom: 6
      }}>
        {dbConnected ? 'Base connectée' : 'Hors ligne'}
      </div>

      <div style={{ marginBottom: 4 }}>
        Session : <strong>{sessionId}</strong>
      </div>

      <div style={{ marginBottom: 4 }}>
        Bulles : <strong>{bulles.length}</strong>
      </div>

      {djPosition && (
        <div style={{ marginBottom: 4 }}>
          Pos : {djPosition[0].toFixed(5)}, {djPosition[1].toFixed(5)}
        </div>
      )}

      <div style={{ marginBottom: 4 }}>
        Audio : <strong>{audioPlayer ? 'Lecture' : 'Muet'}</strong>
      </div>

      <button onClick={onCenterMap} style={{ marginBottom: 4 }}>
        Centrer sur moi
      </button>

      <button onClick={onStopAudio} style={{ marginBottom: 4 }}>
        Mute global
      </button>

      <input
        type="file"
        accept=".txt"
        onChange={onLoadPlaylist}
        style={{ marginTop: 6 }}
      />
    </div>
  );
}
