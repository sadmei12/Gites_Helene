(function () {
  "use strict";

  const cfg = window.GITES_HELENE_CONFIG;
  if (!cfg) return;

  const {
    DEFAULT_PERIODS,
    DEFAULT_PDF_URLS,
    BOOKING_URLS,
    TARIFS_STORAGE_KEY,
    FIRESTORE_COLLECTION,
    isFirebaseConfigured,
    firebaseConfig,
  } = cfg;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildFromDefaults() {
    const data = {};
    Object.keys(DEFAULT_PERIODS).forEach(function (giteId) {
      data[giteId] = {
        periods: DEFAULT_PERIODS[giteId].map(function (p) {
          return { label: p.label, price: p.price };
        }),
        pdfUrl: DEFAULT_PDF_URLS[giteId] || "",
      };
    });
    return data;
  }

  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(TARIFS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  async function loadFromFirestore() {
    if (!isFirebaseConfigured()) return null;
    try {
      const appModule = await import(
        "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"
      );
      const firestoreModule = await import(
        "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
      );
      const app = appModule.getApps().length
        ? appModule.getApp()
        : appModule.initializeApp(firebaseConfig);
      const db = firestoreModule.getFirestore(app);
      const snap = await firestoreModule.getDocs(
        firestoreModule.collection(db, FIRESTORE_COLLECTION)
      );
      if (snap.empty) return null;
      const data = {};
      snap.forEach(function (docSnap) {
        const remote = docSnap.data();
        data[docSnap.id] = {
          periods: Array.isArray(remote.periods) ? remote.periods : [],
          pdfUrl: remote.pdfUrl || DEFAULT_PDF_URLS[docSnap.id] || "",
        };
      });
      return data;
    } catch (error) {
      console.error("Tarifs Firestore read error:", error);
      return null;
    }
  }

  async function loadFromJsonFile() {
    try {
      const response = await fetch("data/tarifs.json", { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async function loadAllTarifs() {
    const remote = await loadFromFirestore();
    if (remote && Object.keys(remote).length) return remote;

    const local = loadFromLocalStorage();
    if (local && Object.keys(local).length) return local;

    const file = await loadFromJsonFile();
    if (file && Object.keys(file).length) return file;

    return buildFromDefaults();
  }

  async function resolvePdfUrl(giteId, pdfUrl) {
    const fallback = DEFAULT_PDF_URLS[giteId] || pdfUrl || "";
    if (!pdfUrl || pdfUrl.indexOf("res.cloudinary.com") === -1) {
      return pdfUrl || fallback;
    }
    try {
      const response = await fetch(pdfUrl, { method: "HEAD" });
      if (response.ok) return pdfUrl;
    } catch (error) {
      console.warn("PDF Cloudinary inaccessible pour " + giteId + ":", error);
    }
    return fallback;
  }

  async function resolveAllPdfUrls(allTarifs) {
    const giteIds = Object.keys(allTarifs);
    await Promise.all(
      giteIds.map(async function (giteId) {
        allTarifs[giteId].pdfUrl = await resolvePdfUrl(
          giteId,
          allTarifs[giteId].pdfUrl
        );
      })
    );
    return allTarifs;
  }

  function renderGiteTarifs(giteId, allTarifs) {
    const wrap = document.querySelector('[data-tarifs-gite="' + giteId + '"]');
    if (!wrap) return;

    const tbody = wrap.querySelector("[data-tarifs-body]");
    const pdfLink = wrap.querySelector("[data-tarifs-pdf]");
    const bookingLink = wrap.querySelector("[data-booking-link]");
    const giteData = allTarifs[giteId];

    if (!tbody || !giteData) return;

    const periods = Array.isArray(giteData.periods) ? giteData.periods : [];
    tbody.innerHTML = "";

    if (!periods.length) {
      tbody.innerHTML =
        '<tr><td colspan="2">Tarifs disponibles sur demande.</td></tr>';
    } else {
      periods.forEach(function (period) {
        const row = document.createElement("tr");
        row.innerHTML =
          "<td>" +
          escapeHtml(period.label || "") +
          "</td><td>" +
          escapeHtml(period.price || "") +
          "</td>";
        tbody.appendChild(row);
      });
    }

    if (pdfLink) {
      const pdfUrl = giteData.pdfUrl || DEFAULT_PDF_URLS[giteId] || pdfLink.getAttribute("href");
      if (pdfUrl) pdfLink.setAttribute("href", pdfUrl);
    }

    if (bookingLink && BOOKING_URLS[giteId]) {
      bookingLink.setAttribute("href", BOOKING_URLS[giteId]);
    }
  }

  function renderAll(allTarifs) {
    document.querySelectorAll("[data-tarifs-gite]").forEach(function (wrap) {
      renderGiteTarifs(wrap.getAttribute("data-tarifs-gite"), allTarifs);
    });
  }

  async function init() {
    let allTarifs = await loadAllTarifs();
    allTarifs = await resolveAllPdfUrls(allTarifs);
    renderAll(allTarifs);

    window.addEventListener("storage", function (event) {
      if (event.key !== TARIFS_STORAGE_KEY) return;
      try {
        const updated = event.newValue ? JSON.parse(event.newValue) : buildFromDefaults();
        renderAll(updated);
      } catch (error) {
        console.error("Tarifs storage sync error:", error);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
