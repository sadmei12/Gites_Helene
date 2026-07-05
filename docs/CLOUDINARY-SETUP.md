# Configuration Cloudinary — PDF tarifs

Cloudinary héberge les PDF importés depuis l’admin. Le forfait **gratuit** suffit largement pour 5 gîtes.

---

## 1. Créer un compte

1. [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Inscrivez-vous (e-mail Hélène ou Lily)
3. Notez le **Cloud name** affiché sur le Dashboard (ex. `dxxxxxx`)

---

## 2. Créer un preset d’upload

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

> **Unsigned** est obligatoire : l’admin envoie le PDF depuis le navigateur sans serveur secret.

---

## 2 bis. Autoriser la lecture des PDF (obligatoire)

Sans cette étape, le PDF s’envoie mais le navigateur affiche *« Échec de chargement du document PDF »*.

1. [Console Cloudinary → Settings → Security](https://console.cloudinary.com/settings/security)
2. Activez **Allow delivery of PDF and ZIP files** (ou équivalent en français)
3. **Save**

---

## 3. Configurer Vercel

Vercel → **Settings → Environment Variables** → ajoutez (Production + Preview) :

| Variable | Valeur |
|----------|--------|
| `CLOUDINARY_CLOUD_NAME` | votre Cloud name (ex. `dxxxxxx`) |
| `CLOUDINARY_UPLOAD_PRESET` | `gites-helene-pdf` |

**Redeploy** le site.

---

## 4. Configurer en local (optionnel)

Dans `config.local.js` :

```javascript
cloudinaryConfig: {
  cloudName: "dxxxxxx",
  uploadPreset: "gites-helene-pdf",
},
```

---

## 5. Tester

1. `/admin.html` → connexion Hélène ou Lily
2. Gîte Câlin → **Importer un PDF**
3. *« Nouveau PDF prêt »* → **Enregistrer**
4. Fiche `gite-calin.html` → lien PDF mis à jour

---

## Sécurité

- Seuls les **admins connectés** (Firebase) peuvent lancer un upload depuis l’admin
- Le preset unsigned limite les uploads au format PDF et au dossier configuré
- Ne partagez pas le preset sur des sites publics hors admin

---

## O2Switch (plus tard)

Les mêmes valeurs Cloudinary iront dans `config.local.js` sur le serveur — **aucun changement Cloudinary** lors de la migration.
