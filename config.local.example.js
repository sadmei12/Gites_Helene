// Copiez ce fichier en config.local.js et remplissez vos clés Firebase / Cloudinary.
// config.local.js est ignoré par Git — ne commitez jamais vos clés secrètes.

window.GITES_HELENE_LOCAL = {
  firebaseConfig: {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
    projectId: "VOTRE_PROJECT_ID",
    storageBucket: "VOTRE_PROJECT_ID.appspot.com",
    messagingSenderId: "VOTRE_SENDER_ID",
    appId: "VOTRE_APP_ID",
  },
  cloudinaryConfig: {
    cloudName: "VOTRE_CLOUD_NAME",
    uploadPreset: "VOTRE_UPLOAD_PRESET",
  },
};
