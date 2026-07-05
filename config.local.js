// Clés Firebase (déployées sur Vercel avec le site).
// Les clés Firebase web sont publiques côté navigateur ; la sécurité repose sur
// les règles Firestore et Authentication, pas sur le secret de l'apiKey.

window.GITES_HELENE_LOCAL = {
  firebaseConfig: {
    apiKey: "AIzaSyBxcu4lfRDOZD4Bc-b9hr7BDa0zrCzx2E0",
    authDomain: "gite-helene.firebaseapp.com",
    projectId: "gite-helene",
    storageBucket: "gite-helene.firebasestorage.app",
    messagingSenderId: "662222726330",
    appId: "1:662222726330:web:cabd9ea4c8d361a40cce83",
    measurementId: "G-7K7YP8464H",
  },
  cloudinaryConfig: {
    cloudName: "VOTRE_CLOUD_NAME",
    uploadPreset: "VOTRE_UPLOAD_PRESET",
  },
};
