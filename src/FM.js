// src/FM.js
import React, { useState } from 'react';

function FM({ bulleData, onClose, onUpdate, onDelete }) {
  const [newRadius, setNewRadius] = useState(bulleData.radius || 30);

  const handleRadiusChange = (e) => {
    const value = Number(e.target.value);
    setNewRadius(value);
    onUpdate('radius', value);
  };

  return (
    <div style={styles.menu}>
      <h3 style={styles.title}>{bulleData.titre}</h3>

      <button style={styles.button} onClick={() => onUpdate('title')}>
        Modifier Titre
      </button>

      <button style={styles.button} onClick={() => onUpdate('color')}>
        Modifier Couleur
      </button>

      <div style={{ marginTop: 20 }}>
        <label>Rayon :</label>
        <input 
          type="range" 
          min="10" 
          max="200" 
          value={newRadius} 
          onChange={handleRadiusChange}
          style={{ width: '100%' }}
        />
        <div>{newRadius} mètres</div>
      </div>

      <button style={{ ...styles.button, backgroundColor: '#ff6666' }} onClick={onDelete}>
        Supprimer
      </button>

      <button style={styles.closeButton} onClick={onClose}>
        Fermer
      </button>
    </div>
  );
}

const styles = {
  menu: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    zIndex: 2000,
    width: 250,
    textAlign: 'center',
  },
  title: {
    marginBottom: 10,
  },
  button: {
    margin: '10px 0',
    padding: '10px 15px',
    border: 'none',
    borderRadius: 8,
    backgroundColor: '#00aaff',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
  },
  closeButton: {
    marginTop: 10,
    padding: '8px 12px',
    backgroundColor: '#888',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    width: '100%',
  }
};

export default FM;