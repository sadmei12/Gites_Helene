// Configuration partagée — admin tarifs & page publique
(function (global) {
  const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT.firebaseapp.com",
    projectId: "VOTRE_PROJECT_ID",
    storageBucket: "VOTRE_PROJECT.appspot.com",
    messagingSenderId: "VOTRE_SENDER_ID",
    appId: "VOTRE_APP_ID",
  };

  const cloudinaryConfig = {
    cloudName: "VOTRE_CLOUD_NAME",
    uploadPreset: "VOTRE_UPLOAD_PRESET",
  };

  const defaultPasswords = {
    Hélène: "GitesHelene2026!",
    Lily: "Willow2005*",
  };

  const defaultEmails = {
    Hélène: "helenemarseille@orange.fr",
    Lily: "fauconlily05@gmail.com",
  };

  const DEFAULT_PERIODS = {
    "valeur-sure": [
      { label: "Avril – juin", price: "599 €" },
      { label: "Juillet", price: "599 – 699 €" },
      { label: "Août", price: "735 €" },
      { label: "Septembre", price: "599 – 699 €" },
      { label: "Octobre – novembre", price: "599 €" },
    ],
    "coup-de-coeur": [
      { label: "Avril – juin", price: "599 €" },
      { label: "Juillet", price: "599 – 699 €" },
      { label: "Août", price: "735 €" },
      { label: "Septembre", price: "599 – 699 €" },
      { label: "Octobre – novembre", price: "599 €" },
    ],
    calin: [
      { label: "Avril – juin", price: "380 €" },
      { label: "Juillet", price: "462 €" },
      { label: "Août", price: "510 €" },
      { label: "Septembre", price: "420 – 435 €" },
      { label: "Octobre – novembre", price: "420 €" },
    ],
    "chal-heureux": [
      { label: "Avril – juin", price: "380 €" },
      { label: "Juillet", price: "462 €" },
      { label: "Août", price: "510 €" },
      { label: "Septembre", price: "400 – 420 €" },
      { label: "Octobre – novembre", price: "400 €" },
    ],
    "cocon-confort": [
      { label: "Avril – juin", price: "450 €" },
      { label: "Juillet", price: "450 – 610 €" },
      { label: "Août", price: "610 €" },
      { label: "Septembre", price: "480 – 557 €" },
      { label: "Octobre – novembre", price: "480 €" },
    ],
  };

  const GITES = [
    { id: "calin", name: "Gîte Câlin", defaultPrice: "À partir de 350 € / semaine" },
    { id: "chal-heureux", name: "Gîte Chal'heureux", defaultPrice: "À partir de 380 € / semaine" },
    { id: "cocon-confort", name: "Gîte Cocon Confort", defaultPrice: "À partir de 400 € / semaine" },
    { id: "valeur-sure", name: "Gîte Valeur Sûre", defaultPrice: "À partir de 380 € / semaine" },
    { id: "coup-de-coeur", name: "Gîte Coup de Cœur", defaultPrice: "À partir de 420 € / semaine" },
  ];

  const DEFAULT_PDF_URLS = {
    calin: "assets/documents/tarifs/tarifs-calin.pdf",
    "chal-heureux": "assets/documents/tarifs/tarifs-chal-heureux.pdf",
    "cocon-confort": "assets/documents/tarifs/tarifs-cocon-confort.pdf",
    "valeur-sure": "assets/documents/tarifs/tarifs-valeur-sure.pdf",
    "coup-de-coeur": "assets/documents/tarifs/tarifs-coup-de-coeur.pdf",
  };

  const ADMIN_USERS = ["Hélène", "Lily"];

  function isFirebaseConfigured() {
    return Boolean(
      firebaseConfig.apiKey &&
        !firebaseConfig.apiKey.includes("VOTRE") &&
        firebaseConfig.projectId &&
        !firebaseConfig.projectId.includes("VOTRE")
    );
  }

  function isCloudinaryConfigured() {
    return Boolean(
      cloudinaryConfig.cloudName &&
        !cloudinaryConfig.cloudName.includes("VOTRE") &&
        cloudinaryConfig.uploadPreset &&
        !cloudinaryConfig.uploadPreset.includes("VOTRE")
    );
  }

  global.GITES_HELENE_CONFIG = {
    firebaseConfig,
    cloudinaryConfig,
    defaultPasswords,
    defaultEmails,
    DEFAULT_PERIODS,
    GITES,
    DEFAULT_PDF_URLS,
    ADMIN_USERS,
    STORAGE_KEY: "gitesHeleneCurrentUser",
    PASSWORDS_STORAGE_KEY: "gitesHelenePasswords",
    EMAILS_STORAGE_KEY: "gitesHeleneEmails",
    TARIFS_STORAGE_KEY: "gitesHeleneTarifs",
    HISTORY_STORAGE_KEY: "gitesHeleneHistory",
    FIRESTORE_COLLECTION: "gites",
    HISTORY_COLLECTION: "historique",
    isFirebaseConfigured,
    isCloudinaryConfigured,
  };
})(typeof window !== "undefined" ? window : globalThis);
