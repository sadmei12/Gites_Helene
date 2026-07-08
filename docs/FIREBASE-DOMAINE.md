# Firebase — domaine gite-embrun.fr

Deux réglages distincts sont nécessaires pour que l’**admin tarifs** et les **tarifs publics** fonctionnent sur le domaine définitif.

Projet Firebase : **gite-helene**

---

## 1. Domaines autorisés (Authentication)

Sans cette étape, la connexion admin sur `gite-embrun.fr/admin.html` échoue (`auth/unauthorized-domain`).

1. Ouvrez [Firebase → Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/gite-helene/authentication/settings)
2. Cliquez **Add domain**
3. Ajoutez :
   - `gite-embrun.fr`
   - `www.gite-embrun.fr`
4. Enregistrez

Les domaines `localhost` et `gite-helene.firebaseapp.com` restent utiles pour le dev et Vercel.

---

## 2. Restrictions HTTP referrers (clé API)

La clé API Firebase est publique dans le JavaScript du site. Elle doit être **restreinte par referrer** pour limiter les abus.

1. Ouvrez [Google Cloud → Credentials (projet gite-helene)](https://console.cloud.google.com/apis/credentials?project=gite-helene)
2. Cliquez sur la clé API utilisée par l’app web (souvent **Browser key** ou clé créée pour Firebase)
3. **Application restrictions** → **HTTP referrers (web sites)**
4. Ajoutez **tous** les referrers suivants (un par ligne) :

```
https://gite-embrun.fr/*
https://www.gite-embrun.fr/*
https://*.vercel.app/*
http://localhost/*
http://127.0.0.1/*
```

5. **API restrictions** → laissez **Don't restrict key** (Firebase a besoin de plusieurs APIs) **ou** limitez aux APIs Firebase listées par Google si vous préférez un durcissement avancé
6. **Save**

> Si vous créez une **nouvelle** clé API, mettez à jour `FIREBASE_API_KEY` dans Vercel (Settings → Environment Variables) puis **Redeploy**. En local, mettez à jour `config.local.js`.

---

## 3. Vérification

### Tarifs publics (Firestore lecture)

1. Ouvrez une fiche gîte en navigation privée :  
   `https://gite-embrun.fr/gite-valeur-sure.html` (ou l’URL Vercel en attendant le domaine)
2. Le tableau tarifs doit se remplir (pas seulement les valeurs par défaut du JS)

### Admin (Firestore écriture + Auth)

1. Ouvrez `https://gite-embrun.fr/admin.html`
2. Connectez-vous (Hélène ou Lily)
3. Modifiez un tarif → **Enregistrer**
4. Rechargez la fiche gîte : la modification est visible

### En cas d’erreur

| Message / symptôme | Cause probable |
|--------------------|----------------|
| `auth/unauthorized-domain` | Domaine absent des **Authorized domains** (étape 1) |
| `API key not valid` / requêtes Firestore bloquées | Referrer absent ou clé API mal configurée (étape 2) |
| Tarifs OK en local, KO en prod | Variables Vercel manquantes ou redeploy non fait |
| `Accès Firestore refusé` | Règles Firestore : `firebase deploy --only firestore:rules` |

---

## 4. Après migration o2switch

Si le site passe de Vercel à o2switch sur le **même domaine** `gite-embrun.fr`, **aucun changement Firebase** n’est nécessaire tant que l’URL reste identique.

Gardez `https://*.vercel.app/*` tant que vous utilisez encore Vercel en préproduction.
