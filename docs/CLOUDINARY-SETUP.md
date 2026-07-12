# Configuration Cloudinary — PDF tarifs et galerie photos

Cloudinary héberge les **PDF** importés depuis l'admin et les **images** de la galerie (`photos.html`). Le forfait **gratuit** suffit largement.

> **Firebase Storage n'est pas utilisé** sur ce projet : tout passe par Cloudinary.

---

## 1. Créer un compte

1. [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Inscrivez-vous (e-mail Hélène ou Lily)
3. Notez le **Cloud name** affiché sur le Dashboard (ex. `vzkg2d4h`)

---

## 2. Preset PDF (`gites-helene-pdf`)

1. [Console Cloudinary → Settings → Upload](https://console.cloudinary.com/settings/upload)
2. Onglet **Upload presets** → **Add upload preset**
3. Paramètres :

| Champ | Valeur |
|-------|--------|
| **Preset name** | `gites-helene-pdf` |
| **Signing mode** | **Unsigned** |
| **Asset folder** | `gites-helene/tarifs` |
| **Unique filename** | Désactivé (on écrase par gîte) |
| **Access control** | Public |
| **Allowed formats** | `pdf` (si disponible) |

4. **Save**

> **Unsigned** est obligatoire : l'admin envoie le PDF depuis le navigateur sans serveur secret.

---

## 2 bis. Preset images galerie (`gites-helene-gallery`)

Même page **Upload presets** → **Add upload preset** :

| Champ | Valeur |
|-------|--------|
| **Preset name** | `gites-helene-gallery` |
| **Signing mode** | **Unsigned** |
| **Asset folder** | `gites-helene/gallery` |
| **Unique filename** | Activé (recommandé) |
| **Access control** | Public |
| **Allowed formats** | `jpg`, `jpeg`, `png`, `webp` (si disponible) |

4. **Save**

Ce preset est **distinct** du preset PDF : ne réutilisez pas `gites-helene-pdf` pour les images.

---

## 3. Autoriser la lecture des PDF (obligatoire)

Sans cette étape, le PDF s'envoie mais le navigateur affiche *« Échec de chargement du document PDF »*.

1. [Console Cloudinary → Settings → Security](https://console.cloudinary.com/settings/security)
2. Activez **Allow delivery of PDF and ZIP files** (ou équivalent en français)
3. **Save**

---

## 4. Configurer sur o2switch (production)

Sur le serveur, éditez `config.local.js` à la racine du site :

```javascript
window.GITES_HELENE_LOCAL = {
  firebaseConfig: { /* vos clés Firebase */ },
  cloudinaryConfig: {
    cloudName: "vzkg2d4h",
    uploadPreset: "gites-helene-pdf",
    imageUploadPreset: "gites-helene-gallery",
  },
};
```

---

## 5. Configurer en local (développement)

```bash
cp config.local.example.js config.local.js
```

Remplissez `cloudinaryConfig` avec les trois valeurs ci-dessus.

---

## 6. Tester

### PDF tarifs
1. `/admin.html` → connexion Hélène ou Lily
2. Gîte Câlin → **Importer un PDF**
3. *« Nouveau PDF prêt »* → **Enregistrer**
4. Fiche `gite-calin.html` → lien PDF mis à jour

### Galerie photos
1. Admin → **Photos**
2. **Importer les photos du site** (première fois)
3. **+** pour ajouter une image, glisser-déposer pour réordonner
4. Vérifier `photos.html` en navigation privée

---

## Sécurité

- Seuls les **admins connectés** (Firebase) peuvent lancer un upload depuis l'admin
- Les presets unsigned limitent format et dossier
- Ne partagez pas les noms de preset sur des sites publics hors admin
- La suppression d'une photo dans l'admin retire l'entrée Firestore ; le fichier peut rester sur Cloudinary (sans impact sur le site)

---

## Vercel (si déploiement alternatif)

Variables d'environnement : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`, `CLOUDINARY_IMAGE_UPLOAD_PRESET` — voir [`docs/VERCEL-ENV.md`](VERCEL-ENV.md).
