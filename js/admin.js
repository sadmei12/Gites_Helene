(function () {
  "use strict";

  const cfg = window.GITES_HELENE_CONFIG;
  if (!cfg) {
    console.error("Configuration admin introuvable — chargez config.js avant admin.js.");
    return;
  }

  const {
    firebaseConfig,
    cloudinaryConfig,
    defaultPasswords,
    defaultEmails,
    DEFAULT_PERIODS,
    GITES,
    ADMIN_USERS,
    STORAGE_KEY,
    PASSWORDS_STORAGE_KEY,
    EMAILS_STORAGE_KEY,
    TARIFS_STORAGE_KEY,
    HISTORY_STORAGE_KEY,
    FIRESTORE_COLLECTION,
    HISTORY_COLLECTION,
    isFirebaseConfigured,
    isCloudinaryConfigured,
  } = cfg;

const loginScreen = document.getElementById("login-screen");
const adminApp = document.getElementById("admin-app");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const passwordInput = document.getElementById("password");
const rememberCheckbox = document.getElementById("remember-me");
const sidebar = document.getElementById("admin-sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarClose = document.getElementById("sidebar-close");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const navLinks = document.querySelectorAll("[data-admin-view]");
const adminViews = document.querySelectorAll(".admin-view");
const gitesAccordion = document.getElementById("gites-accordion");
const saveBtn = document.getElementById("save-btn");
const saveFeedback = document.getElementById("save-feedback");
const historyBody = document.getElementById("history-body");
const settingsEmail = document.getElementById("settings-email");
const settingsEmailBtn = document.getElementById("settings-email-btn");
const settingsEmailSaveBtn = document.getElementById("settings-email-save-btn");
const settingsEmailFeedback = document.getElementById("settings-email-feedback");
const passwordPanel = document.getElementById("password-panel");
const passwordToggleBtn = document.getElementById("password-toggle-btn");
const passwordForm = document.getElementById("password-form");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const confirmPasswordInput = document.getElementById("confirm-password");
const passwordFeedback = document.getElementById("password-feedback");
const logoutBtn = document.getElementById("logout-btn");

let selectedUser = null;
let currentUser = null;
let giteState = [];
let expandedGiteId = null;
let db = null;
let doc;
let getDoc;
let setDoc;
let collection;
let getDocs;
let addDoc;
let query;
let orderBy;
let limit;
let serverTimestamp;

let labelEditTarget = null;

const PERIOD_PENCIL_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">' +
  '<path d="M12 20h9"/>' +
  '<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>' +
  "</svg>";

const PERIOD_DELETE_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">' +
  '<path d="M3 6h18"/>' +
  '<path d="M8 6V4h8v2"/>' +
  '<path d="M19 6l-1 14H6L5 6"/>' +
  '<path d="M10 11v6M14 11v6"/>' +
  "</svg>";

async function initFirebase() {
  if (!isFirebaseConfigured()) return;
  try {
    const appModule = await import(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"
    );
    const firestoreModule = await import(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
    );
    const app = appModule.initializeApp(firebaseConfig);
    db = firestoreModule.getFirestore(app);
    ({
      doc,
      getDoc,
      setDoc,
      collection,
      getDocs,
      addDoc,
      query,
      orderBy,
      limit,
      serverTimestamp,
    } = firestoreModule);
  } catch (error) {
    console.error("Firebase init error:", error);
  }
}

function loadPasswords() {
  const passwords = Object.assign({}, defaultPasswords);
  try {
    const stored = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (stored) Object.assign(passwords, JSON.parse(stored));
  } catch (error) {
    console.error("Password storage read error:", error);
  }
  return passwords;
}

function savePasswordForUser(userName, newPassword) {
  const passwords = loadPasswords();
  passwords[userName] = newPassword;
  localStorage.setItem(
    PASSWORDS_STORAGE_KEY,
    JSON.stringify({ Hélène: passwords.Hélène, Lily: passwords.Lily })
  );
}

function getPassword(userName) {
  return loadPasswords()[userName];
}

function loadEmails() {
  const emails = Object.assign({}, defaultEmails);
  try {
    const stored = localStorage.getItem(EMAILS_STORAGE_KEY);
    if (stored) Object.assign(emails, JSON.parse(stored));
  } catch (error) {
    console.error("Email storage read error:", error);
  }
  return emails;
}

function saveEmailForUser(userName, newEmail) {
  const emails = loadEmails();
  emails[userName] = newEmail;
  localStorage.setItem(
    EMAILS_STORAGE_KEY,
    JSON.stringify({ Hélène: emails.Hélène, Lily: emails.Lily })
  );
}

function getEmail(userName) {
  return loadEmails()[userName];
}

function loadLocalTarifs() {
  try {
    const stored = localStorage.getItem(TARIFS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveLocalTarifs(data) {
  localStorage.setItem(TARIFS_STORAGE_KEY, JSON.stringify(data));
}

function loadLocalHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(entries) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, 100)));
}

function clonePeriodsForSave(periods) {
  return periods.map(function (p) {
    return { label: p.label, price: p.price };
  });
}

function createPeriodFromDefault(period) {
  return {
    label: period.label,
    price: period.price,
    defaultLabel: period.label,
    defaultPrice: period.price,
  };
}

function enrichPeriod(period, giteId) {
  const defaults = DEFAULT_PERIODS[giteId] || [];
  const def = defaults.find(function (d) {
    return d.label === period.label;
  });
  return {
    label: period.label,
    price: period.price,
    defaultLabel: def ? def.label : period.defaultLabel || null,
    defaultPrice: def ? def.price : period.defaultPrice ?? null,
  };
}

function clonePeriods(periods, giteId) {
  return periods.map(function (p) {
    if (p.defaultPrice !== undefined || p.defaultLabel !== undefined) {
      return {
        label: p.label,
        price: p.price,
        defaultLabel: p.defaultLabel ?? null,
        defaultPrice: p.defaultPrice ?? null,
      };
    }
    return enrichPeriod(p, giteId);
  });
}

function isPriceModified(period) {
  if (period.defaultPrice !== null && period.defaultPrice !== undefined) {
    return period.price !== period.defaultPrice;
  }
  return period.price !== "";
}

function updatePriceFieldAppearance(input, period) {
  input.classList.toggle("is-modified", isPriceModified(period));
}

function defaultGiteData(gite) {
  const defaults = DEFAULT_PERIODS[gite.id] || [];
  return {
    id: gite.id,
    name: gite.name,
    periods: defaults.map(createPeriodFromDefault),
    pdfUrl: "",
    price: gite.defaultPrice,
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function formatFrenchDate(date) {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatHistoryDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function showLoginError(show) {
  loginError.classList.toggle("hidden", !show);
}

function setPasswordFieldVisible(input, visible) {
  input.type = visible ? "text" : "password";
  const toggle = document.querySelector('[data-password-toggle][aria-controls="' + input.id + '"]');
  if (!toggle) return;
  toggle.classList.toggle("is-visible", visible);
  toggle.setAttribute("aria-label", visible ? "Masquer le mot de passe" : "Afficher le mot de passe");
}

function resetPasswordVisibility() {
  document.querySelectorAll(".password-field__input").forEach(function (input) {
    setPasswordFieldVisible(input, false);
  });
}

function initPasswordToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      const input = document.getElementById(toggle.getAttribute("aria-controls"));
      if (!input) return;
      setPasswordFieldVisible(input, input.type === "password");
    });
  });
}

function openSidebar() {
  sidebar.classList.add("is-open");
  sidebarBackdrop.classList.add("is-visible");
  sidebarBackdrop.setAttribute("aria-hidden", "false");
  sidebarToggle.setAttribute("aria-expanded", "true");
}

function closeSidebar() {
  sidebar.classList.remove("is-open");
  sidebarBackdrop.classList.remove("is-visible");
  sidebarBackdrop.setAttribute("aria-hidden", "true");
  sidebarToggle.setAttribute("aria-expanded", "false");
}

function setActiveView(viewName) {
  if (viewName !== "parametres" && currentUser) {
    resetEmailField(currentUser);
  }
  navLinks.forEach(function (link) {
    const isActive = link.dataset.adminView === viewName;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  adminViews.forEach(function (view) {
    view.classList.toggle("hidden", view.dataset.adminView !== viewName);
  });
  closeSidebar();
}

function showAdmin(userName) {
  currentUser = userName;
  loginScreen.classList.add("hidden");
  adminApp.classList.remove("hidden");
  closeSidebar();
  resetEmailField(userName);
  passwordPanel.classList.add("hidden");
  passwordForm.reset();
  resetPasswordVisibility();
  hidePasswordFeedback();
  setActiveView("tarifs");
  loadGites();
  loadHistory();
}

function showLogin() {
  currentUser = null;
  adminApp.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  closeSidebar();
  passwordInput.value = "";
  resetPasswordVisibility();
  showLoginError(false);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function lockEmailField() {
  settingsEmail.readOnly = true;
  settingsEmailBtn.classList.remove("hidden");
  settingsEmailSaveBtn.classList.add("hidden");
}

function unlockEmailField() {
  settingsEmail.readOnly = false;
  settingsEmailBtn.classList.add("hidden");
  settingsEmailSaveBtn.classList.remove("hidden");
  settingsEmail.focus();
  settingsEmail.select();
}

function resetEmailField(userName) {
  settingsEmail.value = getEmail(userName || currentUser);
  lockEmailField();
  hideEmailFeedback();
}

function hideEmailFeedback() {
  settingsEmailFeedback.classList.add("hidden");
  settingsEmailFeedback.textContent = "";
  settingsEmailFeedback.classList.remove("is-success", "is-error");
}

function showEmailFeedback(message, type) {
  settingsEmailFeedback.textContent = message;
  settingsEmailFeedback.className = "admin-inline-feedback " + type;
  settingsEmailFeedback.classList.remove("hidden");
}

function hidePasswordFeedback() {
  passwordFeedback.classList.add("hidden");
  passwordFeedback.textContent = "";
  passwordFeedback.classList.remove("is-success", "is-error");
}

function showPasswordFeedback(message, type) {
  passwordFeedback.textContent = message;
  passwordFeedback.className = "admin-inline-feedback " + type;
  passwordFeedback.classList.remove("hidden");
}

async function logHistory(label) {
  const entry = {
    label: label,
    user: currentUser,
    date: new Date().toISOString(),
  };

  const local = loadLocalHistory();
  local.unshift(entry);
  saveLocalHistory(local);

  if (db) {
    try {
      await addDoc(collection(db, HISTORY_COLLECTION), {
        label: label,
        user: currentUser,
        date: serverTimestamp(),
      });
    } catch (error) {
      console.error("History write error:", error);
    }
  }

  loadHistory();
}

async function loadGites() {
  giteState = [];
  const localTarifs = loadLocalTarifs();

  for (const gite of GITES) {
    let data = defaultGiteData(gite);

    if (localTarifs[gite.id]) {
      const local = localTarifs[gite.id];
      data.periods = clonePeriods(local.periods || data.periods, gite.id);
      data.pdfUrl = local.pdfUrl || "";
      data.price = local.price || gite.defaultPrice;
    }

    if (db) {
      try {
        const snap = await getDoc(doc(db, FIRESTORE_COLLECTION, gite.id));
        if (snap.exists()) {
          const remote = snap.data();
          if (Array.isArray(remote.periods) && remote.periods.length) {
            data.periods = clonePeriods(remote.periods, gite.id);
          }
          data.pdfUrl = remote.pdfUrl || data.pdfUrl;
          data.price = remote.price || data.price;
        }
      } catch (error) {
        console.error("Firestore read error:", error);
      }
    }

    giteState.push({
      id: gite.id,
      name: gite.name,
      periods: data.periods,
      pdfUrl: data.pdfUrl,
      pendingPdfUrl: null,
      price: data.price,
      uploadStatus: "",
    });
  }

  if (!expandedGiteId && giteState.length) expandedGiteId = giteState[0].id;
  renderGites();
}

function renderGites() {
  gitesAccordion.innerHTML = "";

  giteState.forEach(function (gite, index) {
    const isOpen = gite.id === expandedGiteId;
    const article = document.createElement("article");
    article.className = "admin-gite" + (isOpen ? " is-open" : "");

    const pdfUrl = gite.pendingPdfUrl || gite.pdfUrl;

    article.innerHTML =
      '<button type="button" class="admin-gite__toggle" aria-expanded="' +
      isOpen +
      '" data-gite-id="' +
      escapeAttr(gite.id) +
      '">' +
      '<span class="admin-gite__name">' +
      escapeHtml(gite.name) +
      "</span>" +
      '<span class="admin-gite__chevron" aria-hidden="true"></span>' +
      "</button>" +
      '<div class="admin-gite__panel" id="panel-' +
      escapeAttr(gite.id) +
      '">' +
      '<div class="admin-tarif-table">' +
      '<div class="admin-tarif-table__head">' +
      "<span>Période</span><span>Prix / semaine</span>" +
      "</div>" +
      '<div class="admin-tarif-table__body" data-periods="' +
      index +
      '"></div>' +
      "</div>" +
      '<button type="button" class="admin-add-period" data-add-period="' +
      index +
      '">+ Ajouter une période</button>' +
      '<div class="admin-pdf-row">' +
      '<label class="admin-pdf-upload">' +
      "Importer un pdf" +
      '<input type="file" accept="application/pdf,.pdf" data-pdf-index="' +
      index +
      '">' +
      "</label>" +
      '<div class="admin-pdf-url-wrap">' +
      '<input type="url" class="admin-pdf-url" placeholder="URL PDF" value="' +
      escapeAttr(pdfUrl) +
      '" data-pdf-url="' +
      index +
      '">' +
      (pdfUrl
        ? '<button type="button" class="admin-pdf-clear" data-pdf-clear="' +
          index +
          '" aria-label="Effacer l\'URL PDF">&times;</button>'
        : "") +
      "</div>" +
      "</div>" +
      '<p class="admin-pdf-status" data-status="' +
      index +
      '">' +
      escapeHtml(gite.uploadStatus) +
      "</p>" +
      "</div>";

    gitesAccordion.appendChild(article);

    const periodsContainer = article.querySelector(".admin-tarif-table__body");
    gite.periods.forEach(function (period, periodIndex) {
      periodsContainer.appendChild(createPeriodRow(index, periodIndex, period));
    });

    article.querySelector(".admin-gite__toggle").addEventListener("click", function () {
      expandedGiteId = expandedGiteId === gite.id ? null : gite.id;
      renderGites();
    });

    article.querySelector("[data-add-period]").addEventListener("click", function () {
      const periodIndex = giteState[index].periods.length;
      giteState[index].periods.push({
        label: "Nouvelle période",
        price: "",
        defaultLabel: null,
        defaultPrice: null,
      });
      labelEditTarget = { giteIndex: index, periodIndex: periodIndex };
      renderGites();
    });

    const fileInput = article.querySelector('input[type="file"]');
    fileInput.addEventListener("change", function () {
      if (fileInput.files && fileInput.files[0]) uploadPdf(index, fileInput.files[0]);
    });

    const pdfUrlInput = article.querySelector(".admin-pdf-url");
    pdfUrlInput.addEventListener("input", function () {
      giteState[index].pendingPdfUrl = pdfUrlInput.value.trim() || null;
      if (!pdfUrlInput.value.trim()) giteState[index].pendingPdfUrl = "";
    });

    const clearBtn = article.querySelector(".admin-pdf-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        giteState[index].pdfUrl = "";
        giteState[index].pendingPdfUrl = "";
        renderGites();
      });
    }
  });
}

function finishLabelEdit(giteIndex, periodIndex, input, cell) {
  const value = input.value.trim();
  if (value) giteState[giteIndex].periods[periodIndex].label = value;
  else input.value = giteState[giteIndex].periods[periodIndex].label;
  cell.classList.remove("is-editing");
}

function createPeriodRow(giteIndex, periodIndex, period) {
  const row = document.createElement("div");
  row.className = "admin-tarif-row";
  row.innerHTML =
    '<div class="admin-period-cell">' +
    '<span class="admin-period-text">' +
    escapeHtml(period.label) +
    "</span>" +
    '<button type="button" class="admin-period-edit" aria-label="Modifier le nom de la période">' +
    PERIOD_PENCIL_ICON +
    "</button>" +
    '<input type="text" class="admin-period-input" value="' +
    escapeAttr(period.label) +
    '" aria-label="Nom de la période">' +
    "</div>" +
    '<input type="text" class="admin-price-input" value="' +
    escapeAttr(period.price) +
    '" placeholder="Prix" aria-label="Prix par semaine">' +
    '<button type="button" class="admin-period-delete" aria-label="Supprimer la période">' +
    PERIOD_DELETE_ICON +
    "</button>";

  const cell = row.querySelector(".admin-period-cell");
  const textEl = row.querySelector(".admin-period-text");
  const editBtn = row.querySelector(".admin-period-edit");
  const labelInput = row.querySelector(".admin-period-input");
  const priceInput = row.querySelector(".admin-price-input");
  const deleteBtn = row.querySelector(".admin-period-delete");

  function syncLabelText() {
    textEl.textContent = giteState[giteIndex].periods[periodIndex].label;
    labelInput.value = giteState[giteIndex].periods[periodIndex].label;
  }

  function startLabelEdit() {
    cell.classList.add("is-editing");
    labelInput.value = giteState[giteIndex].periods[periodIndex].label;
    labelInput.focus();
    labelInput.select();
  }

  editBtn.addEventListener("click", startLabelEdit);

  labelInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      giteState[giteIndex].periods[periodIndex].label = labelInput.value.trim() || period.label;
      finishLabelEdit(giteIndex, periodIndex, labelInput, cell);
      syncLabelText();
    }
    if (event.key === "Escape") {
      labelInput.value = giteState[giteIndex].periods[periodIndex].label;
      finishLabelEdit(giteIndex, periodIndex, labelInput, cell);
    }
  });

  labelInput.addEventListener("blur", function () {
    if (!cell.classList.contains("is-editing")) return;
    giteState[giteIndex].periods[periodIndex].label = labelInput.value.trim() || period.label;
    finishLabelEdit(giteIndex, periodIndex, labelInput, cell);
    syncLabelText();
  });

  priceInput.addEventListener("input", function (event) {
    giteState[giteIndex].periods[periodIndex].price = event.target.value;
    updatePriceFieldAppearance(priceInput, giteState[giteIndex].periods[periodIndex]);
  });

  deleteBtn.addEventListener("click", function () {
    giteState[giteIndex].periods.splice(periodIndex, 1);
    renderGites();
  });

  updatePriceFieldAppearance(priceInput, period);

  if (
    labelEditTarget &&
    labelEditTarget.giteIndex === giteIndex &&
    labelEditTarget.periodIndex === periodIndex
  ) {
    startLabelEdit();
    labelEditTarget = null;
  }

  return row;
}

function setUploadStatus(index, message, type) {
  giteState[index].uploadStatus = message;
  const statusEl = document.querySelector('[data-status="' + index + '"]');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove("is-success", "is-error");
  if (type) statusEl.classList.add(type);
}

async function uploadPdf(index, file) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    setUploadStatus(index, "Veuillez sélectionner un fichier PDF.", "is-error");
    return;
  }

  if (!isCloudinaryConfigured()) {
    setUploadStatus(
      index,
      "Cloudinary non configuré — collez l'URL du PDF dans le champ prévu.",
      "is-error"
    );
    return;
  }

  setUploadStatus(index, "Envoi du PDF en cours…", "");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/" + cloudinaryConfig.cloudName + "/raw/upload",
      { method: "POST", body: formData }
    );
    if (!response.ok) throw new Error("Cloudinary upload failed");
    const result = await response.json();
    giteState[index].pendingPdfUrl = result.secure_url;
    setUploadStatus(index, "PDF prêt à enregistrer.", "is-success");
    renderGites();
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    setUploadStatus(index, "Échec de l'envoi du PDF. Réessayez.", "is-error");
  }
}

async function loadHistory() {
  let entries = loadLocalHistory();

  if (db) {
    try {
      const snap = await getDocs(
        query(collection(db, HISTORY_COLLECTION), orderBy("date", "desc"), limit(50))
      );
      if (!snap.empty) {
        entries = snap.docs.map(function (docSnap) {
          const data = docSnap.data();
          return {
            label: data.label || "Modification",
            user: data.user || "—",
            date: data.date && data.date.toDate ? data.date.toDate().toISOString() : data.date,
          };
        });
      }
    } catch (error) {
      console.error("History read error:", error);
    }
  }

  historyBody.innerHTML = "";
  if (!entries.length) {
    historyBody.innerHTML =
      '<tr><td colspan="3" class="admin-history-empty">Aucune modification enregistrée.</td></tr>';
    return;
  }

  entries.forEach(function (entry) {
    const row = document.createElement("tr");
    row.innerHTML =
      "<td>" +
      escapeHtml(entry.label) +
      "</td><td>" +
      escapeHtml(entry.user || "—") +
      "</td><td>" +
      escapeHtml(formatHistoryDate(entry.date)) +
      "</td>";
    historyBody.appendChild(row);
  });
}

async function saveAll() {
  saveFeedback.classList.add("hidden");
  saveBtn.disabled = true;

  try {
    const localPayload = {};

    for (const gite of giteState) {
      const pdfUrl =
        gite.pendingPdfUrl !== null && gite.pendingPdfUrl !== undefined
          ? gite.pendingPdfUrl
          : gite.pdfUrl;

      const payload = {
        name: gite.name,
        price: gite.price,
        periods: clonePeriodsForSave(gite.periods),
        pdfUrl: pdfUrl || "",
        dernierEditeur: currentUser,
      };

      localPayload[gite.id] = payload;

      if (db) {
        await setDoc(
          doc(db, FIRESTORE_COLLECTION, gite.id),
          Object.assign({}, payload, { dateModification: serverTimestamp() }),
          { merge: true }
        );
      }

      gite.pdfUrl = pdfUrl || "";
      gite.pendingPdfUrl = null;
    }

    saveLocalTarifs(localPayload);
    await logHistory("Tarifs enregistrés");

    saveFeedback.textContent =
      "Tarifs enregistrés — modifié par " +
      currentUser +
      " le " +
      formatFrenchDate(new Date());
    saveFeedback.className = "admin-save-feedback is-success";
    saveFeedback.classList.remove("hidden");
    renderGites();
  } catch (error) {
    console.error("Save error:", error);
    saveFeedback.textContent = "Une erreur est survenue. Réessayez.";
    saveFeedback.className = "admin-save-feedback is-error";
    saveFeedback.classList.remove("hidden");
  } finally {
    saveBtn.disabled = false;
  }
}

document.querySelectorAll(".user-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    selectedUser = btn.dataset.user;
    document.querySelectorAll(".user-btn").forEach(function (b) {
      b.classList.toggle("is-selected", b.dataset.user === selectedUser);
    });
    loginForm.classList.remove("hidden");
    passwordInput.focus();
    showLoginError(false);
  });
});

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (!selectedUser) return;
  if (getPassword(selectedUser) !== passwordInput.value) {
    showLoginError(true);
    return;
  }
  if (rememberCheckbox.checked) localStorage.setItem(STORAGE_KEY, selectedUser);
  else localStorage.removeItem(STORAGE_KEY);
  showAdmin(selectedUser);
});

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem(STORAGE_KEY);
  selectedUser = null;
  showLogin();
});

navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    if (link.id === "logout-btn") return;
    setActiveView(link.dataset.adminView);
  });
});

sidebarToggle.addEventListener("click", function () {
  if (sidebar.classList.contains("is-open")) closeSidebar();
  else openSidebar();
});

sidebarClose.addEventListener("click", closeSidebar);
sidebarBackdrop.addEventListener("click", closeSidebar);

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && sidebar.classList.contains("is-open")) closeSidebar();
});

initPasswordToggles();

settingsEmailBtn.addEventListener("click", function () {
  hideEmailFeedback();
  unlockEmailField();
});

settingsEmailSaveBtn.addEventListener("click", async function () {
  hideEmailFeedback();
  const newEmail = settingsEmail.value.trim();
  if (!newEmail || !isValidEmail(newEmail) || !settingsEmail.checkValidity()) {
    showEmailFeedback("Adresse e-mail invalide.", "is-error");
    settingsEmail.focus();
    return;
  }
  saveEmailForUser(currentUser, newEmail);
  await logHistory("Adresse e-mail modifiée");
  lockEmailField();
  showEmailFeedback("Adresse e-mail mise à jour.", "is-success");
});

passwordToggleBtn.addEventListener("click", function () {
  passwordPanel.classList.toggle("hidden");
  hidePasswordFeedback();
});

passwordForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  hidePasswordFeedback();

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (getPassword(currentUser) !== currentPassword) {
    showPasswordFeedback("Mot de passe actuel incorrect.", "is-error");
    return;
  }
  if (newPassword.length < 6) {
    showPasswordFeedback("Minimum 6 caractères.", "is-error");
    return;
  }
  if (newPassword !== confirmPassword) {
    showPasswordFeedback("Les mots de passe ne correspondent pas.", "is-error");
    return;
  }

  savePasswordForUser(currentUser, newPassword);
  passwordForm.reset();
  resetPasswordVisibility();
  passwordPanel.classList.add("hidden");
  await logHistory("Mot de passe modifié");
  showPasswordFeedback("Mot de passe mis à jour.", "is-success");
});

saveBtn.addEventListener("click", saveAll);

async function boot() {
  await initFirebase();
  const savedUser = localStorage.getItem(STORAGE_KEY);
  if (savedUser && ADMIN_USERS.includes(savedUser)) {
    showAdmin(savedUser);
  }
}

boot();
})();
