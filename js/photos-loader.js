(function () {
  "use strict";

  const cfg = window.GITES_HELENE_CONFIG;
  const fallback = Array.isArray(window.GITES_PHOTOS) ? window.GITES_PHOTOS.slice() : [];

  if (!cfg || !cfg.isFirebaseConfigured || !cfg.isFirebaseConfigured()) {
    window.GITES_PHOTOS = fallback;
    return;
  }

  const GALLERY_COLLECTION = cfg.GALLERY_COLLECTION || "galerie";

  window.GITES_PHOTOS_PROMISE = (async function () {
    try {
      const appModule = await import(
        "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"
      );
      const firestoreModule = await import(
        "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
      );
      const app = appModule.getApps().length
        ? appModule.getApp()
        : appModule.initializeApp(cfg.firebaseConfig);
      const db = firestoreModule.getFirestore(app);
      const snap = await firestoreModule.getDocs(
        firestoreModule.query(
          firestoreModule.collection(db, GALLERY_COLLECTION),
          firestoreModule.orderBy("order", "asc")
        )
      );

      if (snap.empty) {
        window.GITES_PHOTOS = fallback;
        return;
      }

      const photos = [];
      snap.forEach(function (docSnap) {
        const data = docSnap.data();
        if (data.src) {
          photos.push({
            src: data.src,
            alt: data.alt || "",
          });
        }
      });

      window.GITES_PHOTOS = photos.length ? photos : fallback;
    } catch (error) {
      console.error("Photos Firestore read error:", error);
      window.GITES_PHOTOS = fallback;
    }
  })();
})();
