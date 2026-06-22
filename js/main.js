document.addEventListener('DOMContentLoaded', function () {
  initSvgSprite();
  initMobileMenu();
  initContactForm();
  initGiteLightbox();
  initGiteCarousels();
  initPhotosPageGallery();
  initPhotoGalleries();
  syncPhotoMasonryHeights();
  window.addEventListener('resize', syncPhotoMasonryHeights);
  window.addEventListener('load', syncPhotoMasonryHeights);
});

function initSvgSprite() {
  var sprite = document.getElementById('svg-sprite');
  if (!sprite) return;

  document.querySelectorAll('svg use').forEach(function (useEl) {
    var svg = useEl.closest('svg');
    if (svg && !svg.getAttribute('viewBox')) {
      svg.setAttribute('viewBox', '0 0 24 24');
    }
  });
}

function initMobileMenu() {
  var toggle = document.querySelector('.menu-toggle');
  var navMobile = document.querySelector('.nav-mobile');

  if (!toggle || !navMobile) return;

  toggle.addEventListener('click', function () {
    var isOpen = navMobile.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    var iconOpen = toggle.querySelector('.icon-open');
    var iconClose = toggle.querySelector('.icon-close');

    if (iconOpen && iconClose) {
      iconOpen.classList.toggle('hidden', isOpen);
      iconClose.classList.toggle('hidden', !isOpen);
    }
  });

  navMobile.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navMobile.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');

      var iconOpen = toggle.querySelector('.icon-open');
      var iconClose = toggle.querySelector('.icon-close');
      if (iconOpen && iconClose) {
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
      }
    });
  });
}

function initContactForm() {
  var form = document.getElementById('contact-form');
  var panel = document.getElementById('contact-form-panel');
  var success = document.getElementById('form-success');

  if (!form || !success) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (panel) panel.classList.add('hidden');
    success.classList.remove('hidden');
  });
}

var giteLightboxState = {
  root: null,
  image: null,
  counter: null,
  items: [],
  index: 0,
  onChange: null,
  open: false
};

function initGiteLightbox() {
  if (giteLightboxState.root) return;

  var lightbox = document.createElement('div');
  lightbox.id = 'gite-lightbox';
  lightbox.className = 'gite-lightbox hidden';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Agrandir la photo');
  lightbox.innerHTML =
    '<div class="gite-lightbox-backdrop" data-lightbox-close></div>' +
    '<div class="gite-lightbox-dialog">' +
    '<button type="button" class="gite-lightbox-close" aria-label="Fermer">&times;</button>' +
    '<button type="button" class="gite-lightbox-prev" aria-label="Photo précédente">&#8249;</button>' +
    '<img class="gite-lightbox-image" alt="">' +
    '<button type="button" class="gite-lightbox-next" aria-label="Photo suivante">&#8250;</button>' +
    '<span class="gite-lightbox-counter"></span>' +
    '</div>';

  document.body.appendChild(lightbox);

  giteLightboxState.root = lightbox;
  giteLightboxState.image = lightbox.querySelector('.gite-lightbox-image');
  giteLightboxState.counter = lightbox.querySelector('.gite-lightbox-counter');

  lightbox.querySelector('.gite-lightbox-close').addEventListener('click', closeGiteLightbox);
  lightbox.querySelector('[data-lightbox-close]').addEventListener('click', closeGiteLightbox);
  lightbox.querySelector('.gite-lightbox-prev').addEventListener('click', function () {
    showGiteLightboxImage(giteLightboxState.index - 1);
  });
  lightbox.querySelector('.gite-lightbox-next').addEventListener('click', function () {
    showGiteLightboxImage(giteLightboxState.index + 1);
  });

  document.addEventListener('keydown', function (event) {
    if (!giteLightboxState.open) return;

    if (event.key === 'Escape') {
      closeGiteLightbox();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showGiteLightboxImage(giteLightboxState.index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showGiteLightboxImage(giteLightboxState.index + 1);
    }
  });
}

function showGiteLightboxImage(index) {
  var items = giteLightboxState.items;
  if (!items.length || !giteLightboxState.image) return;

  giteLightboxState.index = (index + items.length) % items.length;
  var item = items[giteLightboxState.index];

  giteLightboxState.image.src = item.src;
  giteLightboxState.image.alt = item.alt;

  if (giteLightboxState.counter) {
    giteLightboxState.counter.textContent =
      (giteLightboxState.index + 1) + ' / ' + items.length;
  }

  if (typeof giteLightboxState.onChange === 'function') {
    giteLightboxState.onChange(giteLightboxState.index);
  }
}

function openGiteLightbox(items, startIndex, onChange) {
  if (!giteLightboxState.root || !items.length) return;

  giteLightboxState.items = items;
  giteLightboxState.onChange = onChange || null;
  giteLightboxState.open = true;

  giteLightboxState.root.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  showGiteLightboxImage(startIndex);
}

function closeGiteLightbox() {
  if (!giteLightboxState.root || !giteLightboxState.open) return;

  giteLightboxState.open = false;
  giteLightboxState.root.classList.add('hidden');
  giteLightboxState.items = [];
  giteLightboxState.onChange = null;
  document.body.style.overflow = '';

  if (giteLightboxState.image) {
    giteLightboxState.image.removeAttribute('src');
  }
}

function initGiteCarousels() {
  document.querySelectorAll('.gite-carousel').forEach(function (carousel) {
    var viewport = carousel.querySelector('.gite-carousel-viewport');
    var prev = carousel.querySelector('.gite-carousel-prev');
    var next = carousel.querySelector('.gite-carousel-next');
    var counter = carousel.querySelector('.gite-carousel-counter');
    if (!viewport) return;

    var track = viewport.querySelector('.gite-carousel-track');
    var slides = viewport.querySelectorAll('.gite-carousel-slide');
    if (!slides.length) return;

    if (!track) {
      track = document.createElement('div');
      track.className = 'gite-carousel-track';
      slides.forEach(function (slide) {
        track.appendChild(slide);
      });
      viewport.appendChild(track);
      slides = track.querySelectorAll('.gite-carousel-slide');
    }

    var current = 0;
    var touchStartX = 0;
    var didSwipe = false;
    var lightboxItems = Array.from(slides).map(function (slide) {
      var img = slide.querySelector('img');
      return {
        src: img ? img.currentSrc || img.src : '',
        alt: img ? img.alt : ''
      };
    }).filter(function (item) {
      return item.src;
    });

    function slideWidth() {
      return viewport.clientWidth;
    }

    function layout() {
      var width = slideWidth();
      if (!width) return;

      track.style.width = (width * slides.length) + 'px';
      slides.forEach(function (slide) {
        slide.style.width = width + 'px';
      });
      show(current, false);
    }

    function show(index, animate) {
      var width = slideWidth();
      if (!width) return;

      current = (index + slides.length) % slides.length;
      track.style.transition = animate === false ? 'none' : 'transform 0.4s ease';
      track.style.transform = 'translate3d(-' + (current * width) + 'px, 0, 0)';

      slides.forEach(function (slide, i) {
        slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      });

      if (counter) {
        counter.textContent = (current + 1) + ' / ' + slides.length;
      }
    }

    function openCurrentImage() {
      if (!lightboxItems.length) return;
      openGiteLightbox(lightboxItems, current, function (index) {
        show(index, false);
      });
    }

    if (!carousel.querySelector('.gite-carousel-zoom')) {
      var zoomBtn = document.createElement('button');
      zoomBtn.type = 'button';
      zoomBtn.className = 'gite-carousel-zoom';
      zoomBtn.setAttribute('aria-label', 'Agrandir la photo');
      zoomBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>' +
        '</svg>';
      zoomBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        openCurrentImage();
      });
      carousel.appendChild(zoomBtn);
    }

    slides.forEach(function (slide) {
      var img = slide.querySelector('img');
      if (!img) return;

      slide.addEventListener('click', function () {
        if (didSwipe) {
          didSwipe = false;
          return;
        }
        openCurrentImage();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }

    viewport.setAttribute('tabindex', '0');
    viewport.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        show(current - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        show(current + 1);
      }
    });

    viewport.addEventListener(
      'touchstart',
      function (event) {
        touchStartX = event.changedTouches[0].screenX;
      },
      { passive: true }
    );

    viewport.addEventListener(
      'touchend',
      function (event) {
        var delta = event.changedTouches[0].screenX - touchStartX;
        if (Math.abs(delta) < 40) return;
        didSwipe = true;
        if (delta < 0) {
          show(current + 1);
        } else {
          show(current - 1);
        }
      },
      { passive: true }
    );

    window.addEventListener('resize', layout);
    layout();
    requestAnimationFrame(layout);
  });
}

var galleryMasonryState = {
  gallery: null,
  items: [],
  colHeights: [0, 0, 0],
  laidOutCount: 0,
  resizeTimer: null
};

var GALLERY_COLUMN_COUNT = 3;
var GALLERY_GAP_PX = 12;

function galleryColumnSpan(ratio, index) {
  if (ratio >= 1.35) return 2;
  if (ratio <= 0.95) return 1;
  return index % 2 === 0 ? 2 : 1;
}

function resetGalleryMasonryLayout() {
  galleryMasonryState.colHeights = [0, 0, 0];
  galleryMasonryState.laidOutCount = 0;
}

function placeGalleryMasonryItem(entry) {
  var img = entry.img;
  var figure = entry.figure;
  var gallery = galleryMasonryState.gallery;
  if (!gallery || !img.naturalWidth || !img.naturalHeight) return false;

  var width = gallery.clientWidth;
  if (!width) return false;

  var gap = GALLERY_GAP_PX;
  var colWidth = (width - gap * (GALLERY_COLUMN_COUNT - 1)) / GALLERY_COLUMN_COUNT;
  var colHeights = galleryMasonryState.colHeights;
  var ratio = img.naturalWidth / img.naturalHeight;
  var colSpan = galleryColumnSpan(ratio, entry.index);
  var itemWidth = colWidth * colSpan + gap * (colSpan - 1);
  var itemHeight = itemWidth / ratio;
  var top;
  var startCol;

  if (colSpan === 2) {
    var topLeft = Math.max(colHeights[0], colHeights[1]);
    var topRight = Math.max(colHeights[1], colHeights[2]);

    if (topLeft <= topRight) {
      startCol = 0;
      top = topLeft;
    } else {
      startCol = 1;
      top = topRight;
    }

    var rowBottom = top + itemHeight + gap;
    colHeights[startCol] = rowBottom;
    colHeights[startCol + 1] = rowBottom;
  } else {
    startCol = 0;
    if (colHeights[1] < colHeights[startCol]) startCol = 1;
    if (colHeights[2] < colHeights[startCol]) startCol = 2;

    top = colHeights[startCol];
    colHeights[startCol] = top + itemHeight + gap;
  }

  figure.style.width = itemWidth + 'px';
  figure.style.height = itemHeight + 'px';
  figure.style.left = startCol * (colWidth + gap) + 'px';
  figure.style.top = top + 'px';

  return true;
}

function updateGalleryMasonryHeight() {
  var gallery = galleryMasonryState.gallery;
  if (!gallery) return;

  var maxHeight = Math.max.apply(null, galleryMasonryState.colHeights);
  gallery.style.height = Math.max(0, maxHeight - GALLERY_GAP_PX) + 'px';
}

function layoutGalleryMasonryFrom(startIndex) {
  var items = galleryMasonryState.items;
  if (!items.length) return;

  if (startIndex === 0) {
    resetGalleryMasonryLayout();
  }

  for (var i = startIndex; i < items.length; i++) {
    var entry = items[i];
    if (!entry.img.naturalWidth || !entry.img.naturalHeight) break;
    if (!placeGalleryMasonryItem(entry)) break;
    galleryMasonryState.laidOutCount = i + 1;
  }

  updateGalleryMasonryHeight();
}

function continueGalleryMasonryLayout() {
  layoutGalleryMasonryFrom(galleryMasonryState.laidOutCount);
}

function relayoutGalleryMasonry() {
  layoutGalleryMasonryFrom(0);
}

function scheduleGalleryMasonryLayout() {
  if (!galleryMasonryState.gallery) return;

  if (galleryMasonryState.resizeTimer) {
    window.clearTimeout(galleryMasonryState.resizeTimer);
  }

  galleryMasonryState.resizeTimer = window.setTimeout(function () {
    relayoutGalleryMasonry();
  }, 80);
}

function registerGalleryMasonryItem(figure, img, index) {
  var entry = { figure: figure, img: img, index: index };
  galleryMasonryState.items.push(entry);

  function onReady() {
    if (!img.naturalWidth || !img.naturalHeight) return;
    continueGalleryMasonryLayout();
  }

  img.addEventListener('load', onReady);

  if (img.complete) {
    onReady();
  }
}

function initPhotosPageGallery() {
  var gallery = document.getElementById('photos-gallery');
  if (!gallery || !window.GITES_PHOTOS || !window.GITES_PHOTOS.length) return;

  galleryMasonryState.gallery = gallery;
  galleryMasonryState.items = [];
  resetGalleryMasonryLayout();

  window.GITES_PHOTOS.forEach(function (photo, index) {
    var figure = document.createElement('figure');
    figure.className = 'gallery-masonry-item';

    var img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt;
    img.loading = 'lazy';
    img.decoding = 'async';

    figure.appendChild(img);
    gallery.appendChild(figure);
    registerGalleryMasonryItem(figure, img, index);
  });

  window.addEventListener('resize', scheduleGalleryMasonryLayout);
  window.addEventListener('load', relayoutGalleryMasonry);
}

function initPhotoGalleries() {
  document.querySelectorAll('[data-photo-gallery]').forEach(function (gallery) {
    var items = Array.from(gallery.querySelectorAll('img')).map(function (img) {
      return {
        src: img.currentSrc || img.src,
        alt: img.alt
      };
    }).filter(function (item) {
      return item.src;
    });

    gallery.querySelectorAll('.photo-masonry-item, .gallery-masonry-item').forEach(function (figure, index) {
      figure.setAttribute('role', 'button');
      figure.setAttribute('tabindex', '0');
      figure.setAttribute('aria-label', 'Agrandir la photo ' + (index + 1));

      figure.addEventListener('click', function () {
        openGiteLightbox(items, index);
      });

      figure.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openGiteLightbox(items, index);
        }
      });
    });
  });
}

function syncPhotoMasonryHeights() {
  document.querySelectorAll('.two-col-match').forEach(function (row) {
    var text = row.querySelector('.two-col-text');
    var masonry = row.querySelector('.photo-masonry');
    if (!text || !masonry) return;

    if (window.innerWidth < 768) {
      masonry.style.height = '';
      return;
    }

    masonry.style.height = text.offsetHeight + 'px';
  });
}
