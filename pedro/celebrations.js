// ============================================================
// CELEBRATIONS - Confetti animation system
// ============================================================

/**
 * Triggers a confetti celebration animation
 * Creates colorful confetti pieces that fall with randomized velocity
 * Colors adapt to the current theme
 */
function triggerConfetti() {
  const settings = getSettings();
  if (!settings.confettiEnabled) return;

  const container = document.body;

  // Get current theme colors - use CSS variables for theme-aware colors
  const computedStyle = getComputedStyle(document.documentElement);
  const colors = [
    computedStyle.getPropertyValue('--accent-orange').trim(),
    computedStyle.getPropertyValue('--accent-green').trim(),
    computedStyle.getPropertyValue('--accent-pink').trim(),
    computedStyle.getPropertyValue('--accent-yellow').trim()
  ];

  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    // Random color from theme palette
    const color = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.backgroundColor = color;

    // Random horizontal start position
    const startX = Math.random() * window.innerWidth;
    confetti.style.left = startX + 'px';
    confetti.style.top = '-10px';

    // Random size (8-20px)
    const size = 8 + Math.random() * 12;
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';

    // Random rotation
    const rotation = Math.random() * 360;
    confetti.style.setProperty('--rotation', rotation + 'deg');

    // Random animation duration (2-4 seconds)
    const duration = 2 + Math.random() * 2;
    confetti.style.setProperty('--duration', duration + 's');

    // Random horizontal drift (-1 to 1 second offset)
    const drift = (Math.random() - 0.5) * 2;
    confetti.style.setProperty('--drift', drift + 's');

    container.appendChild(confetti);

    // Remove confetti after animation completes
    setTimeout(() => {
      confetti.remove();
    }, duration * 1000);
  }
}

/**
 * Trigger confetti on task completion
 * Called when a task is marked as done
 */
function celebrateTaskCompletion() {
  const settings = getSettings();
  if (settings.celebrationsEnabled && settings.confettiEnabled) {
    triggerConfetti();
  }
}

// ============================================================
// PEDRO WALK ANIMATION - Emoji walking across screen
// ============================================================

/**
 * Triggers Pedro (raccoon emoji) walking animation across screen
 * Creates a walking animation that moves the emoji from left to right
 * Uses CSS animation for smooth, performant movement
 */
function triggerPedroWalk() {
  const settings = getSettings();
  if (!settings.celebrationsEnabled) return;

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.className = 'pedro-walk-overlay';

  // Create Pedro element with emoji
  const pedro = document.createElement('div');
  pedro.className = 'pedro-walker';
  pedro.textContent = '🦝';

  overlay.appendChild(pedro);
  document.body.appendChild(overlay);

  // Remove overlay after animation completes (3.5 seconds)
  setTimeout(() => {
    overlay.remove();
  }, 3500);
}

// ============================================================
// WEB AUDIO API - Sound effects
// ============================================================

/**
 * Global audio context for Web Audio API
 * Lazy-initialized on first use to respect user interaction requirements
 */
let audioContext = null;

/**
 * Get or create the Web Audio API context
 * Creates context on first call, reuses on subsequent calls
 * @returns {AudioContext} The audio context for sound synthesis
 */
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a sound effect using the Web Audio API
 * Provides centralized sound playback with volume control
 *
 * @param {string} soundType - Type of sound to play ('chime', 'fanfare', 'pop', 'coins', 'woohoo')
 * @param {number} volume - Volume level (0-100, default 70)
 */
function playSound(soundType, volume = 70) {
  const settings = getSettings();
  if (!settings.soundsEnabled) return;

  // Normalize volume (0-100) to gain (0-1)
  const normalizedVolume = Math.max(0, Math.min(100, volume)) / 100;

  try {
    const ctx = getAudioContext();

    // Resume context if suspended (required by browser autoplay policies)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Route to appropriate sound function
    switch (soundType) {
      case 'chime':
        playChime(ctx, normalizedVolume);
        break;
      case 'fanfare':
        playFanfare(ctx, normalizedVolume);
        break;
      case 'pop':
        playPop(ctx, normalizedVolume);
        break;
      case 'coins':
        playCoins(ctx, normalizedVolume);
        break;
      case 'woohoo':
        playWoohoo(ctx, normalizedVolume);
        break;
      default:
        console.warn(`Unknown sound type: ${soundType}`);
    }
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Play a clear, bell-like chime sound
 * Suitable for notifications and alerts
 *
 * @param {AudioContext} ctx - The audio context
 * @param {number} volume - Normalized volume (0-1)
 */
function playChime(ctx, volume) {
  const now = ctx.currentTime;
  const duration = 0.5;

  // Main chime frequency
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);

  // Add a harmony note
  const osc2 = ctx.createOscillator();
  osc2.frequency.setValueAtTime(1200, now);
  osc2.frequency.exponentialRampToValueAtTime(900, now + duration);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(volume * 0.15, now);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + duration);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(now);
  osc2.stop(now + duration);
}

/**
 * Play an uplifting fanfare sound
 * Suitable for task completions and celebrations
 *
 * @param {AudioContext} ctx - The audio context
 * @param {number} volume - Normalized volume (0-1)
 */
function playFanfare(ctx, volume) {
  const now = ctx.currentTime;
  const notes = [
    { freq: 523.25, time: 0 },      // C5
    { freq: 659.25, time: 0.15 },   // E5
    { freq: 783.99, time: 0.3 }     // G5
  ];

  notes.forEach((note, index) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = note.freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.25, now + note.time);
    gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + note.time);
    osc.stop(now + note.time + 0.25);
  });
}

/**
 * Play a quick, percussive pop sound
 * Suitable for UI interactions and button clicks
 *
 * @param {AudioContext} ctx - The audio context
 * @param {number} volume - Normalized volume (0-1)
 */
function playPop(ctx, volume) {
  const now = ctx.currentTime;
  const duration = 0.1;

  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

/**
 * Play a coin-drop sound effect
 * Suitable for rewards, points, and positive feedback
 *
 * @param {AudioContext} ctx - The audio context
 * @param {number} volume - Normalized volume (0-1)
 */
function playCoins(ctx, volume) {
  const now = ctx.currentTime;

  // Multiple quick tones for coin effect
  const coinNotes = [
    { freq: 800, time: 0 },
    { freq: 1000, time: 0.08 },
    { freq: 1200, time: 0.16 }
  ];

  coinNotes.forEach((note) => {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(note.freq, now + note.time);
    osc.frequency.exponentialRampToValueAtTime(note.freq * 0.7, now + note.time + 0.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.25, now + note.time);
    gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + note.time);
    osc.stop(now + note.time + 0.1);
  });
}

/**
 * Play an enthusiastic "woohoo" cheer sound
 * Suitable for major celebrations and achievements
 *
 * @param {AudioContext} ctx - The audio context
 * @param {number} volume - Normalized volume (0-1)
 */
function playWoohoo(ctx, volume) {
  const now = ctx.currentTime;
  const duration = 0.6;

  // Ascending sweep sound
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + duration * 0.6);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);

  // Add a secondary harmonic
  const osc2 = ctx.createOscillator();
  osc2.frequency.setValueAtTime(300, now + 0.1);
  osc2.frequency.exponentialRampToValueAtTime(800, now + 0.1 + duration * 0.5);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(volume * 0.2, now + 0.1);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + duration);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(now + 0.1);
  osc2.stop(now + duration);
}
