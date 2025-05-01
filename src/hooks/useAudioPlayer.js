import { useRef, useState, useEffect } from 'react';

export default function useAudioPlayer() {
  const audioRef = useRef(null);
  const [playingUrl, setPlayingUrl] = useState(null);

  const play = (url, { loop = true, volume = 1.0 } = {}) => {
    stop();
    const audio = new Audio(url);
    audio.loop = loop;
    audio.volume = volume;
    audio.play().catch((e) => console.warn('Audio play error:', e));
    audioRef.current = audio;
    setPlayingUrl(url);
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingUrl(null);
    }
  };

  const setVolume = (volume) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return { play, stop, setVolume, playingUrl };
}