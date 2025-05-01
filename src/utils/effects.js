// src/utils/effects.js

// Créer mini bulles pétillantes quand on crée une bulle
export function createParticles(latlng) {
  const container = document.getElementById('map');
  if (!container) return;

  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'petit-bulle';

    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 1) * 100;

    particle.style.left = `${window.innerWidth / 2}px`;
    particle.style.top = `${window.innerHeight / 2}px`;
    particle.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0.5)`;

    container.appendChild(particle);

    setTimeout(() => {
      container.removeChild(particle);
    }, 1000);
  }
}

// Ajouter un effet "pop" au marker
export function animatePop(marker) {
  const el = marker.getElement();
  if (el) {
    el.classList.add('bubble-pop');
    setTimeout(() => {
      el.classList.remove('bubble-pop');
    }, 600); // après 600ms on enlève la classe
  }
}