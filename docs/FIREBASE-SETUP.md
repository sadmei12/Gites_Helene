# Configuration Firebase — Gîtes Hélène

Ce guide permet de connecter l’admin tarifs et le site public à **Firebase** (Firestore + Authentication).

Une fois configuré, les modifications dans l’admin sont visibles par **tous les visiteurs** du site.

---

## 1. Créer le projet Firebase

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com/)
2. **Ajouter un projet** → nom suggéré : `gites-helene`
3. Désactivez Google Analytics si vous n’en avez pas besoin
4. Créez le projet

---

## 2. Activer Firestore

1. Menu **Build → Firestore Database**
2. **Créer une base de données**
3. Mode **Production**
4. Région : `europe-west1` (Belgique) ou la plus proche
5. Cliquez **Activer**

---

## 3. Activer l’authentification

1. Menu **Build → Authentication**
2. **Commencer**
3. Onglet **Sign-in method** → **E-mail/Mot de passe** → **Activer**

### Créer les deux comptes admin

Onglet **Users → Add user** :

| Utilisateur | E-mail | Mot de passe initial |
|-------------|--------|----------------------|
| Hélène | `helenemarseille@orange.fr` | `GitesHelene2026!` (ou celle définie dans `config.js`) |
| Lily | `fauconlily05@gmail.com` | `Willow2005*` |

Les mots de passe doivent correspondre à ceux utilisés à la connexion admin.

---

## 4. Récupérer les clés de l’application web

1. **Paramètres du projet** (engrenage) → **Vos applications**
2. Cliquez l’icône **Web** `</>`
3. Nom : `Gîtes Hélène site`
4. Copiez l’objet `firebaseConfig`

---

## 5. Configurer le site

```bash
cd "/Users/lil/Documents/Gîte Hélène/gites-helene"
cp config.local.example.js config.local.js
```

Ouvrez `config.local.js` et remplacez les valeurs `VOTRE_*` par vos clés Firebase :

```javascript
window.GITES_HELENE_LOCAL = {
  firebaseConfig: {
    apiKey: "AIza...",
    authDomain: "gites-helene-xxxxx.firebaseapp.com",
    projectId: "gites-helene-xxxxx",
    storageBucket: "gites-helene-xxxxx.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef",
  },
};
```

Mettez à jour `.firebaserc` avec votre `projectId` :

```json
{
  "projects": {
    "default": "gites-helene-xxxxx"
  }
}
```

> Sur **Vercel**, configurez les variables d'environnement (voir [`docs/VERCEL-ENV.md`](VERCEL-ENV.md)). En local, copiez `config.local.example.js` → `config.local.js`.

---

## 6. Publier les règles Firestore

Installez la CLI Firebase (une seule fois) :

```bash
npm install -g firebase-tools
firebase login
```

Depuis le dossier du projet :

```bash
firebase deploy --only firestore:rules
```

Les règles (`firestore.rules`) autorisent :

- **Lecture publique** des tarifs (`gites`)
- **Écriture** réservée aux utilisateurs connectés (Hélène / Lily)
- **Historique** admin en lecture/écriture pour les connectés

---

## 7. Vérifier

1. Ouvrez `admin.html` sur le site (ou en local avec un serveur HTTP)
2. Connectez-vous en **Hélène** ou **Lily**
3. Modifiez un tarif → **Enregistrer**
4. Ouvrez la fiche gîte correspondante : le tableau doit afficher les nouvelles valeurs
5. Testez dans une fenêtre privée (sans localStorage) : les tarifs viennent bien de Firestore

---

## 8. Domaine de production (gite-embrun.fr)

Avant la mise en ligne sur le domaine définitif, configurez **domaines autorisés** et **referrers HTTP** :

→ Guide détaillé : [`docs/FIREBASE-DOMAINE.md`](FIREBASE-DOMAINE.md)

Résumé :

1. Firebase → Authentication → **Authorized domains** → ajouter `gite-embrun.fr` et `www.gite-embrun.fr`
2. Google Cloud → Credentials → clé API → **HTTP referrers** → inclure `https://gite-embrun.fr/*` et `https://www.gite-embrun.fr/*`

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `Accès Firestore refusé` | Déployez les règles (`firebase deploy --only firestore:rules`) et reconnectez-vous |
| `auth/invalid-credential` | Vérifiez e-mail/mot de passe dans Firebase Authentication |
| `config.local.js` 404 | Copiez `config.local.example.js` → `config.local.js` |
| Tarifs inchangés en navigation privée | Firebase non configuré ou règles non déployées |

---

## Collections Firestore

| Collection | Contenu |
|------------|---------|
| `gites` | Un document par gîte (`calin`, `valeur-sure`, …) avec `periods`, `pdfUrl`, etc. |
| `historique` | Journal des modifications admin |

---

## Import PDF (Firebase Storage)

Voir le guide dédié : [`docs/PDF-IMPORT.md`](PDF-IMPORT.md)
