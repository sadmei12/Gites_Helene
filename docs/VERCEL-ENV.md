# Variables d'environnement Vercel

Les clés Firebase ne sont **plus dans Git**. Elles sont injectées au déploiement via `scripts/generate-config.js`.

## Configurer Vercel

1. [Vercel Dashboard](https://vercel.com) → projet **Gîtes Hélène**
2. **Settings → Environment Variables**
3. Ajoutez chaque variable (cocher **Production**, **Preview**, **Development**) :

| Variable | Exemple (projet gite-helene) |
|----------|------------------------------|
| `FIREBASE_API_KEY` | votre clé `AIzaSy...` |
| `FIREBASE_AUTH_DOMAIN` | `gite-helene.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `gite-helene` |
| `FIREBASE_STORAGE_BUCKET` | `gite-helene.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `662222726330` |
| `FIREBASE_APP_ID` | `1:662222726330:web:...` |
| `FIREBASE_MEASUREMENT_ID` | optionnel |
| `CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary (import PDF admin) |
| `CLOUDINARY_UPLOAD_PRESET` | ex. `gites-helene-pdf` — voir [`docs/CLOUDINARY-SETUP.md`](CLOUDINARY-SETUP.md) |

4. **Redeploy** le site (Deployments → ⋯ → Redeploy)

## Développement local

```bash
cp config.local.example.js config.local.js
# Remplissez config.local.js avec vos clés
```

## Sécurité — restrictions de la clé API

Dans [Google Cloud → Credentials (gite-helene)](https://console.cloud.google.com/apis/credentials?project=gite-helene), éditez la clé API web et ajoutez ces **HTTP referrers** :

- `https://gite-embrun.fr/*`
- `https://www.gite-embrun.fr/*`
- `https://*.vercel.app/*`
- `http://localhost/*`
- `http://127.0.0.1/*`

Ajoutez aussi `gite-embrun.fr` et `www.gite-embrun.fr` dans Firebase → **Authentication → Authorized domains**.

Guide complet : [`docs/FIREBASE-DOMAINE.md`](FIREBASE-DOMAINE.md)

Si vous **rotatiez** la clé API :

Les mots de passe admin ne sont plus dans le code : connexion **uniquement via Firebase Authentication**.
