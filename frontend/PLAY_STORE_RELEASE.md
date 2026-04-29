# Google Play Store release runbook

Submission artefacts and rollout plan for the Azafaran Android app.
Keep this in sync with `app.json`, `eas.json`, and the Play Console listing.

---

## 1. Data Safety form (Play Console → App content → Data safety)

Use these answers verbatim — they reflect what the codebase actually does.

### Data collection & sharing — top-level

- **Does your app collect or share any of the required user data types?** Yes
- **Is all of the user data collected by your app encrypted in transit?** Yes (HTTPS-only API host; see `lib/api.ts`)
- **Do you provide a way for users to request that their data be deleted?**
  Yes — in-app deletion (Profile → Danger zone → Delete account, calls `DELETE /api/v1/users/`).
  Web/email channel: `soporte@azafaran.app`.

### Data types collected

| Category            | Data type           | Collected | Shared | Optional | Purposes                                   |
|---------------------|---------------------|-----------|--------|----------|--------------------------------------------|
| Personal info       | Name                | Yes       | No     | No       | Account management, Fulfilment             |
| Personal info       | Email address       | Yes       | No     | No       | Account management, Communications         |
| Personal info       | Phone number        | Yes       | No     | No       | Account management, Fulfilment             |
| Personal info       | Address             | Yes       | No     | No       | Fulfilment (delivery)                      |
| Personal info       | Date of birth       | Yes       | No     | No       | Account management, Age verification (18+) |
| Personal info       | Gender              | Yes       | No     | Yes      | Personalisation                            |
| Financial info      | Payment info        | Yes       | Yes¹   | No       | App functionality (purchases)              |
| Financial info      | Purchase history    | Yes       | No     | No       | Account management, Analytics              |
| Photos and videos   | Photos              | Yes       | No     | Yes      | Customer support (ticket attachments)      |
| Files and docs      | Files and documents | Yes       | No     | Yes      | Customer support (ticket attachments)      |
| App activity        | App interactions    | Yes       | No     | No       | Analytics, App functionality               |
| Device or other IDs | Device or other IDs | Yes       | No     | No       | Push notifications (FCM / Expo)            |

¹ Payment data is collected by Stripe (PCI-DSS Level 1). Card details never touch
our servers — `@stripe/stripe-react-native` tokenises in-app and we only receive
a token. Declare Stripe as a third-party processor under "shared with".

### Security practices

- Data encrypted in transit: **Yes** (TLS to API + Stripe).
- Users can request data deletion: **Yes** (in-app + email).
- Committed to Play Families Policy: **No** (app is 18+).
- Independent security review: **No** (unless you commission one).

---

## 2. App content declarations

| Item                              | Answer                                                              |
|-----------------------------------|---------------------------------------------------------------------|
| Privacy Policy URL                | `https://www.azafaran.es/privacy` (also `/ca/privacy`, `/en/privacy`) |
| Target audience                   | 18+ only (alcohol-free, but halal-meat retail; account requires 18+) |
| Ads                               | No                                                                  |
| Content rating questionnaire      | Commerce / shopping; no violence, no UGC visible to others           |
| News app                          | No                                                                  |
| COVID-19 contact tracing          | No                                                                  |
| Data safety section               | See above                                                           |
| Government app                    | No                                                                  |
| Financial features                | None (Stripe processes payments — declare as a payments processor)  |
| Health                            | No                                                                  |

---

## 3. Store listing copy (drop into Play Console)

### Short description (≤ 80 chars)
- ES: `Carne halal certificada con entrega a domicilio en Barcelona.`
- CA: `Carn halal certificada amb lliurament a domicili a Barcelona.`
- EN: `Certified halal meat delivered to your door in Barcelona.`

### Full description (≤ 4000 chars) — write per locale before launch

Required points to cover: certification, delivery zone, payment methods,
order tracking, multilingual support (ES/CA/EN), customer support.

### Required graphics

| Asset                   | Spec                          | Status |
|-------------------------|-------------------------------|--------|
| App icon                | 512×512 PNG, 32-bit, no alpha | TODO   |
| Feature graphic         | 1024×500 JPG/PNG              | TODO   |
| Phone screenshots (×3+) | 16:9 or 9:16, ≥ 1080px        | TODO   |
| 7-inch tablet (opt.)    | 16:9 or 9:16                  | OPTIONAL |
| 10-inch tablet (opt.)   | 16:9 or 9:16                  | OPTIONAL |

---

## 4. Release rollout plan

Each track gates on the previous one passing real-world checks.

### 4.1 Internal testing (≤ 100 testers, instant rollout)
1. `eas build --platform android --profile production` (produces AAB).
2. `eas submit --platform android --profile production` — defaults to internal track.
3. Add `soporte@azafaran.app` + your dev/QA emails as testers in Play Console.
4. Smoke test on a real Android device:
   - Cold start, language picker, onboarding, terms accept.
   - Register → email verification (if enabled) → profile setup with DOB.
   - Browse categories, add to cart, checkout with Stripe test card.
   - Receive push notification (order status update).
   - Profile → Delete account → confirm logout + 401 on next request.
5. Verify Play Console pre-launch report: no crashes, no policy issues.

### 4.2 Closed testing (alpha — invite-only group, 14 days)
1. Promote internal build to closed testing in Play Console.
2. Invite 10–20 friendly users via email list or Google Group.
3. Required by Play Console for new personal developer accounts: **20+ testers
   for ≥ 14 continuous days** before production access is unlocked.
4. Track feedback, file fixes, bump versionCode, re-upload.

### 4.3 Open testing (beta — optional)
- Optional public-facing track. Skip if you want a quiet launch.

### 4.4 Production
1. Promote the closed-testing build to production.
2. Start at **staged rollout 10%** for 48h, watch crash-free rate ≥ 99% and
   reviews.
3. Bump to 50%, then 100% over the following days.
4. Halt rollout if crash-free drops below 99% or ANR rate exceeds 0.47%.

### 4.5 Hotfix path
1. Fix on a branch.
2. `eas build --profile production --auto-submit` (versionCode auto-increments
   via `appVersionSource: "remote"` in `eas.json`).
3. Push to a fresh staged rollout, never replace an existing one mid-flight.

---

## 5. Pre-flight checklist

- [ ] `google-services.json` present at `frontend/google-services.json` **OR**
      remove the `android.googleServicesFile` line from `app.json` and rely on
      Expo Push for FCM.
- [ ] Adaptive icon: separate `foregroundImage` (66% safe zone) and
      `monochromeImage` (single-tone) — currently both reuse `icon.png`.
- [ ] Generate 512×512 store icon, 1024×500 feature graphic, ≥3 phone screenshots.
- [ ] Confirm `https://www.azafaran.es/privacy` returns 200 and renders the
      published policy.
- [ ] Confirm `EXPO_PUBLIC_API_HOST` in EAS production env matches prod
      (or unset, so it falls back to the hard-coded `https://www.azafaran.es`).
- [ ] Run `npm run lint` and a manual smoke test on the production AAB.
- [ ] Bump `expo.version` in `app.json` for marketing version (semver).
      `versionCode` is auto-managed by EAS — do not edit manually for prod.
- [ ] Tag the release commit: `git tag android-v1.0.0 && git push --tags`.
