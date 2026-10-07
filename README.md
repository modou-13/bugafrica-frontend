# BugAfrica – Frontend (Angular 19)

```bash
npm install
npm start          # http://localhost:4200  (le backend doit tourner sur :8080)
npm run build      # build de production dans dist/frontend/browser
```

## Changer l'URL de l'API (production)
Dans `src/index.html`, modifie la ligne :
```html
<script>window.API_URL = 'https://ton-api.com/api';</script>
```
Puis ajoute l'adresse du site dans `CORS_ORIGINS` côté backend.

## Pages
`/` bugs (recherche, filtres, tags) · `/bugs/:id` détail + réponses · `/bugs/new` poser un bug · `/login` · `/register` · `/profile`

Pour un hébergement statique (Netlify, Vercel, Cloudflare Pages) : dossier `dist/frontend/browser`,
avec une règle de redirection de toutes les routes vers `index.html`.
