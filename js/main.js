document.addEventListener('DOMContentLoaded', async function () {
  if (window.GITES_PHOTOS_PROMISE) {
    try {
      await window.GITES_PHOTOS_PROMISE;
    } catch (error) {
      console.error('Photos load error:', error);
    }
  }
  initSvgSprite();
  initMobileMenu();
  initImagePerformance();
  initContactForm();
  initGiteLightbox();
  initGiteCarousels();
  initReviewsCarousel();
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

function initImagePerformance() {
  document.querySelectorAll('img').forEach(function (img) {
    if (img.classList.contains('hero-bg')) {
      img.setAttribute('fetchpriority', 'high');
      img.decoding = 'async';
      return;
    }

    if (
      img.closest('.site-header') ||
      img.classList.contains('hero-logo') ||
      img.classList.contains('footer-logo')
    ) {
      img.decoding = 'async';
      return;
    }

    if (img.closest('.gite-carousel')) {
      var slide = img.closest('.gite-carousel-slide');
      var firstSlide = slide && slide.parentElement
        ? slide.parentElement.querySelector('.gite-carousel-slide')
        : null;
      if (slide && firstSlide && slide !== firstSlide && !img.hasAttribute('loading')) {
        img.loading = 'lazy';
      }
      img.decoding = 'async';
      return;
    }

    if (!img.hasAttribute('loading')) {
      img.loading = 'lazy';
    }
    img.decoding = 'async';
  });
}

function initContactForm() {
  var form = document.getElementById('contact-form');
  var panel = document.getElementById('contact-form-panel');
  var success = document.getElementById('form-success');
  var errorEl = document.getElementById('form-error');
  var submitBtn = document.getElementById('contact-submit');

  if (!form || !success) return;

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours…';
    }

    fetch('contact.php', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then(function (response) {
        return response.text().then(function (text) {
          var data = { ok: false };
          try {
            data = JSON.parse(text);
          } catch (err) {
            data = { ok: false };
          }
          return { response: response, data: data };
        });
      })
      .then(function (result) {
        if (result.data && result.data.ok) {
          if (panel) panel.classList.add('hidden');
          success.classList.remove('hidden');
          form.reset();
          return;
        }

        var message =
          (result.data && result.data.error) ||
          'L’envoi a échoué. Réessayez ou écrivez-nous à helenemarseille@orange.fr.';
        showError(message);
      })
      .catch(function () {
        showError(
          'Le formulaire sera actif sur gite-embrun.fr. En attendant, écrivez-nous à helenemarseille@orange.fr.'
        );
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Envoyer';
        }
      });
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

function initReviewsCarousel() {
  var carousel = document.querySelector('[data-reviews-carousel]');
  var source = document.querySelector('.reviews-grid-mobile');
  if (!carousel || !source) return;

  var items = Array.from(source.querySelectorAll('.review-card'));
  if (!items.length) return;

  var prevSlot = carousel.querySelector('[data-slot="prev"]');
  var activeSlot = carousel.querySelector('[data-slot="active"]');
  var nextSlot = carousel.querySelector('[data-slot="next"]');
  var prevBtn = carousel.querySelector('.reviews-carousel-prev');
  var nextBtn = carousel.querySelector('.reviews-carousel-next');
  var stage = carousel.querySelector('.reviews-carousel-stage');
  var current = 0;

  function mod(index, total) {
    return ((index % total) + total) % total;
  }

  function fillSlot(slot, index, role) {
    if (!slot) return;

    var item = items[index];
    slot.innerHTML = item.innerHTML;

    var cite = item.querySelector('cite');
    var author = cite ? cite.textContent.trim() : '';

    if (role === 'active') {
      slot.removeAttribute('aria-hidden');
      slot.setAttribute('aria-label', author ? 'Avis de ' + author : 'Avis client');
    } else {
      slot.setAttribute('aria-hidden', 'true');
      slot.setAttribute('aria-label', author ? 'Voir l\'avis de ' + author : 'Voir cet avis');
    }
  }

  function applyRender(index) {
    current = mod(index, items.length);
    var prevIndex = mod(current - 1, items.length);
    var nextIndex = mod(current + 1, items.length);

    fillSlot(prevSlot, prevIndex, 'prev');
    fillSlot(activeSlot, current, 'active');
    fillSlot(nextSlot, nextIndex, 'next');
  }

  function go(delta) {
    if (!delta) return;
    applyRender(current + delta);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      go(-1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      go(1);
    });
  }

  if (prevSlot) {
    prevSlot.addEventListener('click', function () {
      go(-1);
    });
    prevSlot.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        go(-1);
      }
    });
  }

  if (nextSlot) {
    nextSlot.addEventListener('click', function () {
      go(1);
    });
    nextSlot.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        go(1);
      }
    });
  }

  carousel.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    }
  });

  applyRender(0);
}

function initPhotosPageGallery() {
  var gallery = document.getElementById('photos-gallery');
  if (!gallery || !window.GITES_PHOTOS || !window.GITES_PHOTOS.length) return;

  window.GITES_PHOTOS.forEach(function (photo) {
    var figure = document.createElement('figure');
    figure.className = 'gallery-masonry-item';

    var img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt;
    img.loading = 'lazy';
    img.decoding = 'async';

    figure.appendChild(img);
    gallery.appendChild(figure);
  });
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
