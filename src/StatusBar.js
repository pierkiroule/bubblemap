// src/components/StatusBar.js
export function StatusBar({ dbConnected, sessionId, onLoadPlaylist }) {
  return (
    <div style={{
      position: 'fixed',
      top: 8,
      right: 8,
      zIndex: 999,
      textAlign: 'right'
    }}>
      <div style={{
        backgroundColor: dbConnected ? 'green' : 'red',
        color: 'white',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12,
        marginBottom: 4
      }}>
        {dbConnected ? 'Base connectée' : 'Hors ligne'}
      </div>

      <div style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12
      }}>
        Session : <strong>{sessionId}</strong>
      </div>

      <input
        type="file"
        accept=".txt"
        onChange={onLoadPlaylist}
        style={{ marginTop: 8 }}
      />
    </div>
  );
}