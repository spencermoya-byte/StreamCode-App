# Building & shipping StreamCode for iOS (no Mac)

Stack: Expo + Dev Client + EAS — same as PiLink. You never need a local Mac;
EAS (or a CI macOS runner) does the Xcode build in the cloud.

## Prerequisites
- Expo account (free) — `eas login`.
- Apple Developer Program membership ($99/yr) to install on real devices and use
  TestFlight. EAS walks you through the Apple credential setup the first time.
- Why a Dev Client (not Expo Go): this app uses `react-native-webview`, a native
  module, so it needs a custom dev client — exactly what you already do for PiLink.

## A) EAS Build (simplest)
```bash
eas build --profile development --platform ios   # dev client
eas build --profile preview     --platform ios   # internal / TestFlight
eas build --profile production  --platform ios   # App Store
```
- `development` → install on your phone, then `npx expo start --dev-client` for live reloads.
- `preview` → internal distribution; hand the link to the family or push to TestFlight.
- Submit to TestFlight/App Store: `eas submit -p ios`.

## B) GitHub Actions
Run EAS from CI so a push triggers a build:
- Add `EXPO_TOKEN` (from expo.dev → Access Tokens) as a repo secret.
- Use `expo/expo-github-action`, then `eas build --platform ios --non-interactive --profile preview`.
- EAS still provides the cloud macOS + Xcode; Actions just orchestrates it.

## C) Codemagic
- Connect the repo; Codemagic provides macOS runners with Xcode.
- Either call `eas build` from a Codemagic workflow, or use Codemagic's native
  Expo/React Native iOS workflow with your Apple credentials.

## Distributing to the family
- TestFlight is the clean path: `eas submit -p ios` → invite family by email →
  they install the TestFlight app and tap Install. Nothing technical for them.

## Apple deadline note
As of April 28, 2026, App Store / TestFlight builds must be made with Xcode 26+
(iOS 26 SDK). EAS's default image is current, so a fresh `eas build` is fine;
if you pin an image in eas.json, make sure it's an Xcode 26+ image.
