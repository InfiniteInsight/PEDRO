# Pedro - Personal Executive Dysfunction Relief Operator
## Open Specification & Roadmap

---

### Overview
Pedro is a Progressive Web App designed to help people with executive dysfunction manage tasks through a fun, low-friction interface. Named after the Pedro raccoon meme, it uses humor and personality to lower the barrier to task engagement.

### Core Philosophy
- **Zero friction**: Getting a task in should take < 3 seconds
- **Dopamine-friendly**: Personality system, animations, and praise make completing tasks feel rewarding
- **Offline-first**: Works without internet after first load
- **No accounts**: localStorage only, no signup barriers

---

## Current Status: MVP Complete (v0.1)

### What's Built
- [x] PWA shell (manifest, service worker, installable)
- [x] Text task input with Enter key support
- [x] Voice input via Web Speech API (Chrome/Edge/Safari)
- [x] Photo input with camera capture and canvas resize
- [x] 18 curated AI personalities with unique encouragement/praise
- [x] Slot machine personality roller with animation
- [x] Task completion with checkmarks and praise toasts
- [x] localStorage persistence
- [x] Mobile-first responsive design
- [x] Offline caching via service worker
- [x] Daily personality rotation nudge

---

## Roadmap

### Phase 1: Polish & UX (v0.2)
- [ ] Swipe-to-delete on mobile (touch gesture support)
- [ ] Task reordering (drag and drop)
- [ ] Task categories/tags (color-coded)
- [ ] Due dates and time reminders (Notification API)
- [ ] Haptic feedback on mobile (Vibration API)
- [ ] Sound effects toggle (task complete chime, roller sound)
- [ ] Dark/light theme toggle
- [ ] Better raccoon icon (proper Pedro meme-style artwork)
- [ ] Splash screen for PWA install

### Phase 2: Executive Function Features (v0.3)
- [ ] Task breakdown - split big tasks into subtasks
- [ ] "Just start for 2 minutes" timer (Pomodoro-lite)
- [ ] Energy level selector (low/medium/high) to filter task difficulty
- [ ] "Quick wins" mode - surfaces easy tasks when motivation is low
- [ ] Daily focus: pick 3 priority tasks for the day
- [ ] Streak counter (days with at least 1 task completed)
- [ ] Weekly summary view

### Phase 3: AI Integration (v0.4)
- [ ] Connect to Claude API for dynamic personality responses
- [ ] AI task breakdown suggestions (paste a big task, get subtasks)
- [ ] Photo-to-task: OCR/AI reads a photo and extracts tasks
- [ ] Voice-to-structured-task: AI parses voice input into task + due date
- [ ] Personalized encouragement based on task history

### Phase 4: Social & Sync (v0.5)
- [ ] Cloud sync (optional account, encrypted)
- [ ] Share your personality of the day
- [ ] Accountability buddy system
- [ ] Export tasks to calendar (ICS)
- [ ] Import from other task apps

---

## Technical Spec

### Architecture
```
pedro/
  index.html        # Single-file app (HTML + CSS + JS)
  sw.js             # Service worker for offline caching
  manifest.json     # PWA manifest
  icons/
    pedro-192.png   # App icon 192x192
    pedro-512.png   # App icon 512x512
```

### Data Model
```javascript
// App State (stored in localStorage as 'pedro-state')
{
  tasks: [
    {
      id: Number,           // timestamp + random
      text: String,         // task description
      done: Boolean,        // completion status
      createdAt: String,    // ISO date
      photo: String|null    // data URL of resized photo
    }
  ],
  personality: {
    name: String,
    emoji: String,
    greeting: String,
    encourage: String[],
    praise: String[]
  } | null,
  personalityDate: String   // "YYYY-MM-DD"
}
```

### Browser Support
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core app | ✅ | ✅ | ✅ | ✅ |
| Voice input | ✅ | ❌ | ✅ | ✅ |
| PWA install | ✅ | ❌ | ✅* | ✅ |
| Camera capture | ✅ | ✅ | ✅ | ✅ |

*Safari: Add to Home Screen only

### Performance Targets
- First paint: < 1s
- Interactive: < 2s
- Lighthouse PWA score: 90+
- localStorage usage: < 2MB typical

### Personality System
18 personalities with 5 encouragement + 5 praise messages each = 180 unique messages. Each personality has:
- Name, emoji, greeting
- Encouragement messages (shown when adding tasks)
- Praise messages (shown when completing tasks)
- Daily rotation with manual re-roll option

### Input Methods
1. **Text**: Standard input field, Enter to submit
2. **Voice**: Web Speech API, result populates text field
3. **Photo**: File input with `capture` attribute, resized to 400px via canvas, stored as JPEG data URL

---

## Design Tokens
```css
--bg-dark:        #1a0a2e   /* Main background */
--bg-card:        #2a1a4e   /* Card surfaces */
--bg-input:       #3a2a5e   /* Input fields */
--accent-orange:  #ff6b35   /* Primary action */
--accent-green:   #4ecdc4   /* Success/complete */
--accent-pink:    #ff6b9d   /* Delete/voice */
--accent-yellow:  #ffe66d   /* Personality/highlight */
--text-primary:   #f0e6ff   /* Main text */
--text-secondary: #b8a9d4   /* Secondary text */
--text-muted:     #7a6b9a   /* Muted/timestamps */
```

---

## Known Limitations
1. localStorage cap (~5MB) limits photo storage to ~50-100 photos
2. Voice input unavailable in Firefox
3. No data sync between devices
4. Personality messages are static (no generative AI yet)
5. No undo for task deletion
