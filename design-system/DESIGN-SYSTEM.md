# Design System — Gîtes Hélène

Référence unique pour les tokens, assets, composants et conventions du site statique.

---

## Architecture du projet

```
gites-helene/
├── assets/
│   ├── brand/              Logo et identité visuelle
│   ├── icons/              Sprite SVG (icônes UI + réseaux sociaux)
│   ├── photos/
│   │   ├── hero/           Image plein écran accueil
│   │   ├── editorial/      Photos éditoriales (activités, accueil)
│   │   ├── cards/          Vignettes des 6 gîtes (listes)
│   │   └── gites/          Galeries carrousel par gîte
│   └── documents/
│       └── tarifs/         PDF tarifs par gîte
├── css/
│   ├── design-system/
│   │   ├── tokens.css      Variables CSS (couleurs, typo, espacements)
│   │   └── foundations.css Reset, base, utilitaires
│   └── style.css           Composants + @import design system
├── design-system/
│   └── DESIGN-SYSTEM.md    Ce fichier
├── js/
│   └── main.js             Menu, sprite SVG, carrousel, lightbox, formulaire
├── partials/               Fragments HTML de référence (head, etc.)
└── *.html                  10 pages publiques
```

---

## Typographie

### Polices (Google Fonts)

| Rôle | Famille | Poids | Token |
|------|---------|-------|-------|
| Titres, affichage | Cormorant Garamond | 400, 600, 700 + italique 400 | `--font-display` |
| Corps, UI, nav | Outfit | 300, 400, 500, 600 | `--font-body` |

Lien à inclure dans chaque page → voir `partials/head.html`.

### Échelle typographique

| Token | Valeur | Usage |
|-------|--------|-------|
| `--text-xs` | 0.75rem | Badge, copyright |
| `--text-sm` | 0.8125rem | Compteur carrousel |
| `--text-base` | 0.875rem | Nav, cartes, formulaires |
| `--text-md` | 1rem | Corps de texte |
| `--text-lg` | 1.0625rem | Accroche gîte |
| `--text-xl` | 1.125rem | Bannière, intro |
| `--text-2xl` | 1.25rem | Sous-titres gîte |
| `--text-3xl` | 1.5rem | Titres de section réduits |
| `--text-display-sm` | clamp(1.75rem, 4vw, 2.5rem) | `.section-title` |
| `--text-display-md` | clamp(2rem, 5vw, 3rem) | `.page-title` |
| `--text-display-lg` | clamp(2rem, 6vw, 3.75rem) | Hero h1 |

---

## Couleurs

Palette **Spring test** — Meyer Lemon, Coral Reef, Salmon Pink, Soft Baby Blue.

### Tokens canoniques

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-yellow-400` | `#efd780` | Accents jaune, footer texte |
| `--color-coral-400` | `#f38081` | Accents corail |
| `--color-salmon-400` | `#f79977` | CTA, liens, terracotta |
| `--color-salmon-300` | `#f9ad90` | Hover CTA |
| `--color-blue-200` | `#bdd8f1` | Accents bleu clair |
| `--color-blue-600` | `#5a7a9a` | Titres, footer, nav |
| `--color-blue-500` | `#6a8198` | Texte corps |
| `--color-blue-400` | `#8fa3b8` | Texte atténué |
| `--color-surface-cream` | `#fafcfe` | Fond page |
| `--color-surface-cream-dark` | `#f3f8fc` | Header, champs |
| `--color-surface-rose` | `#e4f0fa` | Section alternée |
| `--color-surface-peach` | `#fde8df` | Dégradés |
| `--color-border` | `#d4e5f4` | Bordures cartes |
| `--color-border-nav` | `#c9ddf0` | Bordure header |
| `--color-white` | `#ffffff` | Surfaces, texte sur CTA |

### Alias sémantiques (legacy)

Les anciens noms (`--forest`, `--terracotta`, `--cream`, etc.) restent disponibles et pointent vers les tokens canoniques.

---

## Espacements & layout

| Token | Valeur |
|-------|--------|
| `--space-1` … `--space-20` | 0.25rem → 5rem |
| `--container-padding-x` | 1.5rem |
| `--section-padding-y` | 5rem |
| `--header-height` | 5rem |
| `--max-width` | 72rem |

### Breakpoints

| Nom | Min-width | Usage principal |
|-----|-----------|-----------------|
| sm | 480px | Hero actions en ligne |
| md | 639px | Masquer `.link-arrow` |
| lg | 768px | Nav desktop, grilles 2 col. |
| xl | 1024px | Grille 3 gîtes |

---

## Rayons, ombres, transitions

| Token | Valeur |
|-------|--------|
| `--radius-sm` | 0.5rem |
| `--radius-md` | 0.75rem |
| `--radius` | 1rem |
| `--radius-lg` | 1.5rem |
| `--radius-full` | 9999px |
| `--shadow-sm` | Ombre légère |
| `--shadow-md` | Ombre cartes |
| `--transition-fast` | 0.2s ease |
| `--transition-medium` | 0.4s ease |

---

## Brand — Logo

| Fichier | Chemin | Usage |
|---------|--------|-------|
| Logo principal | `assets/brand/logo-gites-helene.png` | Header, hero, footer, favicon |
| Archive | `assets/brand/archive/logo-gite-helene.png` | Ancien logo (non utilisé) |

### Traitements CSS

| Contexte | Classe / sélecteur | Traitement |
|----------|-------------------|------------|
| Header | `.site-header .logo img` | Filtre `--logo-filter-header` (bleu forêt) |
| Header accueil | `.page-home .site-header .logo img` | Filtre `--logo-filter-header-home` + ombre |
| Hero | `.hero-logo` | Blanc natif + drop-shadow |
| Footer | `.footer-logo` | Blanc natif |

Source Figma : [Gîtes Hélène — Group 6](https://www.figma.com/design/SoIHYUUCbFWdL3TSFaxTsa/G%C3%AEtes-H%C3%A9l%C3%A8ne?node-id=5-2)

---

## Icônes

**Fichier unique :** `assets/icons/sprite.svg`

**Inliné** au début de chaque page HTML (source : `partials/sprite-inline.html`, généré depuis `assets/icons/sprite.svg`). Ne pas compter sur un chargement JS — les `<use href="#icon-…">` exigent le sprite dans le DOM au rendu.

### Symboles disponibles

| ID | Usage |
|----|-------|
| `icon-utensils` | Accueil — restauration |
| `icon-bike` | Accueil — VTT |
| `icon-leaf` | Accueil — nature |
| `icon-waves` | Activités — nautique |
| `icon-droplet` | Activités — plan d'eau |
| `icon-sun` | Activités — ensoleillement |
| `icon-arrow-right` | Liens « voir plus » |
| `icon-check-circle` | Confirmation formulaire |
| `icon-facebook` | Réseaux sociaux |
| `icon-instagram` | Réseaux sociaux |
| `icon-trophy` | *(réservé)* |
| `icon-mountain` | *(réservé)* |
| `icon-heart` | *(réservé)* |

### Usage HTML

```html
<svg class="icon icon-lg" viewBox="0 0 24 24" aria-hidden="true">
  <use href="#icon-facebook"/>
</svg>
```

Classes : `.icon` (1.25rem), `.icon-lg` (2.5rem). Menu hamburger : SVG inline (hors sprite).

---

## Photos

### Hero
| Fichier | Page |
|---------|------|
| `assets/photos/hero/hero-vue-lac-serre-poncon.png` | `index.html` |

### Éditorial
| Fichier | Pages |
|---------|-------|
| `assets/photos/editorial/P1130388.JPG` | index, activites |
| `assets/photos/editorial/gite-lac-serre-poncon.jpg` | index, activites |

### Vignettes cartes (6 gîtes)
`assets/photos/cards/gite-{slug}.jpg` — slugs : `valeur-sure`, `coup-de-coeur`, `cocon-confort`, `calin`, `chal-heureux`, `nid-douillet`

### Galeries carrousel
`assets/photos/gites/{slug}/` — une dizaine à une vingtaine de photos par gîte.

---

## Documents

`assets/documents/tarifs/tarifs-{slug}.pdf` — liés depuis chaque fiche gîte.

---

## Composants CSS

Tous définis dans `css/style.css`, organisés par section :

| Section | Classes principales |
|---------|-------------------|
| **Layout** | `.container`, `.page-wrapper`, `.main-content` |
| **Typo** | `.page-title`, `.section-title`, `.text-light` |
| **Header** | `.site-header`, `.logo`, `.nav-desktop`, `.nav-mobile` |
| **Boutons** | `.btn`, `.btn-primary`, `.btn-outline`, `.btn-outline-dark` |
| **Hero** | `.hero`, `.hero-bg`, `.hero-overlay`, `.hero-content` |
| **Bannière** | `.page-banner` |
| **Sections** | `.section`, `.section-alt`, `.section-top` |
| **Features** | `.features-grid`, `.feature-card`, `.feature-icon` |
| **Cartes gîtes** | `.gites-grid`, `.gite-card`, `.badge`, `.gite-card-link` |
| **CTA** | `.cta-block`, `.cta-grid` |
| **Colonnes** | `.two-col`, `.rounded-image` |
| **Contact** | `.contact-grid`, `.contact-form`, `.form-group` |
| **Carrousel** | `.gite-carousel`, `.gite-carousel-*`, `.gite-lightbox` |
| **Fiche gîte** | `.gite-page-intro`, `.gite-description`, `.tarif-table` |
| **Footer** | `.site-footer`, `.social-links`, `.footer-logo` |
| **Fond mesh** | `.page-gites-list`, `.page-activites`, `:has(.gite-page-intro)` |
| **Utilitaires** | `.hidden`, `.visually-hidden` → `foundations.css` |

### Pages avec fond mesh
- Fiches gîtes (`:has(.gite-page-intro)`)
- `gites.html` (`.page-gites-list`)
- `activites.html` (`.page-activites`)

Ratio : 1/3 clair en haut, 2/3 coloré en bas.

---

## JavaScript

`js/main.js` — modules :

| Fonction | Rôle |
|----------|------|
| `initSvgSprite()` | Vérifie viewBox des icônes (sprite inliné dans le HTML) |
| `initMobileMenu()` | Menu mobile |
| `initContactForm()` | Formulaire contact (démo) |
| `initGiteLightbox()` | Agrandissement photos carrousel |
| `initGiteCarousels()` | Carrousel + zoom |

---

## Conventions

1. **Pas de build** — site statique, déployable tel quel sur o2switch.
2. **Un seul sprite SVG** — ne pas ré-inliner le sprite dans le HTML.
3. **Tokens d'abord** — nouvelles couleurs/espacements → `css/design-system/tokens.css`.
4. **Assets dans `assets/`** — plus de dossier `images/` à la racine.
5. **Partials** — `partials/` sert de référence pour header/footer/head (copier-coller manuel).

---

## Prévisualisation locale

```bash
cd gites-helene
python3 -m http.server 8000
```

Obligatoire pour le sprite SVG et le carrousel (pas de `file://`).
