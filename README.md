# NepHearts — React app

A dating app connecting verified Nepalis living abroad. Built with **Vite + React + React Router**.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173

Build for production:
```bash
npm run build
npm run preview
```

## Structure

```
src/
  main.jsx              — entry point, mounts <App> in <BrowserRouter>
  App.jsx                — route table
  components/
    Nav.jsx               — shared top nav (logo, links, Join CTA)
    Logo.jsx              — inline SVG brand mark
  pages/
    Landing.jsx           — marketing homepage (hero, problem, idea, how it works, trust, product, global, free, CTA)
    Signup.jsx            — 5-step onboarding wizard (name → city → ID/selfie verify → bio → done)
    Discover.jsx          — swipeable match deck with filters (age/distance/verified-only), undo, match modal
    Matches.jsx           — list of mutual matches
    Chat.jsx              — 1:1 messaging (reads ?name= from the URL)
    Profile.jsx           — account settings / trust & safety
  styles/
    colors_and_type.css   — design tokens (CSS custom properties): colors, type scale, spacing, shadows, radii
    app.css               — all component/page styles, built on top of the tokens
public/
  topo-pattern.svg        — decorative background texture used on dark sections
```

## Design system

- **Primary**: Sunrise Orange (`--primary-600 #EA580C`)
- **Heritage accent**: Himalayan Blue (`--heritage-blue #1E3A8A`), Nepal Crimson (`--crimson-500 #DC2626`)
- **Type**: Plus Jakarta Sans (display + body), Noto Sans Devanagari for `धन्यवाद` etc.
- All tokens are CSS variables in `styles/colors_and_type.css` — change them there to re-theme everything.

## Notes for further development

- **No backend yet.** All data (profiles, matches, messages) is hardcoded in the page components (see `ALL_PROFILES` in `Discover.jsx`, `MATCHES` in `Matches.jsx`). Wire these to a real API before shipping.
- **Auth is not implemented.** `Signup.jsx` simulates ID/selfie verification (click-to-mark-done) — replace with a real KYC/verification provider.
- **Chat is local-only** (component state, resets on refresh). Swap in a real-time layer (WebSocket, Firebase, Pusher, etc.) for production messaging.
- Matching logic in `Discover.jsx` is randomized (`Math.random() > 0.4`) as a placeholder for a real backend match result.
- Routing is client-side only (React Router `BrowserRouter`) — configure your host to rewrite all paths to `index.html` (e.g. Vercel/Netlify SPA fallback) or switch to a framework with SSR (Next.js) if you need it.
