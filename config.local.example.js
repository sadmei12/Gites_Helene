// Copiez en config.local.js pour le développement local (non versionné).
// Sur Vercel, les clés viennent des variables d'environnement (voir docs/VERCEL-ENV.md).

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
    imageUploadPreset: "gites-helene-gallery",
  },
};
