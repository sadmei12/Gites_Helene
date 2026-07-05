# Import PDF tarifs — Cloudinary

Sans Firebase Storage, les PDF sont envoyés via **Cloudinary** (gratuit pour votre usage), puis l’URL est enregistrée dans Firestore comme les tarifs.

Guide détaillé Cloudinary : [`CLOUDINARY-SETUP.md`](CLOUDINARY-SETUP.md)

---

## Utilisation dans l’admin

1. Connectez-vous sur `/admin.html`
2. Ouvrez un gîte
3. **Importer un PDF** ou **Remplacer le PDF**
4. Choisissez un fichier `.pdf` (max 10 Mo)
5. Message *« Nouveau PDF prêt »* → **Enregistrer**
6. Le bouton « Tarifs détaillés (PDF) » sur la fiche gîte utilise la nouvelle URL

---

## Configuration requise

| Où | Quoi |
|----|------|
| **Cloudinary** | Compte + preset unsigned `gites-helene-pdf` |
| **Vercel** | `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_UPLOAD_PRESET` |
| **Local** | `config.local.js` → `cloudinaryConfig` |

Puis **Redeploy** Vercel.

---

## Dépannage

| Problème | Solution |
|----------|----------|
| « Import PDF non configuré » | Variables Cloudinary manquantes sur Vercel |
| « Connectez-vous à l'admin » | Se connecter en Hélène ou Lily |
| « Échec de l'envoi » | Vérifier le preset (unsigned, format PDF) |
| PDF inchangé sur le site | Cliquer **Enregistrer** après l’import |

---

## Alternative sans Cloudinary

Remplacer manuellement les fichiers sur le serveur :

`assets/documents/tarifs/tarifs-{gite}.pdf`

Ou coller l’URL d’un PDF hébergé ailleurs dans le champ URL de l’admin.
