import confetti from 'canvas-confetti';

// African-themed confetti colors
const AFRICAN_COLORS = [
  '#FFD700', // Gold
  '#FF6B35', // Orange Red
  '#F7931E', // Orange
  '#228B22', // Forest Green
  '#DC143C', // Crimson
  '#FF4500', // Orange Red
  '#32CD32', // Lime Green
  '#FF1493', // Deep Pink
];

export const celebrateLogin = () => {
  // Multiple bursts for login celebration
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { 
    startVelocity: 30, 
    spread: 360, 
    ticks: 60, 
    zIndex: 0,
    colors: AFRICAN_COLORS
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Left side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    
    // Right side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
};

export const celebrateSignup = () => {
  // Massive celebration for new user registration
  const duration = 5000;
  const animationEnd = Date.now() + duration;
  
  const colors = AFRICAN_COLORS;
  
  const frame = () => {
    // Continuous rain effect
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: colors
    });
    
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: colors
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };
  
  frame();
  
  // Initial big burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors
  });
  
  // Additional fireworks
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
  }, 1000);
  
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });
  }, 1500);
};

export const celebrateSuccess = () => {
  // General success celebration
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: AFRICAN_COLORS
  });
};