#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "config.runtime.js");

const ENV_KEYS = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
];

const optionalKeys = [
  "FIREBASE_MEASUREMENT_ID",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_UPLOAD_PRESET",
  "CLOUDINARY_IMAGE_UPLOAD_PRESET",
];

function env(name) {
  return (process.env[name] || "").trim();
}

const values = {};
for (const key of ENV_KEYS) {
  values[key] = env(key);
}

const missing = ENV_KEYS.filter(function (key) {
  return !values[key];
});

if (missing.length) {
  if (process.env.VERCEL) {
    console.error(
      "[generate-config] Variables manquantes sur Vercel : " + missing.join(", ")
    );
    console.error("Ajoutez-les dans Vercel → Settings → Environment Variables.");
    process.exit(1);
  }
  console.log(
    "[generate-config] Variables absentes — config.runtime.js / config.local.js local conservés (dev)."
  );
  process.exit(0);
}

const firebaseConfig = {
  apiKey: values.FIREBASE_API_KEY,
  authDomain: values.FIREBASE_AUTH_DOMAIN,
  projectId: values.FIREBASE_PROJECT_ID,
  storageBucket: values.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: values.FIREBASE_MESSAGING_SENDER_ID,
  appId: values.FIREBASE_APP_ID,
};

const measurementId = env("FIREBASE_MEASUREMENT_ID");
if (measurementId) firebaseConfig.measurementId = measurementId;

const cloudinaryConfig = {
  cloudName: env("CLOUDINARY_CLOUD_NAME") || "VOTRE_CLOUD_NAME",
  uploadPreset: env("CLOUDINARY_UPLOAD_PRESET") || "VOTRE_UPLOAD_PRESET",
  imageUploadPreset: env("CLOUDINARY_IMAGE_UPLOAD_PRESET") || "gites-helene-gallery",
};

const lines = [
  "// Généré au build Vercel — ne pas éditer.",
  "window.GITES_HELENE_LOCAL = {",
  "  firebaseConfig: " + JSON.stringify(firebaseConfig, null, 2).replace(/\n/g, "\n  ") + ",",
  "  cloudinaryConfig: " + JSON.stringify(cloudinaryConfig, null, 2).replace(/\n/g, "\n  ") + ",",
  "};",
  "",
];

fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log("[generate-config] config.runtime.js généré pour " + values.FIREBASE_PROJECT_ID);
