// Configuration partagée — admin tarifs & page publique
(function (global) {
  const local =
    typeof global.GITES_HELENE_LOCAL === "object" && global.GITES_HELENE_LOCAL
      ? global.GITES_HELENE_LOCAL
      : {};

  const firebaseConfig = Object.assign(
    {
      apiKey: "VOTRE_API_KEY",
      authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
      projectId: "VOTRE_PROJECT_ID",
      storageBucket: "VOTRE_PROJECT_ID.appspot.com",
      messagingSenderId: "VOTRE_SENDER_ID",
      appId: "VOTRE_APP_ID",
    },
    local.firebaseConfig || {}
  );

  const cloudinaryConfig = Object.assign(
    {
      cloudName: "VOTRE_CLOUD_NAME",
      uploadPreset: "VOTRE_UPLOAD_PRESET",
      imageUploadPreset: "VOTRE_IMAGE_UPLOAD_PRESET",
    },
    local.cloudinaryConfig || {}
  );

  const defaultPasswords = Object.assign(
    { Hélène: "", Lily: "" },
    local.defaultPasswords || {}
  );

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

  const BOOKING_URL_DEFAULT =
    "https://hautes-alpes-mb-prestataire.for-system.com/f133618_fr-.aspx";

  const SITE_URL = "https://gite-embrun.fr";

  const BOOKING_URLS = {
    "valeur-sure":
      "https://hautes-alpes-mb-prestataire.for-system.com/z8515e3_fr-appartement-3-pieces-st-sauveur-valeur-sure.aspx?Param/CodeOs=OSMB-133618-1&Globales/ListeIdFournisseur=133618",
    "chal-heureux":
      "https://hautes-alpes-mb-prestataire.for-system.com/z8515e3_fr-appartement-2-pieces-st-sauveur-chal-heureux.aspx?Param/CodeOs=OSMB-133618-5&Globales/ListeIdFournisseur=133618",
    "coup-de-coeur":
      "https://hautes-alpes-mb-prestataire.for-system.com/z8515e3_fr-appartement-3-pieces-st-sauveur-coup-de-coeur.aspx?Param/CodeOs=OSMB-133618-2&Globales/ListeIdFournisseur=133618",
    calin:
      "https://hautes-alpes-mb-prestataire.for-system.com/z8515e3_fr-appartement-2-pieces-st-sauveur-calin.aspx?Param/CodeOs=OSMB-133618-4&Globales/ListeIdFournisseur=133618",
    "cocon-confort":
      "https://hautes-alpes-mb-prestataire.for-system.com/z8515e3_fr-appartement-3-pieces-st-sauveur-cocon-confort.aspx?Param/CodeOs=OSMB-133618-3&Globales/ListeIdFournisseur=133618",
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

  function isCloudinaryImagesConfigured() {
    return Boolean(
      cloudinaryConfig.cloudName &&
        !cloudinaryConfig.cloudName.includes("VOTRE") &&
        cloudinaryConfig.imageUploadPreset &&
        !cloudinaryConfig.imageUploadPreset.includes("VOTRE")
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
    BOOKING_URL_DEFAULT,
    BOOKING_URLS,
    SITE_URL,
    ADMIN_USERS,
    STORAGE_KEY: "gitesHeleneCurrentUser",
    PASSWORDS_STORAGE_KEY: "gitesHelenePasswords",
    EMAILS_STORAGE_KEY: "gitesHeleneEmails",
    TARIFS_STORAGE_KEY: "gitesHeleneTarifs",
    HISTORY_STORAGE_KEY: "gitesHeleneHistory",
    FIRESTORE_COLLECTION: "gites",
    HISTORY_COLLECTION: "historique",
    GALLERY_COLLECTION: "galerie",
    isFirebaseConfigured,
    isCloudinaryConfigured,
    isCloudinaryImagesConfigured,
  };
})(typeof window !== "undefined" ? window : globalThis);
