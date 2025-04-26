// src/MiniAudioTest.js
import { useState, useRef } from 'react';

export default function MiniAudioTest() {
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Mini Audio Test</h3>
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
      <div style={{ marginTop: 10 }}>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause} style={{ marginLeft: 10 }}>Pause</button>
      </div>
      <div style={{ marginTop: 10 }}>
        Volume :
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          style={{ marginLeft: 10, width: 200 }}
        />
      </div>
    </div>
  );
}