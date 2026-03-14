# Movie Discovery App — Project Rules

## Project Overview
A mobile-only movie discovery app. Users enter a natural language prompt, an LLM translates it into a TMDB `/discover` API query, and results are displayed as an animated carousel of movie cards.

## Tech Stack
- React + TypeScript + Vite
- Tailwind v4 (`@import "tailwindcss"`, `@theme {}` blocks)
- motion/react (Framer Motion) for all animations
- No additional libraries without explicit approval
- Use context7 to get latest docs

## Viewport
- **Mobile only.** Design and implement exclusively for mobile viewports. Do not add responsive breakpoints for tablet or desktop.

## Architecture

### Search Flow
1. User enters a natural language prompt
2. LLM translates prompt to a TMDB `/discover` query
3. Results are fetched from TMDB and displayed in the carousel

### Carousel
- Custom-built cover flow carousel component (no third-party carousel libraries)
- Displays up to 5 movies at a time: 1 center + 2 on each side
- Navigation: touch swipe gestures
- Built with motion/react for all transitions

## Animation Rules
- Use `motion/react` for all animations — no CSS keyframes or transitions for interactive/entrance animations
- Always respect `prefers-reduced-motion`: when the user prefers reduced motion, skip or minimze animations (use `useReducedMotion()` from motion/react)
- Prefer spring physics over duration-based easing for interactive elements

## CSS Rules
- Use Tailwind utility classes for layout and static styles
- Use inline React `style` props for 3D transform properties (`backfaceVisibility`, `transformStyle`, `transform`)
- Never use `filter` on ancestors of `transform-style: preserve-3d` elements — use `box-shadow` instead
- `transform-style: preserve-3d` must be set on every ancestor in a 3D transform chain

## Collaboration
- **Ask before guessing.** When a prompt is ambiguous — missing values, unclear intent, multiple valid interpretations — ask a clarifying question instead of assuming. Do not fill in unknowns with guesses.

## Code Style
- Biome for linting and formatting
- Functional components only
- Co-locate component styles with the component (no separate CSS files per component)
- Keep components small and focused — split when a component exceeds ~100 lines
