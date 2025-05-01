// src/components/BulleEditor.js
import React, { useState, useEffect } from 'react';
import { update, remove } from 'firebase/database';
import { ref } from 'firebase/database';  // Importer la référence depuis firebaseClient

const BulleEditor = ({
  bulle,
  onUpdateTitre,
  onUpdateColor,
  onUpdateRadius,
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
  onCloseEditor,
  sessionId,
}) => {
  const [titre, setTitre] = useState(bulle.titre || '');
  const [color, setColor] = useState(bulle.color || '#ff0000');
  const [radius, setRadius] = useState(bulle.radius || 20);
  const [audioList, setAudioList] = useState(audios || {});
  const [selectedAudio, setSelectedAudio] = useState(selectedAudioUrl);

  // Update form fields when bulle props change
  useEffect(() => {
    setTitre(bulle.titre);
    setColor(bulle.color);
    setRadius(bulle.radius);
    setAudioList(bulle.audios || {});
  }, [bulle]);

  const handleTitreChange = (e) => {
    const newTitre = e.target.value;
    setTitre(newTitre);
    onUpdateTitre(newTitre);
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    onUpdateColor(newColor);
  };

  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value, 10);
    setRadius(newRadius);
    onUpdateRadius(newRadius);
  };

  const handleAudioSelect = (url) => {
    setSelectedAudio(url);
    onSelectAudio(url);
  };

  const handlePlayAudio = (url) => {
    onPlayAudio(url);
  };

  const handleStopAudio = () => {
    onStopAudio();
  };

  const handleVolumeChange = (key, e) => {
    const newVolume = e.target.value;
    onUpdateVolume(key, newVolume);
  };

  const handleToggleAudioActive = (key) => {
    onToggleAudioActive(key, audioList[key].active);
  };

  const handleRemoveAudio = (key) => {
    onRemoveAudio(key);
  };

  const handleDeleteBulle = () => {
    onDeleteBulle();
    onCloseEditor(); // Close the editor after deleting
  };

  return (
    <div className="bulle-editor">
      <h3>Édition de la Bulle</h3>
      <div>
        <label>Titre</label>
        <input type="text" value={titre} onChange={handleTitreChange} />
      </div>

      <div>
        <label>Couleur</label>
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
        />
      </div>

      <div>
        <label>Rayon</label>
        <input
          type="number"
          value={radius}
          onChange={handleRadiusChange}
          min="1"
        />
      </div>

      <div>
        <h4>Audios associés</h4>
        {Object.entries(audioList).map(([key, audio]) => (
          <div key={key}>
            <span>{audio.name}</span>
            <button onClick={() => handlePlayAudio(audio.url)}>Jouer</button>
            <button onClick={() => handleStopAudio()}>Arrêter</button>
            <button onClick={() => handleToggleAudioActive(key)}>
              {audio.active ? 'Désactiver' : 'Activer'}
            </button>
            <input
              type="range"
              value={audio.volume}
              onChange={(e) => handleVolumeChange(key, e)}
              min="0"
              max="1"
              step="0.1"
            />
            <button onClick={() => handleRemoveAudio(key)}>Supprimer</button>
          </div>
        ))}

        <select onChange={(e) => handleAudioSelect(e.target.value)} value={selectedAudio}>
          <option value="">Sélectionner un audio</option>
          {playlist.map((audioUrl, index) => (
            <option key={index} value={audioUrl}>
              {audioUrl.split('/').pop()}
            </option>
          ))}
        </select>
        <button onClick={onAssociateAudio}>Associer Audio</button>
      </div>

      <div>
        <button onClick={handleDeleteBulle}>Supprimer la bulle</button>
        <button onClick={onCloseEditor}>Fermer l'éditeur</button>
      </div>
    </div>
  );
};

export { BulleEditor };