// Configuration partagée — admin tarifs & page publique

export const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID",
};

export const cloudinaryConfig = {
  cloudName: "VOTRE_CLOUD_NAME",
  uploadPreset: "VOTRE_UPLOAD_PRESET",
};

export const defaultPasswords = {
  Hélène: "MOT_DE_PASSE_HELENE",
  Lily: "Willow2005*",
};

export const defaultEmails = {
  Hélène: "helenemarseille@orange.fr",
  Lily: "fauconlily05@gmail.com",
};

export const DEFAULT_PERIODS = {
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

export const GITES = [
  { id: "calin", name: "Gîte Câlin", defaultPrice: "À partir de 350 € / semaine" },
  { id: "chal-heureux", name: "Gîte Chal'heureux", defaultPrice: "À partir de 380 € / semaine" },
  { id: "cocon-confort", name: "Gîte Cocon Confort", defaultPrice: "À partir de 400 € / semaine" },
  { id: "valeur-sure", name: "Gîte Valeur Sûre", defaultPrice: "À partir de 380 € / semaine" },
  { id: "coup-de-coeur", name: "Gîte Coup de Cœur", defaultPrice: "À partir de 420 € / semaine" },
];

export const STORAGE_KEY = "gitesHeleneCurrentUser";
export const PASSWORDS_STORAGE_KEY = "gitesHelenePasswords";
export const EMAILS_STORAGE_KEY = "gitesHeleneEmails";
export const TARIFS_STORAGE_KEY = "gitesHeleneTarifs";
export const HISTORY_STORAGE_KEY = "gitesHeleneHistory";
export const FIRESTORE_COLLECTION = "gites";
export const HISTORY_COLLECTION = "historique";

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      !firebaseConfig.apiKey.includes("VOTRE") &&
      firebaseConfig.projectId &&
      !firebaseConfig.projectId.includes("VOTRE")
  );
}

export function isCloudinaryConfigured() {
  return Boolean(
    cloudinaryConfig.cloudName &&
      !cloudinaryConfig.cloudName.includes("VOTRE") &&
      cloudinaryConfig.uploadPreset &&
      !cloudinaryConfig.uploadPreset.includes("VOTRE")
  );
}
