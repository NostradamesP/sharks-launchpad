# Sharks Launchpad - Separated Version

This version keeps the original app behavior but separates the single `index.html` into:

- `index.html` - HTML structure and external library references
- `css/styles.css` - all CSS from the original inline `<style>` block
- `js/app.js` - all custom JavaScript from the original inline `<script>` blocks

## Deploy on GitHub Pages

Upload these files/folders to the root of the repository:

```text
index.html
css/styles.css
js/app.js
```

Do not move `index.html` into a subfolder. GitHub Pages expects it at the repo root.

## Firebase Security Reminder

The frontend access checks are not enough by themselves. Make sure Firestore rules restrict reads to CMS users and writes to authorized admins.


## Security update

This version disables the edit button unless an authorized admin is logged in. It also includes:

- `firestore.rules` with CMS-only read / admin-only write permissions.
- `SECURITY.md` with Firebase hardening steps.

Upload `firestore.rules` manually in Firebase Console > Firestore Database > Rules. GitHub Pages does not apply Firestore rules automatically.


## Hardened edit mode
This version blocks Edit Mode unless Firebase Auth has a currently logged-in authorized admin. The default admin list is exact-email only in `js/app.js` (`ADMIN_EMAILS`).

## Portal access
The portal UI is locked until the user signs in with a verified Google account ending in `@cms.edu.do`. Because GitHub Pages is static hosting, private portal data should live in Firestore behind rules, not hard-coded in frontend files.
