# Sharks Launch Pad — Carol Morgan School

> Portal de lanzamiento de enlaces para el staff del colegio · Quick-launch links portal for school staff

**Sharks Launch Pad** es un portal de acceso rápido (launchpad de enlaces) para el staff del **Carol Morgan School**. Es un escritorio central de recursos, sistemas, formularios y comunicaciones, accesible exclusivamente con cuentas de correo `@cms.edu.do`.

---

## Español

### Descripción

El portal mantiene una cuadricula de enlaces organizada por categorias (Schoolwide, Forms & Policies, Systems, Communications, Elementary, Middle School, High School, Athletics, Health Office, HHRR) con busqueda, favoritos, historial y accesos rapidos por teclado.

### Caracteristicas principales

- **Acceso restringido:** el portal permanece bloqueado hasta iniciar sesion con Google usando una cuenta verificada de `@cms.edu.do`.
- **Busqueda** con sugerencias y filtros por categoria.
- **Favoritos, historial reciente y "mas usados"** (persistidos en `localStorage`).
- **Atajos de teclado** (G, C, V, R, N, ?, Esc) y vista compacta/grid.
- **Panel de administracion** (solo admin): configuracion del hero (fondo, color, mascota, titulo, anuncio), CRUD de categorias y enlaces con drag & drop, y edit mode sobre la pagina.
- **Seguridad:** lectura solo para usuarios CMS, escritura solo para admin (`erojas@cms.edu.do`), reglas en `firestore.rules`.

### Stack

- Frontend estatico: HTML5 + CSS3 + JavaScript vanilla (sin build system).
- **Firebase** (SDK compat 10.7.1 via CDN): Authentication (Google), Cloud Firestore y Storage.
- Tipografia **Inter** (Google Fonts).
- Hosting: **GitHub Pages**.

### Estructura

```txt
sharks-launchpad/
├── index.html              # Estructura HTML completa
├── css/styles.css          # Todo el CSS
├── js/app.js               # Todo el JavaScript (auth, CRUD, edit mode)
├── firebase.json           # Config Firebase
├── firestore.rules         # Reglas de seguridad Firestore
├── README.md
└── SECURITY.md             # Checklist de seguridad
```

### Despliegue (GitHub Pages)

Subir `index.html`, `css/` y `js/` a la raiz del repo (GitHub Pages espera `index.html` en la raiz, no en subcarpetas). Las reglas de Firestore deben publicarse manualmente en Firebase Console > Firestore Database > Rules (GitHub Pages no las aplica automaticamente).

### Seguridad

- Portal solo para cuentas `@cms.edu.do`; edicion solo para el admin definido en `ADMIN_EMAILS` (`js/app.js`).
- `firestore.rules`: lectura CMS-only, escritura admin-only, validaciones de esquema y deny-all por defecto.
- Ver `SECURITY.md` para el checklist completo (App Check, no guardar secretos, etc.).

---

## English

### Overview

**Sharks Launch Pad** is a quick-launch links portal for **Carol Morgan School** staff: a central dashboard of resources, systems, forms and communications, accessible exclusively with `@cms.edu.do` accounts.

### Key features

- **Restricted access:** the portal stays locked until the user signs in with a verified `@cms.edu.do` Google account.
- **Search** with suggestions and category filters.
- **Favorites, recent history and "most used"** (persisted in `localStorage`).
- **Keyboard shortcuts** (G, C, V, R, N, ?, Esc) and compact/grid views.
- **Admin panel** (admin only): hero config (background, color, mascot, title, announcement), category and link CRUD with drag & drop, plus on-page edit mode.
- **Security:** CMS-only reads, admin-only writes (`erojas@cms.edu.do`), enforced by `firestore.rules`.

### Stack

- Static frontend: HTML5 + CSS3 + vanilla JavaScript (no build system).
- **Firebase** (compat SDK 10.7.1 via CDN): Authentication (Google), Cloud Firestore and Storage.
- **Inter** font (Google Fonts).
- Hosting: **GitHub Pages**.

### Structure

```txt
sharks-launchpad/
├── index.html              # Complete HTML structure
├── css/styles.css          # All CSS
├── js/app.js               # All JavaScript (auth, CRUD, edit mode)
├── firebase.json           # Firebase config
├── firestore.rules         # Firestore security rules
├── README.md
└── SECURITY.md             # Security checklist
```

### Deployment (GitHub Pages)

Upload `index.html`, `css/` and `js/` to the repo root (GitHub Pages expects `index.html` at the root, not in subfolders). Firestore rules must be published manually in Firebase Console > Firestore Database > Rules (GitHub Pages does not apply them automatically).

### Security

- Portal only for `@cms.edu.do` accounts; editing only for the admin defined in `ADMIN_EMAILS` (`js/app.js`).
- `firestore.rules`: CMS-only reads, admin-only writes, schema validation and deny-all by default.
- See `SECURITY.md` for the full checklist (App Check, no secrets in repo, etc.).

---

(c) 2026 Carol Morgan School
