import React, { useRef, useState } from 'react';

export function MP({ url }) {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  if (!url) return null;

  const isAudio = url.match(/\.mp3$/i);
  const isVideo = url.match(/\.mp4$/i);
  const isImage = url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
  const isWeb = url.startsWith('http') && !isAudio && !isVideo && !isImage;

  const togglePlay = () => {
    const media = isAudio ? audioRef.current : videoRef.current;
    if (!media) return;
    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  };

  const setMediaVolume = (v) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (videoRef.current) videoRef.current.volume = v;
  };

  return (
    <div style={{ marginTop: 8 }}>
      {isAudio && (
        <div>
          <audio ref={audioRef} src={url} preload="metadata" />
          <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
        </div>
      )}

      {isVideo && (
        <div>
          <video ref={videoRef} src={url} width="240" preload="metadata" />
          <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
        </div>
      )}

      {(isAudio || isVideo) && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setMediaVolume(Number(e.target.value))}
        />
      )}

      {isImage && (
        <img src={url} alt="bulle media" style={{ maxWidth: '100%', maxHeight: 200 }} />
      )}

      {isWeb && (
        <div>
          <iframe
            src={url}
            title="web view"
            style={{ width: '100%', height: '200px', border: '1px solid #ccc' }}
          ></iframe>
        </div>
      )}
    </div>
  );
}


