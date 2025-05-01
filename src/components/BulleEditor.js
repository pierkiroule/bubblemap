import React, { useState, useEffect } from 'react';

function BulleEditor({ bubble, onSave, onClose, onDelete, onToggleVisibility }) {
  const [name, setName] = useState(bubble.name || '');
  const [audioUrl, setAudioUrl] = useState(bubble.audioUrl || '');
  const [visible, setVisible] = useState(!!bubble.visibleParticipant);

  // Réinitialise les champs du formulaire si on édite une autre bulle
  useEffect(() => {
    setName(bubble.name || '');
    setAudioUrl(bubble.audioUrl || '');
    setVisible(!!bubble.visibleParticipant);
  }, [bubble]);

  const handleToggleVisible = () => {
    const newVisible = !visible;
    setVisible(newVisible);
    onToggleVisibility(bubble.id, newVisible);  // met à jour la visibilité dans Firebase immédiatement
  };

  const handleSaveClick = () => {
    // Rassemble les modifications dans un objet et déclenche le callback de sauvegarde
    onSave({ ...bubble, name, audioUrl, visibleParticipant: visible });
  };

  return (
    <div className="BulleEditor">
      <h3>Éditer la bulle</h3>
      <div>
        <label>Nom : </label>
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
      </div>
      <div>
        <label>URL audio : </label>
        <input 
          type="text" 
          value={audioUrl} 
          onChange={e => setAudioUrl(e.target.value)} 
          placeholder="Lien ou fichier audio" 
        />
      </div>
      <div>
        <label>Visibilité participants : </label>
        <button onClick={handleToggleVisible}>
          {visible ? 'Cacher aux participants' : 'Montrer aux participants'}
        </button>
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleSaveClick}>Enregistrer</button>
        <button onClick={onClose} style={{ marginLeft: '5px' }}>Annuler</button>
        <button 
          onClick={() => { 
            if (window.confirm('Supprimer cette bulle ?')) onDelete(bubble.id); 
          }} 
          style={{ marginLeft: '5px', color: 'red' }}
        >
          Supprimer
        </button>
      </div>
      <p style={{ fontSize: '0.9em', color: '#555', marginTop: '10px' }}>
        Position : lat {bubble.lat.toFixed(5)}, lng {bubble.lng.toFixed(5)}
      </p>
    </div>
  );
}

export default BulleEditor;