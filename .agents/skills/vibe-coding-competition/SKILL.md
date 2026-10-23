---
name: vibe-coding-competition
description: >-
  Master skill for TEAM-ARCHADE's vibe coding competition workflow. Activate
  this skill when: building competition projects, rapid-prototyping web apps,
  creating visually stunning demos, optimizing for judging criteria (aesthetics,
  innovation, technical depth, UX), scaffolding new competition ideas, or
  preparing submissions. Covers end-to-end: ideation → architecture → build →
  polish → demo → submission.
---

# 🏆 Vibe Coding Competition — Master Skill

> **Team**: TEAM-ARCHADE
> **Repo**: `https://github.com/DebasmitaKarmakar/TEAM-ARCHADE`
> **Philosophy**: Build things that feel *alive* — not just functional, but
> emotionally resonant. "Vibe" = aesthetics + interactivity + soul.

---

## 🧠 Core Philosophy: What "Vibe Coding" Really Means

Vibe coding is NOT about writing the most lines of code. It's about:

1. **Emotional Impact** — Does the app make someone *feel* something in the
   first 3 seconds?
2. **Polish Over Features** — 1 feature done beautifully > 10 features done
   poorly.
3. **Storytelling Through Code** — Every interaction tells a micro-story.
4. **Technical Elegance** — Clean architecture that enables rapid iteration.
5. **Demo-ability** — If you can't demo it in 60 seconds, you've over-scoped.

---

## 📋 Competition Workflow (End-to-End)

### Phase 1: Ideation (15 min max)

1. **Identify the theme/prompt** — Parse it literally AND metaphorically.
2. **Brainstorm 3 concepts** — Rate each on:
   - Visual "wow" factor (1-5)
   - Technical feasibility in time limit (1-5)
   - Innovation/uniqueness (1-5)
   - Demo clarity (1-5)
3. **Pick the highest scorer** — Bias toward visual impact if scores are close.
4. **Write a one-liner pitch** — "It's [known thing] but [twist]."

### Phase 2: Architecture & Scaffolding (10 min)

1. **Choose the stack** based on time available:

   | Time Available | Recommended Stack |
   |----------------|-------------------|
   | < 1 hour       | Single HTML + CSS + JS file (no build tools) |
   | 1-3 hours      | Vite + Vanilla JS or Vite + React |
   | 3-6 hours      | Next.js or Vite + React + backend API |
   | 6+ hours       | Full-stack (Next.js / Vite + Supabase / Firebase) |

2. **Scaffold with this structure**:
   ```
   project-root/
   ├── index.html          # Entry point
   ├── style.css           # Design system + all styles
   ├── main.js             # Core logic
   ├── assets/             # Images, fonts, sounds
   ├── components/         # Reusable UI components (if framework)
   ├── utils/              # Helper functions
   └── README.md           # Project description for judges
   ```

3. **Establish design tokens FIRST** (in CSS):
   ```css
   :root {
     /* Color Palette — curated, not default */
     --bg-primary: #0a0a0f;
     --bg-secondary: #12121a;
     --bg-glass: rgba(255, 255, 255, 0.05);
     --text-primary: #f0f0f5;
     --text-secondary: #8888aa;
     --accent-primary: #6c5ce7;
     --accent-secondary: #a29bfe;
     --accent-glow: rgba(108, 92, 231, 0.4);
     --gradient-hero: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #74b9ff 100%);
     --gradient-card: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);

     /* Typography */
     --font-display: 'Outfit', sans-serif;
     --font-body: 'Inter', sans-serif;
     --font-mono: 'JetBrains Mono', monospace;

     /* Spacing Scale */
     --space-xs: 0.25rem;
     --space-sm: 0.5rem;
     --space-md: 1rem;
     --space-lg: 2rem;
     --space-xl: 4rem;
     --space-2xl: 8rem;

     /* Border Radius */
     --radius-sm: 8px;
     --radius-md: 16px;
     --radius-lg: 24px;
     --radius-full: 9999px;

     /* Shadows & Glows */
     --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.3);
     --shadow-glow: 0 0 20px var(--accent-glow), 0 0 60px var(--accent-glow);

     /* Transitions */
     --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
     --transition-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);
     --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
   }
   ```

### Phase 3: Build Core Experience (60-70% of time)

**Priority Order** (DO NOT deviate):
1. **Hero/Landing Section** — This is what judges see FIRST.
2. **Core Interaction** — The ONE thing your app does.
3. **Visual Feedback** — Animations on every user action.
4. **Data Flow** — Connect real data if applicable.

**Mandatory Visual Patterns**:
- Glassmorphism cards with `backdrop-filter: blur(12px)`
- Gradient text on headings: `background-clip: text; -webkit-text-fill-color: transparent`
- Micro-animations on hover (scale + glow)
- Smooth page transitions / section reveals
- Particle effects or ambient motion for background
- Custom cursor or scroll-triggered animations (if time permits)

**Code Quality Rules**:
- Every function has a single, clear responsibility
- No magic numbers — use CSS variables and JS constants
- Event handlers are debounced/throttled where appropriate
- Error states are beautiful, not just functional
- Loading states use skeleton screens, not spinners

### Phase 4: Polish & Differentiation (20% of time)

1. **Sound Design** (optional but HIGH impact):
   - Subtle UI click sounds
   - Ambient background music (low volume)
   - Achievement/success jingles
2. **Accessibility Quick-Wins**:
   - Focus visible outlines
   - Alt text on images
   - Keyboard navigation for core flow
   - `prefers-reduced-motion` media query
3. **Easter Eggs** — Hide something delightful (Konami code, secret animation)
4. **Responsive Check** — Test on mobile viewport (judges often check this)
5. **Performance** — Lazy load images, minimize DOM reflows

### Phase 5: README & Submission (10% of time)

1. **README.md must include**:
   ```markdown
   # 🚀 [Project Name]

   > [One-liner pitch]

   ## ✨ What It Does
   [2-3 sentences max]

   ## 🛠️ Tech Stack
   - [List technologies]

   ## 🎯 Key Features
   - Feature 1
   - Feature 2
   - Feature 3

   ## 🏗️ How to Run
   [Steps to run locally]

   ## 👥 Team — ARCHADE
   - [Members]

   ## 📸 Screenshots
   [Embed screenshots or GIF demo]
   ```

2. **Final checks**:
   - [ ] App runs without errors from a clean clone
   - [ ] No console.log statements left
   - [ ] README is complete
   - [ ] Screenshots/GIF in README
   - [ ] Git history is clean (squash messy commits)

---

## 🎨 Design System Quick-Reference

### Color Palettes (Pre-curated, swap as needed)

**Cyberpunk Neon**:
```css
--accent-primary: #00f5d4; --accent-secondary: #f72585; --bg-primary: #0d0221;
```

**Sunset Warmth**:
```css
--accent-primary: #ff6b6b; --accent-secondary: #feca57; --bg-primary: #1a1a2e;
```

**Ocean Depth**:
```css
--accent-primary: #0984e3; --accent-secondary: #00cec9; --bg-primary: #0c0c1d;
```

**Aurora Borealis**:
```css
--accent-primary: #a8e6cf; --accent-secondary: #dcedc1; --bg-primary: #0a1628;
```

**Royal Purple**:
```css
--accent-primary: #6c5ce7; --accent-secondary: #a29bfe; --bg-primary: #0a0a0f;
```

### Animation Recipes

```css
/* Fade-in on scroll */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Glow pulse */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px var(--accent-glow); }
  50% { box-shadow: 0 0 40px var(--accent-glow), 0 0 80px var(--accent-glow); }
}

/* Float */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Gradient shift (for backgrounds) */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Typing cursor */
@keyframes blink {
  0%, 50% { border-color: transparent; }
  51%, 100% { border-color: var(--accent-primary); }
}
```

### Component Patterns

```css
/* Glass Card */
.glass-card {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-smooth), box-shadow var(--transition-smooth);
}
.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-glow);
}

/* Gradient Button */
.btn-gradient {
  background: var(--gradient-hero);
  border: none;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-full);
  color: white;
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-spring), box-shadow var(--transition-smooth);
}
.btn-gradient:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow);
}

/* Gradient Text */
.gradient-text {
  background: var(--gradient-hero);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 🏗️ Architecture Patterns for Speed

### Pattern 1: Single-Page App (No Framework)
Best for < 2 hour competitions. One HTML file, one CSS file, one JS file.
Use `data-*` attributes for routing sections.

### Pattern 2: Component-Based Vanilla JS
```javascript
// utils/component.js — Minimal component system
function createComponent(template, container, data = {}) {
  const el = document.createElement('div');
  el.innerHTML = typeof template === 'function' ? template(data) : template;
  container.appendChild(el.firstElementChild);
  return el.firstElementChild;
}
```

### Pattern 3: State Management (Vanilla)
```javascript
// utils/store.js — Reactive store in 20 lines
function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();
  return {
    getState: () => ({ ...state }),
    setState(update) {
      state = { ...state, ...(typeof update === 'function' ? update(state) : update) };
      listeners.forEach(fn => fn(state));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
}
```

---

## 🚀 Rapid API Integration Patterns

### Free APIs (No Auth Required)

| API | Use Case | Base URL |
|-----|----------|----------|
| JSONPlaceholder | Mock REST data | `https://jsonplaceholder.typicode.com` |
| Open Trivia DB | Quiz questions | `https://opentdb.com/api.php` |
| PokeAPI | Pokemon data | `https://pokeapi.co/api/v2` |
| RandomUser | Fake user profiles | `https://randomuser.me/api` |
| Quotable | Random quotes | `https://api.quotable.io` |
| REST Countries | Country info | `https://restcountries.com/v3.1` |
| Open Meteo | Weather data | `https://api.open-meteo.com/v1` |
| NASA APOD | Astronomy images | `https://api.nasa.gov` |
| Dog CEO | Dog images | `https://dog.ceo/api` |

### Fetch Wrapper
```javascript
async function api(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`API Error [${url}]:`, err);
    return null;
  }
}
```

---

## 🧪 Judging Criteria Optimization

Typically, vibe coding competitions evaluate:

| Criteria | Weight | How to Win |
|----------|--------|------------|
| **Visual Design** | 30% | Dark mode, gradients, glassmorphism, typography, color harmony |
| **Innovation** | 25% | Unique concept, creative use of APIs, unexpected interactions |
| **Technical Execution** | 20% | Clean code, good architecture, no bugs, performance |
| **User Experience** | 15% | Intuitive flow, smooth animations, responsive, accessible |
| **Completeness** | 10% | Working demo, README, deployable, screenshots |

**Key Insight**: Visual Design + Innovation = 55% of scoring.
Spend your time accordingly.

---

## ⚡ Emergency Recipes

### "I Have 30 Minutes Left"
1. Remove any broken feature immediately
2. Add a stunning gradient background
3. Add hover animations to all buttons/cards
4. Write the README
5. Take screenshots
6. Deploy (Vercel/Netlify one-click)

### "The API Broke"
1. Cache the last successful response in localStorage
2. Create a mock data file with 5-10 realistic entries
3. Switch to local data seamlessly

### "It Looks Generic"
1. Change font to Outfit or Space Grotesk (Google Fonts)
2. Replace solid backgrounds with gradients
3. Add `backdrop-filter: blur()` to cards
4. Add a subtle animated background (CSS particles or gradient shift)
5. Increase spacing — crowded UIs look amateur

---

## 📦 Deployment Quick Commands

```bash
# Vercel (instant)
npx -y vercel --yes

# Netlify
npx -y netlify-cli deploy --prod --dir=.

# GitHub Pages
git subtree push --prefix dist origin gh-pages

# Simple static (no build step)
# Just push to GitHub and enable Pages on main branch
```

---

## 🔧 Git Workflow for Competitions

```bash
# Start
git init
git remote add origin <REPO_URL>

# During development — commit often
git add -A && git commit -m "feat: <what you just built>"

# Before submission — clean up
git add -A && git commit -m "polish: final touches"
git push origin main

# Emergency — force push (competition only!)
git push origin main --force
```

---

## 📎 Pre-Flight Checklist

Before every competition, verify:
- [ ] Node.js installed and working
- [ ] Git configured (name + email)
- [ ] VS Code / IDE ready with extensions
- [ ] Browser DevTools familiar
- [ ] Google Fonts bookmarked
- [ ] Color palette tools bookmarked (coolors.co, colorhunt.co)
- [ ] Free API list bookmarked
- [ ] Deployment account ready (Vercel/Netlify)
- [ ] Team communication channel open
- [ ] This skill is loaded and ready

---

*Remember: In vibe coding, the vibe IS the product. Ship something beautiful.*
