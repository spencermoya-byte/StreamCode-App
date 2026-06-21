# StreamCode (standalone iOS app)

A native iOS app (Expo + EAS, same stack as PiLink). The whole UI — platform
grid, waiting screen, code screen — is built in React Native and bundled into
the app, including the platform logos. The app runs on its own and only reaches
out to the Pi for the actual verification codes. The website is unaffected.

## Run it now (demo mode)
`DEMO_MODE = true` in `App.js`, so it simulates a code on tap — you can build and
use the app before the backend is wired up.

```bash
npm install
npx expo install expo-clipboard expo-dev-client react-native-safe-area-context
npx expo start --dev-client     # or build with EAS below
```

## Connect to the Pi (real codes)
In `App.js`:
- set `API_BASE` to your Pi's HTTPS address (Tailscale Funnel / Cloudflare),
- set `DEMO_MODE = false`.

The app calls `POST /api/claim` and polls `GET /api/code?platform=…` on the Pi.
Note: a standalone app can't use the browser-cookie passcode gate, so when you
go live you'll want a simple API token/passcode sent with these requests — easy
to add to `auth.js` on the Pi when we get there.

## Build for iPhone (no Mac — EAS)
```bash
eas build --profile development --platform ios   # dev client
eas build --profile preview     --platform ios   # internal / TestFlight
```
See `IOS_BUILD.md` for GitHub Actions / Codemagic and TestFlight distribution.

## Files
- `App.js` — the entire native UI + demo/real code logic
- `assets/logos/` — bundled platform logos
- `assets/icon.png`, `assets/splash.png` — app icon & splash
- `app.json`, `eas.json` — Expo + EAS config
