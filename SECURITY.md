# Security checklist for Sharks Launchpad

This site is hosted on GitHub Pages, so all frontend code is public. Do not put secrets, passwords, private keys, or confidential information in `index.html`, `css/`, or `js/`.

The portal UI now requires a verified Google account ending in `@cms.edu.do` before showing the page. Firestore reads should also be limited to those accounts. For strict data secrecy, do not keep private portal links hard-coded in HTML; store them only in Firestore or another protected backend.

## Required Firebase settings

1. Publish the included `firestore.rules` file in Firebase Console > Firestore Database > Rules.
2. In Firebase Authentication, keep only the sign-in providers you actually use.
3. In Firebase Authentication > Settings > Authorized domains, keep only the production domains you need, for example:
   - `nostradamesp.github.io`
   - your future custom domain, if any
4. Consider enabling Firebase App Check for Firestore with reCAPTCHA Enterprise or reCAPTCHA v3.
5. Do not rely on frontend checks alone. Frontend checks improve the UI, but Firestore Rules are the real protection for Firebase data.

## Current portal logic

The portal unlocks for signed-in, verified Google accounts ending in:

- `@cms.edu.do`

## Current admin logic

The frontend allows edit mode only for:

- `erojas@cms.edu.do`

The same admin rule is mirrored in `firestore.rules`. If more staff should edit, add exact emails to both `ADMIN_EMAILS` in `js/app.js` and `isAdmin()` in `firestore.rules`.
