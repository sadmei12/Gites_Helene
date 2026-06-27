// 🔧 Configuration partagée — admin tarifs & page publique
// Remplacez les valeurs placeholder avant mise en production.

// 🔧 Remplacez ces valeurs par celles de votre projet Firebase
export const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID",
};

// 🔧 Remplacez ces valeurs par celles de votre compte Cloudinary
export const cloudinaryConfig = {
  cloudName: "VOTRE_CLOUD_NAME",
  uploadPreset: "VOTRE_UPLOAD_PRESET",
};

// 🔧 Mot de passe par défaut de chaque utilisatrice (modifiable depuis l'admin)
export const defaultPasswords = {
  Hélène: "MOT_DE_PASSE_HELENE",
  Lily: "Willow2005*",
};

// 🔧 Adresse e-mail par défaut de chaque utilisatrice (modifiable depuis l'admin)
export const defaultEmails = {
  Hélène: "helenemarseille@orange.fr",
  Lily: "fauconlily05@gmail.com",
};

// Liste des gîtes gérés (identifiants Firestore = id)
export const GITES = [
  {
    id: "valeur-sure",
    name: "Gîte Valeur Sûre",
    defaultPrice: "À partir de 380 € / semaine",
  },
  {
    id: "coup-de-coeur",
    name: "Gîte Coup de Cœur",
    defaultPrice: "À partir de 420 € / semaine",
  },
  {
    id: "calin",
    name: "Gîte Calin",
    defaultPrice: "À partir de 350 € / semaine",
  },
  {
    id: "chal-heureux",
    name: "Gîte Chal'heureux",
    defaultPrice: "À partir de 380 € / semaine",
  },
  {
    id: "cocon-confort",
    name: "Gîte Cocon Confort",
    defaultPrice: "À partir de 400 € / semaine",
  },
];

export const STORAGE_KEY = "gitesHeleneCurrentUser";
export const PASSWORDS_STORAGE_KEY = "gitesHelenePasswords";
export const EMAILS_STORAGE_KEY = "gitesHeleneEmails";
export const FIRESTORE_COLLECTION = "gites";
