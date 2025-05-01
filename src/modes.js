export const MODES = {
  blind: {
    name: 'Blind Exploration',
    bubblesVisible: false,
    detectableOnly: true,
    timer: false,
  },
  timer: {
    name: 'Timer Quest',
    bubblesVisible: true,
    detectableOnly: false,
    timer: true,
  }
};

export function getModeSettings(modeKey) {
  return MODES[modeKey] || MODES.blind;
}