# 🧠 BRAIN.md — TEAM-ARCHADE Memory

> **Purpose**: Persistent memory for the TEAM-ARCHADE project.
> **Updated**: 2026-10-23
> **Agent**: Remember to check and update this file at the start of every session.

---

## 📌 Core Identity

| Key | Value |
|-----|-------|
| **Team Name** | TEAM-ARCHADE |
| **GitHub Repo** | https://github.com/DebasmitaKarmakar/TEAM-ARCHADE |
| **Local Path** | `E:\NFSU_Guwahati\TEAM-ARCHADE` |
| **Context** | NFSU Guwahati — Vibe Coding Competition |
| **Push Policy** | ⚠️ Push to GitHub ONLY when user explicitly asks |
| **Repo Owner** | DebasmitaKarmakar |

---

## 🏗️ Project Status

### Current State
- **Phase**: Initial Setup ✅
- **Git**: Initialized with remote `origin` → `https://github.com/DebasmitaKarmakar/TEAM-ARCHADE.git`
- **Skill**: `vibe-coding-competition` — installed at `.agents/skills/vibe-coding-competition/`
- **Rules**: Project rules + Competition rules installed at `.agents/rules/`
- **Templates**: Base CSS, HTML, JS templates in skill `resources/`
- **Active Project**: None yet — awaiting competition theme/prompt

### What's Built
- [x] Git repo initialized
- [x] Remote origin configured
- [x] Skill: `vibe-coding-competition` (full competition workflow)
- [x] Base CSS template (design tokens, glassmorphism, animations, responsive)
- [x] Base HTML template (hero, features, demo, about sections)
- [x] Base JS template (scroll reveal, store, API helper, particles, typewriter)
- [x] Page-specific CSS styles (nav, hero glow, feature cards, demo container)
- [x] Project rules (code style, design, git, competition)
- [x] Competition rules (priorities, time allocation)
- [x] This brain.md

### What's NOT Built Yet
- [ ] Actual competition project (waiting for theme)
- [ ] Deployment configuration
- [ ] Team member details
- [ ] Competition submission

---

## 🎨 Design System Defaults

```
Theme: Royal Purple (dark mode)
Primary Accent: #6c5ce7
Secondary Accent: #a29bfe
Background: #0a0a0f
Heading Font: Outfit
Body Font: Inter
Code Font: JetBrains Mono
```

### Alternative Palettes Available
- **Cyberpunk Neon**: `#00f5d4` / `#f72585` / `#0d0221`
- **Sunset Warmth**: `#ff6b6b` / `#feca57` / `#1a1a2e`
- **Ocean Depth**: `#0984e3` / `#00cec9` / `#0c0c1d`
- **Aurora Borealis**: `#a8e6cf` / `#dcedc1` / `#0a1628`

---

## 📂 Project Structure

```
E:\NFSU_Guwahati\TEAM-ARCHADE\
├── .git/                          # Git repository
├── .agents/                       # Antigravity customizations
│   ├── skills/
│   │   └── vibe-coding-competition/
│   │       ├── SKILL.md           # Master competition skill
│   │       └── resources/
│   │           ├── base-template.css   # Design system + utilities
│   │           ├── base-template.html  # Starter page template
│   │           ├── base-template.js    # JS utilities library
│   │           └── page-styles.css     # Page-specific styles
│   └── rules/
│       ├── project-rules.md       # Code style & git conventions
│       └── competition-rules.md   # Competition-specific priorities
├── brain.md                       # THIS FILE — persistent memory
└── README.md                      # Project readme
```

---

## 🔑 Key Decisions Made

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-23 | Dark mode default | Higher visual impact for competitions |
| 2026-10-23 | No framework default for <2h | Faster setup, no build step overhead |
| 2026-10-23 | Push only on explicit request | Prevent accidental pushes to team repo |
| 2026-10-23 | Design tokens first approach | Forces consistent visual language |

---

## 📝 Session Log

### Session 1 — 2026-10-23 15:43 IST
- **Request**: Set up skill for vibe coding competition
- **Actions**: 
  - Initialized git repo with remote origin
  - Created comprehensive `vibe-coding-competition` skill
  - Built 4 resource templates (CSS, HTML, JS, page styles)
  - Established project rules and competition rules
  - Created brain.md for persistent memory
- **Status**: ✅ Complete — ready for competition

---

## 💡 Ideas & Notes

*Add competition ideas, learnings, and strategies here as sessions progress.*

- Glassmorphism + gradient text = instant "wow" factor
- Judges spend ~30 seconds on first impression — hero section is CRITICAL
- Sound design is underrated — even a subtle click sound elevates perceived quality
- Always have a fallback for API data (localStorage cache or mock data)

---

## 🚨 Known Issues / Gotchas

*Track bugs, edge cases, and things to remember here.*

- `backdrop-filter: blur()` doesn't work in Firefox without `layout.css.backdrop-filter.enabled` flag
- CSS `@import` for Google Fonts can slow initial paint — consider `<link>` in HTML instead
- Vercel free tier has 100 deployments/day limit

---

## 🤖 Agent Instructions

When starting a new session with this project:
1. **Read this brain.md first** to recall context
2. **Check session log** for what was done previously
3. **Load the vibe-coding-competition skill** if working on competition tasks
4. **Update this file** at the end of every session with what was done
5. **Never push to GitHub** unless the user explicitly says to push

---

*Last updated: 2026-10-23T15:43:05+05:30*
