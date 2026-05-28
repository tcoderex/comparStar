# 🔥 Electron + Firebase Auth: The Story

## The Goal

Turn a web app (Vite + React + Firebase) into a **standalone Windows desktop app using Electron** that:

- Can be installed with a `.exe` installer
- Runs offline
- Has a custom frameless title bar (Skyrim-themed)
- Lets users sign in with Google via Firebase Auth

## The Problem: Firebase Auth hates Electron

Firebase Auth's `signInWithPopup()` opens a popup window. It first checks if the page's domain is in the Firebase Console's **Authorized Domains** list. This works fine on the web, but in Electron:

### Problem 1: `file://` protocol
If you load your app via `file://` (the default for local HTML files in Electron), the origin is `null`. You **cannot** add `null` to Firebase's Authorized Domains. ❌

### Problem 2: `signInWithPopup` in Electron
Even with a local server (`http://localhost:3001`), the popup BrowserWindow that Electron creates doesn't always play nice with Firebase Auth's popup-to-opener `postMessage` communication. Various things can break: `window.opener` might not be set correctly, cross-origin messages can be blocked, etc.

### Problem 3: Custom OAuth flows
We tried building a **custom OAuth flow**:
1. Extract the Google OAuth `client_id` from the Firebase Auth handler
2. Open the system browser to Google OAuth
3. Catch the redirect back to a local server
4. Exchange the auth code for tokens
5. Sign in to Firebase

This failed because:
- The Firebase Auth handler returns an **HTML/JS page** (not an HTTP 302 redirect), so you can't extract the OAuth URL with a simple HTTP GET
- The Google OAuth `redirect_uri` **must match exactly** what's registered in the Google Cloud Console, which is `https://{project}.firebaseapp.com/__/auth/handler` — not your local server
- The authorization code flow uses PKCE (`code_challenge`/`code_verifier`) managed internally by Firebase

## The Solution: `signInWithRedirect`

The trick is to use `signInWithRedirect()` instead of `signInWithPopup()`:

```
Main window at http://localhost:3001
        │
        │  signInWithRedirect(auth, googleProvider)
        ▼
Navigates to: https://{project}.firebaseapp.com/__/auth/handler?...&authType=signInViaRedirect&...
        │
        ▼ (HTTP 302 redirect)
Google OAuth sign-in page (user signs in)
        │
        ▼ (HTTP 302 redirect back)
Firebase Auth handler processes the code server-side
        │
        ▼ (form POST back to redirectUrl)
http://localhost:3001  (your app reloads)
        │
        ▼ (Firebase Auth SDK detects redirect result)
User is signed in ✅
```

### Why this works

- `signInWithRedirect` uses **HTTP redirects** (302), not popup windows — no `window.open` issues
- The Firebase handler manages the **entire OAuth dance** (PKCE, state, token exchange) on the server side
- The domain check still applies (so `localhost` must be in Authorized Domains), but once that's configured, it works
- When the user returns to `http://localhost:3001`, the Firebase Auth SDK automatically detects the pending redirect result from IndexedDB and completes the sign-in

### What you need on the Express server

```js
const express = require('express');
const sv = express();

// Handle the form POST that Firebase handler sends back
sv.use(express.urlencoded({ extended: true }));
sv.post('*', (req, res) => { res.redirect('/'); });

sv.use(express.static(path.join(__dirname, '..', 'dist')));
```

The Firebase Auth handler redirects back to your `redirectUrl` using a form POST (not a GET). Without the `POST *` handler, Express would return `404 Cannot POST /` and the redirect would fail.

### What you need in Firebase Console

1. Go to **Authentication → Settings → Authorized domains**
2. Add `localhost` (and any custom domains like `xcompar.vercel.app`)
3. That's it — you don't need to touch the Google Cloud Console OAuth settings

## Key Files

| File | Purpose |
|------|---------|
| `electron/main.cjs` | Electron main process, Express server, window controls (no auth logic) |
| `electron/preload.cjs` | Exposes window controls to renderer (minimize, maximize, close) |
| `src/firebase.ts` | Firebase init, `signInWithRedirect` + `getRedirectResult` |
| `src/components/TabSettings.tsx` | Settings UI with sign-in/out buttons |

## For Your Next Electron App

1. **Always use a local server** (`express.static`) — never `file://`
2. **Use `signInWithRedirect`** for Firebase Auth in Electron (never `signInWithPopup`)
3. **Add a `POST *` catch-all** on your Express server to handle Firebase's form POST redirect
4. **Add `localhost` to Firebase Authorized Domains**
5. Use `contextIsolation: true`, `nodeIntegration: false`, and `preload` scripts for security
6. For the frameless window, use `frame: false` + custom title bar with `-webkit-app-region: drag`

## Common Gotchas

- `redirect_uri_mismatch` → You're using an unauthorized redirect URI. Only `https://{project}.firebaseapp.com/__/auth/handler` is registered
- `unauthorized-domain` → Add the domain to Firebase Console → Authentication → Settings → Authorized domains
- `Cannot POST /` → Add `sv.post('*', handler)` to your Express server
- Window doesn't come back after sign-in → Check that `base: './'` is set in `vite.config.ts` so asset paths work correctly after reload
