import { useState, useEffect } from 'react';

export function BulleEditor({
  bulle,
  onUpdateTitre,
  onUpdateColor,
  onUpdateRadius,
  showLabels,
  onToggleLabels,
  audios,
  onToggleAudioActive,
  onUpdateVolume,
  onPlayAudio,
  onStopAudio,
  onRemoveAudio,
  playlist,
  selectedAudioUrl,
  onSelectAudio,
  onAssociateAudio,
  onDeleteBulle,
  onDeleteAllBulles,
  onCloseEditor
}) {
  const [titre, setTitre] = useState(bulle.titre || '');
  const [color, setColor] = useState(bulle.color || '#ff0000');
  const [radius, setRadius] = useState(bulle.radius || 20);

  useEffect(() => {
    setTitre(bulle.titre || '');
    setColor(bulle.color || '#ff0000');
    setRadius(bulle.radius || 20);
  }, [bulle]);

  const handleSave = () => {
    onUpdateTitre(titre);
    onUpdateColor(color);
    onUpdateRadius(radius);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 2000,
      background: 'rgba(255, 255, 255, 0.7)',
      padding: '10px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      width: '300px'
    }}>
      <h4>Éditer la bulle</h4>

      <label>Titre :</label>
      <input
        value={titre}
        onChange={e => setTitre(e.target.value)}
        style={{ width: '100%' }}
      />

      <label>Couleur :</label>
      <input
        type="color"
        value={color}
        onChange={e => setColor(e.target.value)}
        style={{ width: '100%' }}
      />

      <label>Rayon :</label>
      <input
        type="range"
        min="5"
        max="100"
        value={radius}
        onChange={(e) => {
          const newRadius = Number(e.target.value);
          setRadius(newRadius);
          onUpdateRadius(newRadius); // mise à jour en live
        }}
        style={{ width: '100%' }}
      />

      <button onClick={handleSave} style={{ marginTop: '10px' }}>Sauver</button>

      <hr />

      <button onClick={onToggleLabels} style={{ marginTop: '10px' }}>
        {showLabels ? 'Cacher titres' : 'Montrer titres'}
      </button>

      <hr />

      <h5>Audios associés</h5>
      {audios && Object.entries(audios).map(([key, audio]) => (
        <div key={key} style={{ marginBottom: '5px' }}>
          <strong>{audio.name || 'Audio'}</strong>
          <div>
            <label>Volume :</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={audio.volume ?? 1}
              onChange={(e) => onUpdateVolume(key, parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
            <button onClick={() => onToggleAudioActive(key, audio.active)}>
              {audio.active ? 'Désactiver' : 'Activer'}
            </button>
            <button onClick={() => {
              onStopAudio();
              onPlayAudio(audio.url);
            }}>
              Jouer
            </button>
            <button onClick={onStopAudio}>
              Stop
            </button>
            <button onClick={() => onRemoveAudio(key)}>
              Supprimer
            </button>
          </div>
        </div>
      ))}

      <hr />

      <h5>Ajouter un audio</h5>
      <select
        value={selectedAudioUrl}
        onChange={(e) => onSelectAudio(e.target.value)}
        style={{ width: '100%' }}
      >
        {playlist.map(url => (
          <option key={url} value={url}>{url.split('/').pop()}</option>
        ))}
      </select>
      <button onClick={onAssociateAudio} style={{ marginTop: '5px' }}>Associer</button>

      <hr />

      <button onClick={onDeleteBulle} style={{ color: 'red' }}>Supprimer cette bulle</button>
      <button onClick={onDeleteAllBulles} style={{ color: 'red', marginTop: '5px' }}>Supprimer toutes les bulles</button>

      <hr />

      <button onClick={onCloseEditor}>Fermer</button>
    </div>
  );
}