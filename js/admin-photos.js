(function () {
  "use strict";

  const cfg = window.GITES_HELENE_CONFIG;
  if (!cfg) return;

  const GALLERY_COLLECTION = cfg.GALLERY_COLLECTION || "galerie";

  let deps = null;
  let photoState = [];
  let selectionMode = false;
  let selectedIds = new Set();
  let sortable = null;
  let viewLoaded = false;
  let savingOrder = false;

  const gridEl = document.getElementById("admin-photos-grid");
  const toolbarEl = document.getElementById("admin-photos-toolbar");
  const feedbackEl = document.getElementById("admin-photos-feedback");
  const emptyEl = document.getElementById("admin-photos-empty");
  const countEl = document.getElementById("admin-photos-count");
  const fileInput = document.getElementById("admin-photos-file-input");
  const selectBtn = document.getElementById("admin-photos-select-btn");
  const deleteBtn = document.getElementById("admin-photos-delete-btn");
  const cancelSelectBtn = document.getElementById("admin-photos-cancel-select-btn");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  function currentUser() {
    return deps && deps.getCurrentUser ? deps.getCurrentUser() : null;
  }

  function showFeedback(message, type) {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.className = "admin-inline-feedback " + (type || "");
    feedbackEl.classList.remove("hidden");
  }

  function hideFeedback() {
    if (!feedbackEl) return;
    feedbackEl.classList.add("hidden");
    feedbackEl.textContent = "";
  }

  function staticSeedPhotos() {
    return Array.isArray(window.GITES_PHOTOS) ? window.GITES_PHOTOS.slice() : [];
  }

  function sortByOrder(list) {
    return list.slice().sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });
  }

  async function loadPhotos() {
    hideFeedback();
    photoState = [];

    if (!deps || !deps.db || !deps.collection || !deps.getDocs || !deps.query || !deps.orderBy) {
      showEmptyMessage(
        "Firebase n'est pas configuré. Les photos ne peuvent pas être gérées depuis l'admin."
      );
      render();
      return;
    }

    try {
      const snap = await deps.getDocs(
        deps.query(
          deps.collection(deps.db, GALLERY_COLLECTION),
          deps.orderBy("order", "asc")
        )
      );

      snap.forEach(function (docSnap) {
        const data = docSnap.data();
        photoState.push({
          id: docSnap.id,
          order: typeof data.order === "number" ? data.order : 0,
          src: data.src || "",
          alt: data.alt || "",
          source: data.source || "static",
          storagePath: data.storagePath || null,
          publicId: data.publicId || null,
        });
      });

      photoState = sortByOrder(photoState);

      if (!photoState.length) {
        const seed = staticSeedPhotos();
        if (seed.length) {
          showFeedback("Synchronisation des photos du site…", "");
          await seedFromStatic({ auto: true });
          return;
        }
        showEmptyMessage(
          'Aucune photo dans la galerie. Cliquez sur « + » pour en ajouter.'
        );
      } else if (emptyEl) {
        emptyEl.classList.add("hidden");
      }

      viewLoaded = true;
      render();
      initSortable();
    } catch (error) {
      console.error("Gallery load error:", error);
      showFeedback(
        error && error.code === "permission-denied"
          ? "Accès Firestore refusé. Vérifiez les règles et la connexion admin."
          : "Impossible de charger la galerie.",
        "is-error"
      );
    }
  }

  function showEmptyMessage(message) {
    if (!emptyEl) return;
    emptyEl.innerHTML = "<p>" + escapeHtml(message) + "</p>";
    emptyEl.classList.remove("hidden");
  }

  async function seedFromStatic(options) {
    const opts = options || {};
    const seed = staticSeedPhotos();
    if (!seed.length) {
      showFeedback("Aucune photo de référence trouvée.", "is-error");
      return;
    }
    if (!deps || !deps.db || !deps.writeBatch || !deps.doc || !deps.collection || !deps.serverTimestamp) {
      return;
    }

    hideFeedback();
    if (emptyEl) emptyEl.classList.add("hidden");

    try {
      const batch = deps.writeBatch(deps.db);
      const col = deps.collection(deps.db, GALLERY_COLLECTION);

      for (let i = 0; i < seed.length; i++) {
        const ref = deps.doc(col);
        batch.set(ref, {
          order: i,
          src: seed[i].src,
          alt: seed[i].alt || "",
          source: "static",
          storagePath: null,
          publicId: null,
          updatedBy: currentUser() || "Admin",
          updatedAt: deps.serverTimestamp(),
        });
      }

      await batch.commit();
      if (deps.logHistory) {
        await deps.logHistory("Galerie synchronisée depuis le site (" + seed.length + " photos)");
      }
      showFeedback(
        seed.length + " photos synchronisées — les modifications ici mettent à jour la page Photos du site.",
        "is-success"
      );
      await loadPhotos();
    } catch (error) {
      console.error("Gallery seed error:", error);
      showFeedback("Erreur lors de la synchronisation.", "is-error");
      if (!opts.auto) return;
      showEmptyMessage(
        'Impossible de synchroniser automatiquement. Rechargez la page ou ajoutez des photos avec « + ».'
      );
    }
  }

  function updateCount() {
    if (!countEl) return;
    const n = photoState.length;
    countEl.textContent = n ? n + " photo" + (n > 1 ? "s" : "") : "";
  }

  function render() {
    if (!gridEl) return;
    updateCount();
    gridEl.innerHTML = "";

    const addTile = document.createElement("button");
    addTile.type = "button";
    addTile.className = "admin-photo-card admin-photo-card--add";
    addTile.setAttribute("aria-label", "Ajouter des photos");
    addTile.innerHTML =
      '<span class="admin-photo-card__add-inner">' +
      '<span class="admin-photo-card__add-icon" aria-hidden="true">+</span>' +
      '<span class="admin-photo-card__add-label">Ajouter</span>' +
      "</span>";
    addTile.addEventListener("click", openFilePicker);
    gridEl.appendChild(addTile);

    photoState.forEach(function (photo, index) {
      const card = document.createElement("article");
      card.className =
        "admin-photo-card" +
        (selectionMode ? " is-select-mode" : "") +
        (selectedIds.has(photo.id) ? " is-selected" : "");
      card.dataset.photoId = photo.id;

      card.innerHTML =
        '<div class="admin-photo-card__drag" aria-hidden="true" title="Glisser pour réordonner">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>' +
        "</div>" +
        '<label class="admin-photo-card__select">' +
        '<input type="checkbox" class="admin-photo-card__checkbox" data-select-photo="' +
        escapeAttr(photo.id) +
        '"' +
        (selectedIds.has(photo.id) ? " checked" : "") +
        ">" +
        '<span class="admin-photo-card__select-ui" aria-hidden="true"></span>' +
        "</label>" +
        '<div class="admin-photo-card__media">' +
        '<img src="' +
        escapeAttr(photo.src) +
        '" alt="" loading="lazy" decoding="async">' +
        "</div>" +
        '<div class="admin-photo-card__meta">' +
        '<label class="admin-photo-card__alt-label" for="admin-photo-alt-' +
        escapeAttr(photo.id) +
        '">Texte alternatif</label>' +
        '<textarea id="admin-photo-alt-' +
        escapeAttr(photo.id) +
        '" class="admin-photo-card__alt" rows="1" data-alt-photo="' +
        escapeAttr(photo.id) +
        '" maxlength="200" placeholder="Décrivez ce que montre la photo" aria-describedby="admin-photo-alt-hint-' +
        escapeAttr(photo.id) +
        '">' +
        escapeHtml(photo.alt) +
        "</textarea>" +
        '<span id="admin-photo-alt-hint-' +
        escapeAttr(photo.id) +
        '" class="admin-photo-card__alt-hint">Accessibilité et SEO image — pas la meta description de la page</span>' +
        '<button type="button" class="admin-photo-card__replace" data-replace-photo="' +
        escapeAttr(photo.id) +
        '">Remplacer l\'image</button>' +
        '<button type="button" class="admin-photo-card__delete" data-delete-photo="' +
        escapeAttr(photo.id) +
        '">Supprimer l\'image</button>' +
        "</div>";

      gridEl.appendChild(card);
    });

    bindCardEvents();
    updateSelectionToolbar();
  }

  function resizeAltField(field, expand) {
    if (!field) return;
    if (!expand) {
      field.style.height = "";
      field.rows = 1;
      field.classList.remove("is-expanded");
      return;
    }
    field.classList.add("is-expanded");
    field.style.height = "auto";
    field.style.height = field.scrollHeight + "px";
  }

  function bindCardEvents() {
    if (!gridEl) return;

    gridEl.querySelectorAll("[data-alt-photo]").forEach(function (field) {
      field.addEventListener("click", function (event) {
        event.stopPropagation();
      });
      field.addEventListener("focus", function () {
        resizeAltField(field, true);
      });
      field.addEventListener("input", function () {
        resizeAltField(field, true);
      });
      field.addEventListener("blur", function () {
        resizeAltField(field, false);
        saveAlt(field.dataset.altPhoto, field.value.trim());
      });
      field.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          field.blur();
        }
      });
    });

    gridEl.querySelectorAll("[data-replace-photo]").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.stopPropagation();
        if (!fileInput) return;
        fileInput.dataset.replaceId = btn.dataset.replacePhoto;
        fileInput.click();
      });
    });

    gridEl.querySelectorAll("[data-delete-photo]").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.stopPropagation();
        deleteOnePhoto(btn.dataset.deletePhoto);
      });
    });

    gridEl.querySelectorAll("[data-select-photo]").forEach(function (checkbox) {
      checkbox.addEventListener("click", function (event) {
        event.stopPropagation();
      });
      checkbox.addEventListener("change", function () {
        togglePhotoSelection(checkbox.dataset.selectPhoto, checkbox.checked);
      });
    });

    gridEl.querySelectorAll(".admin-photo-card:not(.admin-photo-card--add)").forEach(function (card) {
      card.addEventListener("click", function (event) {
        if (!selectionMode) return;
        if (event.target.closest(".admin-photo-card__select, input, button, textarea")) return;
        const checkbox = card.querySelector("[data-select-photo]");
        if (!checkbox) return;
        checkbox.checked = !checkbox.checked;
        togglePhotoSelection(checkbox.dataset.selectPhoto, checkbox.checked);
      });
    });
  }

  function togglePhotoSelection(photoId, selected) {
    if (selected) selectedIds.add(photoId);
    else selectedIds.delete(photoId);
    const card = gridEl && gridEl.querySelector('[data-photo-id="' + photoId + '"]');
    if (card) card.classList.toggle("is-selected", selected);
    updateSelectionToolbar();
  }

  function initSortable() {
    if (!gridEl || typeof Sortable === "undefined") return;
    if (sortable) {
      sortable.destroy();
      sortable = null;
    }
    if (selectionMode) return;

    sortable = Sortable.create(gridEl, {
      animation: 180,
      handle: ".admin-photo-card__drag",
      draggable: ".admin-photo-card:not(.admin-photo-card--add)",
      filter: ".admin-photo-card--add",
      ghostClass: "admin-photo-card--ghost",
      chosenClass: "admin-photo-card--chosen",
      onEnd: function () {
        persistOrderFromDom();
      },
    });
  }

  async function persistOrderFromDom() {
    if (!gridEl || savingOrder) return;
    const cards = gridEl.querySelectorAll(".admin-photo-card:not(.admin-photo-card--add)");
    const newOrder = [];
    cards.forEach(function (card, index) {
      const id = card.dataset.photoId;
      newOrder.push({ id: id, order: index });
      const item = photoState.find(function (p) {
        return p.id === id;
      });
      if (item) item.order = index;
    });

    if (!deps || !deps.db || !deps.writeBatch || !deps.doc) return;

    savingOrder = true;
    try {
      const batch = deps.writeBatch(deps.db);
      newOrder.forEach(function (entry) {
        batch.update(deps.doc(deps.db, GALLERY_COLLECTION, entry.id), {
          order: entry.order,
          updatedBy: currentUser() || "Admin",
          updatedAt: deps.serverTimestamp(),
        });
      });
      await batch.commit();
      photoState = sortByOrder(photoState);
      if (deps.logHistory) await deps.logHistory("Ordre de la galerie photos mis à jour");
    } catch (error) {
      console.error("Order save error:", error);
      showFeedback("Erreur lors de l'enregistrement de l'ordre.", "is-error");
      await loadPhotos();
    } finally {
      savingOrder = false;
    }
  }

  async function saveAlt(photoId, alt) {
    const photo = photoState.find(function (p) {
      return p.id === photoId;
    });
    if (!photo || photo.alt === alt) return;

    if (!deps || !deps.updateDoc || !deps.doc) return;

    try {
      await deps.updateDoc(deps.doc(deps.db, GALLERY_COLLECTION, photoId), {
        alt: alt,
        updatedBy: currentUser() || "Admin",
        updatedAt: deps.serverTimestamp(),
      });
      photo.alt = alt;
      if (deps.logHistory) await deps.logHistory("Texte alternatif photo modifié");
      showFeedback("Texte alternatif enregistré.", "is-success");
    } catch (error) {
      console.error("Alt save error:", error);
      showFeedback("Erreur lors de l'enregistrement.", "is-error");
    }
  }

  function openFilePicker() {
    if (!fileInput) return;
    delete fileInput.dataset.replaceId;
    fileInput.click();
  }

  async function uploadImageFile(file) {
    if (!deps.isCloudinaryImagesConfigured || !deps.isCloudinaryImagesConfigured()) {
      throw new Error(
        "Preset Cloudinary images manquant. Créez le preset « gites-helene-gallery » dans Cloudinary, puis ajoutez imageUploadPreset dans config.local.js."
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", deps.cloudinaryConfig.imageUploadPreset);
    formData.append("folder", "gites-helene/gallery");
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/" + deps.cloudinaryConfig.cloudName + "/image/upload",
      { method: "POST", body: formData }
    );
    const result = await response.json();
    if (!response.ok || result.error) {
      throw new Error(
        result.error && result.error.message ? result.error.message : "Échec de l'envoi Cloudinary"
      );
    }
    return {
      src: result.secure_url,
      storagePath: null,
      source: "cloudinary",
      publicId: result.public_id,
    };
  }

  async function handleFiles(files, replaceId) {
    if (!files || !files.length) return;
    hideFeedback();

    const fileList = Array.from(files).filter(function (f) {
      return f.type.startsWith("image/");
    });
    if (!fileList.length) {
      showFeedback("Choisissez un fichier image (JPEG, PNG, WebP).", "is-error");
      return;
    }

    if (replaceId) {
      const file = fileList[0];
      showFeedback("Envoi en cours…", "");
      try {
        const uploaded = await uploadImageFile(file);
        const photo = photoState.find(function (p) {
          return p.id === replaceId;
        });
        if (!photo) return;

        if (photo.storagePath && deps.deleteObject && deps.storageRef) {
          try {
            await deps.deleteObject(deps.storageRef(deps.storage, photo.storagePath));
          } catch (e) {
            console.warn("Old image delete:", e);
          }
        }

        await deps.updateDoc(deps.doc(deps.db, GALLERY_COLLECTION, replaceId), {
          src: uploaded.src,
          storagePath: uploaded.storagePath,
          source: uploaded.source,
          publicId: uploaded.publicId,
          updatedBy: currentUser() || "Admin",
          updatedAt: deps.serverTimestamp(),
        });

        photo.src = uploaded.src;
        photo.storagePath = uploaded.storagePath;
        photo.source = uploaded.source;
        photo.publicId = uploaded.publicId;
        if (deps.logHistory) await deps.logHistory("Photo remplacée dans la galerie");
        showFeedback("Photo remplacée.", "is-success");
        render();
        initSortable();
      } catch (error) {
        console.error("Replace error:", error);
        showFeedback(error.message || "Erreur lors du remplacement.", "is-error");
      }
      return;
    }

    let added = 0;
    const baseOrder =
      photoState.length > 0
        ? Math.max.apply(
            null,
            photoState.map(function (p) {
              return p.order;
            })
          ) + 1
        : 0;

    for (let i = 0; i < fileList.length; i++) {
      showFeedback("Envoi " + (i + 1) + "/" + fileList.length + "…", "");
      try {
        const uploaded = await uploadImageFile(fileList[i]);
        const alt = fileList[i].name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        await deps.addDoc(deps.collection(deps.db, GALLERY_COLLECTION), {
          order: baseOrder + i,
          src: uploaded.src,
          alt: alt,
          source: uploaded.source,
          storagePath: uploaded.storagePath,
          publicId: uploaded.publicId,
          updatedBy: currentUser() || "Admin",
          updatedAt: deps.serverTimestamp(),
        });
        added++;
      } catch (error) {
        console.error("Upload error:", error);
        showFeedback(error.message || "Erreur lors de l'ajout.", "is-error");
        break;
      }
    }

    if (added) {
      if (deps.logHistory) await deps.logHistory(added + " photo(s) ajoutée(s) à la galerie");
      showFeedback(added + " photo(s) ajoutée(s).", "is-success");
      if (emptyEl) emptyEl.classList.add("hidden");
      await loadPhotos();
    }
  }

  async function deletePhotos(ids, options) {
    const opts = options || {};
    const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
    if (!uniqueIds.length) return;

    hideFeedback();

    try {
      for (let i = 0; i < uniqueIds.length; i++) {
        const photo = photoState.find(function (p) {
          return p.id === uniqueIds[i];
        });
        if (photo && photo.storagePath && deps.deleteObject && deps.storageRef) {
          try {
            await deps.deleteObject(deps.storageRef(deps.storage, photo.storagePath));
          } catch (e) {
            console.warn("Storage delete:", e);
          }
        }
        await deps.deleteDoc(deps.doc(deps.db, GALLERY_COLLECTION, uniqueIds[i]));
      }

      const count = uniqueIds.length;
      if (deps.logHistory) {
        await deps.logHistory(count + " photo(s) supprimée(s) de la galerie");
      }
      if (opts.exitSelection) exitSelectionMode();
      showFeedback(count + " photo(s) supprimée(s).", "is-success");
      await loadPhotos();
    } catch (error) {
      console.error("Delete error:", error);
      showFeedback("Erreur lors de la suppression.", "is-error");
    }
  }

  async function deleteOnePhoto(photoId) {
    if (!photoId) return;
    if (!window.confirm("Supprimer cette photo de la galerie ?")) return;
    await deletePhotos([photoId], { exitSelection: false });
  }

  async function deleteSelected() {
    if (!selectedIds.size) return;
    const count = selectedIds.size;
    if (
      !window.confirm(
        "Supprimer " + count + " photo" + (count > 1 ? "s" : "") + " de la galerie ?"
      )
    ) {
      return;
    }

    await deletePhotos(Array.from(selectedIds), { exitSelection: true });
  }

  function enterSelectionMode() {
    selectionMode = true;
    selectedIds.clear();
    if (sortable) {
      sortable.destroy();
      sortable = null;
    }
    render();
    updateSelectionToolbar();
  }

  function exitSelectionMode() {
    selectionMode = false;
    selectedIds.clear();
    render();
    initSortable();
    updateSelectionToolbar();
  }

  function updateSelectionToolbar() {
    if (!selectBtn || !deleteBtn || !cancelSelectBtn) return;

    if (selectionMode) {
      selectBtn.classList.add("hidden");
      cancelSelectBtn.classList.remove("hidden");
      deleteBtn.classList.remove("hidden");
      deleteBtn.disabled = selectedIds.size === 0;
      deleteBtn.textContent =
        selectedIds.size > 0
          ? "Supprimer (" + selectedIds.size + ")"
          : "Supprimer la sélection";
    } else {
      selectBtn.classList.remove("hidden");
      cancelSelectBtn.classList.add("hidden");
      deleteBtn.classList.add("hidden");
    }
  }

  function onActivate() {
    if (!viewLoaded) loadPhotos();
    else {
      render();
      initSortable();
    }
  }

  function configure(adminDeps) {
    deps = adminDeps;
  }

  if (selectBtn) selectBtn.addEventListener("click", enterSelectionMode);
  if (cancelSelectBtn) cancelSelectBtn.addEventListener("click", exitSelectionMode);
  if (deleteBtn) deleteBtn.addEventListener("click", deleteSelected);

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      const replaceId = fileInput.dataset.replaceId || "";
      handleFiles(fileInput.files, replaceId || null);
      fileInput.value = "";
      delete fileInput.dataset.replaceId;
    });
  }

  window.GitesAdminPhotos = {
    configure: configure,
    onActivate: onActivate,
  };
})();
