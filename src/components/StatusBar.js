import React from 'react';

const StatusBar = ({ dbConnected, sessionId, playlist }) => {
  return (
    <div id="status-bar">
      <div className="status-bar-content">
        <span>Status de la connexion : {dbConnected ? 'Connecté' : 'Déconnecté'}</span>
        <span>Session: {sessionId}</span>
        <span>Playliste: {playlist.length} items</span>
      </div>
    </div>
  );
};

export default StatusBar;