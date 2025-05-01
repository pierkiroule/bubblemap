// src/AB.js
import React from 'react';

function AB() {
  const bulles = Array.from({ length: 15 });

  return (
    <div style={containerStyle}>
      {bulles.map((_, index) => (
        <div
          key={index}
          style={{
            ...bubbleStyle,
            left: `${Math.random() * 100}%`,
            animationDuration: `${5 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 5}s`,
            width: `${10 + Math.random() * 20}px`,
            height: `${10 + Math.random() * 20}px`,
            backgroundColor: randomColor(), // Option deluxe légère
          }}
        />
      ))}
    </div>
  );
}

// Génère des couleurs pastel légères
function randomColor() {
  const colors = [
    'rgba(0, 170, 255, 0.3)',
    'rgba(255, 153, 204, 0.3)',
    'rgba(153, 255, 204, 0.3)',
    'rgba(255, 255, 153, 0.3)'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const containerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: 1,
};

const bubbleStyle = {
  position: 'absolute',
  bottom: '-30px',
  borderRadius: '50%',
  animationName: 'floatUp',
  animationTimingFunction: 'ease-in-out',
  animationIterationCount: 'infinite',
};

export default AB;