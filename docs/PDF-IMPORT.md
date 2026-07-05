# Import PDF tarifs — admin

Les PDF sont envoyés depuis l’admin vers **Firebase Storage**, puis l’URL est enregistrée dans Firestore (comme les tarifs).

---

## 1. Activer Firebase Storage (une seule fois)

1. [Firebase Console → Storage](https://console.firebase.google.com/project/gite-helene/storage)
2. **Commencer** / **Get started**
3. Mode **Production**
4. Région : **europe-west1** (ou la même que Firestore)
5. **Terminer**

---

## 2. Déployer les règles Storage

Dans le Terminal :

```bash
cd "/Users/lil/Documents/Gîte Hélène/gites-helene"
npx firebase deploy --only storage
```

Les règles autorisent :
- **Lecture publique** des PDF (`tarifs/*.pdf`)
- **Écriture** uniquement pour Hélène et Lily (connectées)

---

## 3. Utiliser l’import dans l’admin

1. Connectez-vous sur `/admin.html`
2. Ouvrez un gîte dans l’accordéon
3. **Importer un PDF** ou **Remplacer le PDF**
4. Choisissez le fichier `.pdf`
5. Attendez le message *« Nouveau PDF prêt »*
6. Cliquez **Enregistrer**

Le lien « Tarifs détaillés (PDF) » sur la fiche gîte pointe alors vers le nouveau fichier.

---

## Dépannage

| Problème | Solution |
|----------|----------|
| « Import en ligne non configuré » | Connectez-vous à l’admin (Firebase Auth requis) |
| « Échec de l'envoi » / permission denied | Déployez `storage.rules` et reconnectez-vous |
| PDF invisible sur le site | Cliquez **Enregistrer** après l’import |
| Storage non activé | Étape 1 ci-dessus |

---

## Cloudinary (optionnel)

L’admin peut aussi utiliser **Cloudinary** si vous configurez `CLOUDINARY_CLOUD_NAME` et `CLOUDINARY_UPLOAD_PRESET` (Vercel ou `config.local.js`).  
Par défaut, **Firebase Storage** est utilisé en priorité.
