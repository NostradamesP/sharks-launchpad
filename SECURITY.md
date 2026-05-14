# Security checklist for Sharks Launchpad

This site is hosted on GitHub Pages, so all frontend code is public. Do not put secrets, passwords, private keys, or confidential information in `index.html`, `css/`, or `js/`.

## Required Firebase settings

1. Publish the included `firestore.rules` file in Firebase Console > Firestore Database > Rules.
2. In Firebase Authentication, keep only the sign-in providers you actually use.
3. In Firebase Authentication > Settings > Authorized domains, keep only the production domains you need, for example:
   - `nostradamesp.github.io`
   - your future custom domain, if any
4. Consider enabling Firebase App Check for Firestore with reCAPTCHA Enterprise or reCAPTCHA v3.
5. Do not rely on the frontend admin check alone. Frontend checks only improve UI behavior; Firestore Rules are the real protection.

## Current admin logic

The frontend allows edit mode only for:

- any signed-in Google account ending in `@cms.edu.do`
- `erojas@cms.edu.do`

The same rule is mirrored in `firestore.rules`. If you want only specific emails, remove the domain rule and list exact emails instead.
