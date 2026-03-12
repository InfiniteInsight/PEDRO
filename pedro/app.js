// ============================================================
// PERSONALITIES (see personalities.js)
// ============================================================

// ============================================================
// STATE
// ============================================================
let state = {
  tasks: [],
  personality: null,
  personalityDate: null
};

function saveState() {
  try {
    localStorage.setItem('pedro-state', JSON.stringify(state));
  } catch(e) { /* quota exceeded or unavailable */ }
}

function loadState() {
  try {
    const saved = localStorage.getItem('pedro-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.tasks = parsed.tasks || [];
      state.personality = parsed.personality || null;
      state.personalityDate = parsed.personalityDate || null;
    }
  } catch(e) { /* corrupted or unavailable */ }
}

// ============================================================
// TASK MANAGEMENT
// ============================================================
function addTask(text, photoDataUrl) {
  if (!text && !photoDataUrl) return;
  const task = {
    id: Date.now() + Math.random(),
    text: text || '(photo task)',
    done: false,
    createdAt: new Date().toISOString(),
    photo: photoDataUrl || null
  };
  state.tasks.unshift(task);
  saveState();
  renderTasks();

  if (state.personality) {
    const msgs = state.personality.encourage;
    showToast(`${state.personality.emoji} ${msgs[Math.floor(Math.random() * msgs.length)]}`);
  }
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveState();
  renderTasks();

  if (task.done && state.personality) {
    const msgs = state.personality.praise;
    showToast(`${state.personality.emoji} ${msgs[Math.floor(Math.random() * msgs.length)]}`);
  }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveState();
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = state.tasks.map(t => `
    <div class="task-item ${t.done ? 'done' : ''}" data-id="${t.id}">
      <button class="task-check" onclick="toggleTask(${t.id})">${t.done ? '✓' : ''}</button>
      <div class="task-content">
        <div class="task-text">${escapeHtml(t.text)}</div>
        ${t.photo ? `<img class="task-photo" src="${t.photo}" alt="Task photo">` : ''}
        <div class="task-time">${formatTime(t.createdAt)}</div>
      </div>
      <button class="task-delete" onclick="deleteTask(${t.id})">✕</button>
    </div>
  `).join('');
}

function addTaskFromInput() {
  const input = document.getElementById('task-text-input');
  const text = input.value.trim();
  if (!text && !pendingPhoto) return;
  addTask(text, pendingPhoto);
  input.value = '';
  pendingPhoto = null;
}

// ============================================================
// VOICE INPUT
// ============================================================
let recognition = null;
let isListening = false;

function toggleVoice() {
  if (!voiceConsented) {
    showToast('🎤 Voice input is disabled — check privacy settings');
    return;
  }
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('🎤 Voice input not supported in this browser');
    return;
  }

  if (isListening) {
    recognition.stop();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  const btn = document.getElementById('voice-btn');

  recognition.onstart = () => {
    isListening = true;
    btn.classList.add('listening');
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    document.getElementById('task-text-input').value = text;
  };

  recognition.onend = () => {
    isListening = false;
    btn.classList.remove('listening');
  };

  recognition.onerror = () => {
    isListening = false;
    btn.classList.remove('listening');
    showToast('🎤 Couldn\'t hear you, try again!');
  };

  recognition.start();
}

// ============================================================
// PHOTO INPUT
// ============================================================
let pendingPhoto = null;

function handlePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = () => {
    const maxSize = 400;
    let w = img.width, h = img.height;
    if (w > h) { if (w > maxSize) { h = h * maxSize / w; w = maxSize; } }
    else { if (h > maxSize) { w = w * maxSize / h; h = maxSize; } }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    pendingPhoto = canvas.toDataURL('image/jpeg', 0.7);
    const input = document.getElementById('task-text-input');
    if (!input.value.trim()) input.placeholder = '📷 Photo ready! Add a note or tap +';
    showToast('📷 Photo attached! Add text or tap + to save.');
  };

  img.src = URL.createObjectURL(file);
  event.target.value = '';
}

// ============================================================
// PERSONALITY ROLLER
// ============================================================
function openRoller() {
  document.getElementById('roller-modal').classList.add('active');
}

function closeRoller() {
  document.getElementById('roller-modal').classList.remove('active');
}

function spinRoller() {
  const btn = document.getElementById('spin-btn');
  btn.disabled = true;

  const emojiEl = document.getElementById('roller-emoji');
  const nameEl = document.getElementById('roller-name');
  const greetEl = document.getElementById('roller-greeting');

  let count = 0;
  const totalSpins = 25;
  let delay = 60;

  function spin() {
    const p = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    emojiEl.textContent = p.emoji;
    nameEl.textContent = p.name;
    greetEl.textContent = '';
    emojiEl.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg)`;

    count++;
    if (count < totalSpins) {
      delay += 15;
      setTimeout(spin, delay);
    } else {
      // Final selection
      const final = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
      emojiEl.textContent = final.emoji;
      emojiEl.style.transform = 'rotate(0deg) scale(1.2)';
      nameEl.textContent = final.name;
      greetEl.textContent = `"${final.greeting}"`;

      state.personality = final;
      state.personalityDate = new Date().toISOString().slice(0, 10);
      saveState();
      updatePersonalityBanner();

      setTimeout(() => {
        emojiEl.style.transform = 'rotate(0deg) scale(1)';
        btn.disabled = false;
      }, 500);
    }
  }

  spin();
}

function updatePersonalityBanner() {
  const p = state.personality;
  if (p) {
    document.getElementById('current-emoji').textContent = p.emoji;
    document.getElementById('current-name').textContent = p.name;
    document.getElementById('current-quote').textContent = `"${p.greeting}"`;
  }
}

// ============================================================
// UTILITIES
// ============================================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================================
// PRIVACY & CONSENT
// ============================================================
let voiceConsented = false;

function checkConsent() {
  try {
    const consent = localStorage.getItem('pedro-privacy-accepted');
    if (!consent) {
      document.getElementById('privacy-modal').classList.add('active');
      return false;
    }
    voiceConsented = localStorage.getItem('pedro-voice-consent') === 'true';
    return true;
  } catch(e) {
    return true; // if localStorage fails, just let them use the app
  }
}

function acceptPrivacy() {
  const voiceToggle = document.getElementById('voice-consent-toggle');
  voiceConsented = voiceToggle.checked;

  try {
    localStorage.setItem('pedro-privacy-accepted', new Date().toISOString());
    localStorage.setItem('pedro-voice-consent', voiceConsented.toString());
  } catch(e) { /* storage unavailable */ }

  document.getElementById('privacy-modal').classList.remove('active');
  updateVoiceButton();
}

function showFullPrivacy() {
  alert(
    "PEDRO PRIVACY POLICY\n" +
    "Last updated: 2026-03-11\n\n" +
    "DATA STORAGE\n" +
    "All task data, photos, and preferences are stored exclusively in your browser's localStorage. " +
    "No data is transmitted to Pedro's developers or any third-party servers (except voice input, detailed below). " +
    "Clearing your browser data will permanently delete all Pedro data.\n\n" +
    "VOICE INPUT\n" +
    "If enabled, voice input uses the Web Speech API built into your browser. " +
    "Audio is transmitted to and processed by:\n" +
    "• Google (Chrome, Edge, Samsung Internet)\n" +
    "• Apple (Safari)\n" +
    "Pedro does not control, store, or have access to your audio recordings. " +
    "Audio processing is governed by the respective company's privacy policy. " +
    "You can disable voice input at any time in the app.\n\n" +
    "PHOTO INPUT\n" +
    "Photos are resized to a maximum of 400px and stored as JPEG data URLs in localStorage. " +
    "Photos never leave your device.\n\n" +
    "ANALYTICS & TRACKING\n" +
    "Pedro uses no analytics, cookies, tracking pixels, or third-party scripts.\n\n" +
    "CHILDREN\n" +
    "Pedro does not knowingly collect data from children. All data remains on-device.\n\n" +
    "CONTACT\n" +
    "For privacy questions, reach out to the project maintainers."
  );
}

function updateVoiceButton() {
  const btn = document.getElementById('voice-btn');
  const speechSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

  if (!speechSupported || !voiceConsented) {
    btn.style.display = 'none';
  } else {
    btn.style.display = 'flex';
  }
}

// ============================================================
// INIT
// ============================================================
document.getElementById('task-text-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTaskFromInput();
});

loadState();
renderTasks();
updatePersonalityBanner();
checkConsent();
updateVoiceButton();

// Check if personality is from a different day
if (state.personality && state.personalityDate !== new Date().toISOString().slice(0, 10)) {
  showToast('🎲 New day! Roll for a new advisor!');
}

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
