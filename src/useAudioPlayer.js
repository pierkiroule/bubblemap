import { useState, useEffect } from 'react';
import { Howl } from 'howler';

export function useAudioPlayer() {
  const [player, setPlayer] = useState(null);

  const play = (url, options = {}) => {
    if (player) {
      player.stop();
    }
    const newPlayer = new Howl({
      src: [url],
      loop: options.loop || false,
      volume: options.volume ?? 1,
    });
    newPlayer.play();
    setPlayer(newPlayer);
  };

  const stop = () => {
    if (player) {
      player.stop();
      setPlayer(null);
    }
  };

  const setVolume = (volume) => {
    if (player) {
      player.volume(volume);
    }
  };

  useEffect(() => {
    return () => {
      if (player) {
        player.stop();
      }
    };
  }, [player]);

  return { play, stop, setVolume };
}