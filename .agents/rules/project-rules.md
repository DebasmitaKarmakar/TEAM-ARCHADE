# TEAM-ARCHADE — Project Rules

## Code Style
- Use 2-space indentation for HTML, CSS, JS
- Use `const` by default, `let` only when mutation is needed, NEVER `var`
- All CSS colors must use CSS custom properties (design tokens), never raw hex in components
- Every interactive element must have a unique `id` attribute
- Semantic HTML always — `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`

## Design Standards
- Dark mode by default
- Font stack: Outfit (headings), Inter (body), JetBrains Mono (code)
- Minimum touch target: 44x44px
- All animations must respect `prefers-reduced-motion`
- No plain white (#fff) text — use `--text-primary` (#f0f0f5) for softer contrast

## Git Conventions
- Branch naming: `feat/<feature-name>`, `fix/<bug-name>`, `polish/<what>`
- Commit messages: `type: description` (feat, fix, polish, docs, refactor)
- Push only when explicitly asked

## Competition Rules
- Never leave `console.log` in production code
- Always have a working README.md
- Test on mobile viewport before submission
- Deploy to a live URL before final submission

## Repository
- **Main Repo**: https://github.com/DebasmitaKarmakar/TEAM-ARCHADE
- **Push Policy**: Push ONLY when the user explicitly requests it
