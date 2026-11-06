# Login Page

A login screen in an Apple-inspired style, built with **React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion**.

## What makes it different: the Status Island
A black pill at the top of the screen, inspired by Apple's Dynamic Island, changes shape to show what the form is doing:

| You do this | The island shows |
|---|---|
| Nothing | 🟢 Secure |
| Type your username | "Editing username" with animated dots |
| Type your password | Live strength meter (Weak → Strong) |
| Caps Lock is on | ⇪ warning |
| Submit with mistakes | The error, and the card shakes |
| Submit | Spinner, then "Welcome, *name*" with a drawn check mark |

## Other features
- Frosted-glass card with a rotating light edge and a 3D tilt that follows the pointer
- Slowly moving gradient background, a spotlight that follows the cursor, and a fine grain texture
- **Passkey** button that detects Face ID, Touch ID or Windows Hello (WebAuthn)
- Light and dark mode with a smooth cross-fade (View Transitions API); follows the system setting and remembers your choice
- Floating labels, show/hide password, iOS-style "Remember me" switch
- Accessible: `aria-invalid`, live regions, keyboard focus and `prefers-reduced-motion` support
- Responsive, with safe-area aware layout

## Run locally
```bash
npm install
npm run dev
```

## Deploy
Every push to `main` builds the site and publishes it to GitHub Pages through `.github/workflows/deploy.yml`.
One-time setup: **Settings → Pages → Source: GitHub Actions**.

## Connect a backend
Sign-in is simulated in `submit()` in `src/App.tsx`. Replace the timeout there with a `fetch` to your API. The passkey button needs a WebAuthn server to issue challenges.
