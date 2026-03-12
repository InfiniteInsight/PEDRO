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
