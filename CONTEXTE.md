# Contexte du projet — Gîtes Hélène

Ce fichier sert de référence pour toute évolution du site. Il doit guider les décisions techniques et esthétiques, et documenter l'état actuel du projet.

## Stack technique (obligatoire)

Le site doit **exclusivement** utiliser :

- **HTML** — pages statiques, sémantiques, accessibles
- **CSS** — styles, mise en page, responsive
- **JavaScript** — interactions légères (menu mobile, formulaires, etc.)

**Interdit ou à éviter :**

- Frameworks front (React, Vue, Angular, Svelte…)
- Préprocesseurs ou bundlers (Sass, Webpack, Vite, npm build…) pour le site lui-même
- CMS ou générateurs de site statique (Next.js, Astro, Hugo…)
- Dépendances lourdes nécessitant une compilation côté production

**Hébergement cible :** o2switch (hébergement mutualisé classique). Le site doit pouvoir être déployé en uploadant les fichiers tels quels, sans étape de build.

**Exception outillage :** le dossier `scripts/` contient un script Playwright (`figma-capture.mjs`) utilisé uniquement en local pour synchroniser les maquettes Figma. Il n'est pas déployé sur o2switch.

---

## Nature du site

Site vitrine pour **Gîtes Hélène**, locations de vacances aux **Gaillards** (St-Sauveur, Hautes-Alpes) et au **plan d'eau d'Embrun**, entre montagnes et **lac de Serre-Ponçon**.

Site de référence (contenu source) : [gite-embrun-les-orres.com](https://www.gite-embrun-les-orres.com/)

Ton éditorial : chaleureux, authentique, accueillant — comme un séjour chez Hélène, pas comme une plateforme de réservation impersonnelle.

---

## Structure du projet

```
gites-helene/
├── index.html              # Accueil
├── gites.html              # Gîtes / tarifs (liste des 5 gîtes)
├── gite-valeur-sure.html   # Fiche gîte
├── gite-coup-de-coeur.html
├── gite-cocon-confort.html
├── gite-calin.html
├── gite-chal-heureux.html
├── activites.html          # Les activités
├── contact.html            # Contact + formulaire
├── css/
│   ├── design-system/
│   │   ├── tokens.css        # Variables (couleurs, typo, espacements)
│   │   └── foundations.css   # Reset, base, utilitaires
│   └── style.css             # Composants (@import design system)
├── js/main.js                # Menu, sprite SVG, carrousel, lightbox, formulaire
├── assets/
│   ├── brand/logo-gites-helene.png
│   ├── icons/sprite.svg      # Sprite SVG (icônes + réseaux sociaux)
│   ├── photos/
│   │   ├── hero/             # Hero accueil
│   │   ├── editorial/        # Photos éditoriales
│   │   ├── cards/            # Vignettes 5 gîtes
│   │   └── gites/            # Galeries carrousel par gîte
│   └── documents/tarifs/     # PDF tarifs par gîte
├── design-system/
│   └── DESIGN-SYSTEM.md      # Référence design system complète
├── partials/                 # Fragments HTML de référence (head, etc.)
├── scripts/                # Outillage local (non déployé)
│   └── figma-capture.mjs
├── CONTEXTE.md             # Ce fichier
└── README.md
```

**9 pages HTML** au total. Les pages `region.html`, `temps-forts.html` et `gite-nid-douillet.html` ont été supprimées.

---

## Navigation

Menu identique sur toutes les pages :

1. Accueil
2. Gîtes / tarifs
3. Les activités
4. Contact

Header sticky avec logo, navigation desktop, menu hamburger mobile (`js/main.js`).

---

## Les 5 gîtes

| Gîte | Fichier | Capacité (indicatif) | Emplacement |
|------|---------|----------------------|-------------|
| Valeur Sûre | `gite-valeur-sure.html` | 2 adultes + 3 enfants | Les Gaillards (St-Sauveur) |
| Coup de Cœur | `gite-coup-de-coeur.html` | — | Les Gaillards |
| Cocon Confort | `gite-cocon-confort.html` | — | Les Gaillards |
| Câlin | `gite-calin.html` | — | Les Gaillards |
| Chal'heureux | `gite-chal-heureux.html` | — | Les Gaillards |

*Tous les gîtes sont aux Gaillards (St-Sauveur). Le Gîte Nid Douillet (plan d'eau d'Embrun) n'est plus proposé à la location.*

Chaque fiche gîte contient : photo hero, métadonnées, description, specs, boutons PDF tarifs + réserver, tableau tarifs 2026, conditions.

**En attente :** les descriptions détaillées des fiches gîtes sont encore en placeholder (`Description à compléter.`). Les photos sont en partie réutilisées (2 images disponibles pour l'instant).

---

## Coordonnées et liens externes

| Élément | Valeur |
|---------|--------|
| Adresse (Gaillards) | Les Gaillards, 05200 St-Sauveur, Hautes-Alpes |
| Email | [helenemarseille@orange.fr](mailto:helenemarseille@orange.fr) |
| Téléphone | [06 82 21 29 00](tel:+33682212900) |
| Réservation en ligne | [for-system.com/f133618](https://hautes-alpes-mb-prestataire.for-system.com/f133618_fr-.aspx) |
| Facebook | [facebook.com/gitehelene.faure](https://www.facebook.com/gitehelene.faure) |
| Instagram | [instagram.com/helene_marseille_](https://www.instagram.com/helene_marseille_/) |

Note tarifs groupes : consulter pour les tarifs nuitée à partir de 18 personnes.

---

## Réseaux sociaux (implémenté)

Liens Facebook et Instagram présents sur **toutes les pages** :

- **Footer** — première colonne, sous le texte de présentation, icônes cliquables (`.social-links`)
- **Page Contact** — section « Nous trouver », titre « Réseaux sociaux » (`.social-links.social-links-contact`)

Icônes SVG dans `assets/icons/sprite.svg`, **inlinées** au début de chaque page HTML (référence : `partials/sprite-inline.html`). Usage : `<use href="#icon-facebook"/>`.

Liens ouverts dans un nouvel onglet (`target="_blank" rel="noopener noreferrer"`) avec `aria-label` pour l'accessibilité.

---

## Identité visuelle

L'identité repose sur un univers **montagne + nature + accueil familial**. Toute modernisation doit **enrichir** cette identité, jamais la remplacer.

### Éléments fixes

- **Logo** : `assets/brand/logo-gites-helene.png` (blanc ; filtre bleu en header via CSS)
- **Typographies** :
  - Cormorant Garamond — titres, élégance
  - Outfit — corps de texte, lisibilité moderne
- **Ambiance** : calme, nature, authenticité alpine, proximité humaine
- **Photos** : paysages des Hautes-Alpes, lac, montagnes, gîtes

### Palette en cours — « Spring test »

Palette documentée dans `css/design-system/tokens.css`. Voir `design-system/DESIGN-SYSTEM.md`.

| Nom | Variable | Hex |
|-----|----------|-----|
| Meyer Lemon | `--meyer-lemon` / `--butter-yellow` | `#EFD780` |
| Squeeze of Lime | `--squeeze-lime` | `#C8CE72` |
| Coral Reef | `--coral-reef` | `#F38081` |
| Salmon Pink | `--salmon-pink` / `--terracotta` | `#F79977` |
| Soft Baby Blue | `--soft-baby-blue` | `#BDD8F1` |
| Bleu footer / accents | `--footer-dark` / `--forest` | `#5a7a9a` |
| Fond crème | `--cream` | `#fafcfe` |

Ancienne palette de référence (crème / terracotta / vert forêt) remplacée temporairement par Spring test.

### Hero (accueil)

- Photo plein écran : `assets/photos/hero/location-gite-vue-lac-serre-poncon-gaillards.png`
- Overlay bleu/vert semi-transparent
- Logo, titre, accroche, boutons « Réserver » et « Gîtes / tarifs »
- **Crête montagne SVG** en bas du hero uniquement (`.hero::after`, variable `--mountain-h`)

### Footer

- Fond bleu `#5a7a9a`
- Logo en couleurs
- 3 colonnes : présentation + réseaux sociaux / navigation / contact
- Bandeau copyright en bas

### Icônes SVG

Fichier sprite : `assets/icons/sprite.svg`. Chargé par JS. Usage : `<svg class="icon"><use href="#icon-…"/></svg>`.

Symboles disponibles : `icon-utensils`, `icon-bike`, `icon-leaf`, `icon-waves`, `icon-droplet`, `icon-sun`, `icon-trophy`, `icon-mountain`, `icon-heart`, `icon-check-circle`, `icon-arrow-right`, `icon-facebook`, `icon-instagram`.

Classes CSS : `.icon` (1.25 rem), `.icon-lg` (2.5 rem), `.feature-icon`.

Les emojis ont été remplacés par ces icônes sur accueil, activités et contact.

### Direction « plus moderne »

Moderniser signifie :

- Mise en page aérée, hiérarchie visuelle claire
- Responsive soigné (mobile-first)
- Micro-interactions discrètes en CSS/JS
- Performance et accessibilité (contraste, balises sémantiques, `alt` sur les images)
- Navigation fluide et formulaire de contact fonctionnel

Moderniser **ne signifie pas** :

- Design froid ou corporate
- Couleurs néon ou palette tech
- Animations excessives ou effets « startup »
- Perte du côté humain et chaleureux du gîte

---

## Contenu par page (état actuel)

### Accueil (`index.html`)

- Hero avec photo lac + CTA réservation
- Section « Aux Gaillards, entre montagne et lac »
- Section « Lac de Serre-Ponçon & Embrun » (activités régionales)
- Section « Gîtes et accueil de groupes » (3 feature cards avec icônes)
- Grille des 5 gîtes avec liens vers fiches
- Section localisation (Les Gaillards)
- CTA final contact

### Gîtes / tarifs (`gites.html`)

- Grille 3 colonnes des 5 gîtes
- Boutons « Plus d'info » + « Réserver » par gîte

### Fiches gîtes (`gite-*.html`)

- Lien retour vers `gites.html`
- Photo, titre, métadonnées, specs
- PDF tarifs + bouton réserver
- Tableau tarifs 2026 par période
- Bloc conditions (chauffage, animaux, etc.)

### Les activités (`activites.html`)

- Contenu reprenant le site original (randonnées, VTT, nautique, ski, parapente…)
- Icônes SVG à la place des emojis

### Contact (`contact.html`)

- Coordonnées complètes + réseaux sociaux
- Bouton réserver en ligne
- Formulaire de contact (soumission simulée côté JS — pas encore connecté au backend)
- Placeholder carte (« Carte à intégrer »)

---

## JavaScript (`js/main.js`)

- **Menu mobile** : toggle ouvert/fermé, `aria-expanded`, fermeture au clic sur un lien
- **Formulaire contact** : empêche l'envoi réel, affiche un message de succès (`#form-success`)

---

## Maquettes Figma

Fichier : [Gîtes Hélène — Maquettes](https://www.figma.com/design/vkZ0RU3xTJAHbA8h8dVNXr) (`fileKey` : `vkZ0RU3xTJAHbA8h8dVNXr`)

11 frames nommées (1 — Accueil … 11 — Contact), recapturées depuis le site local en juin 2026.

Script de capture : `scripts/figma-capture.mjs` (Playwright, serveur local sur port 8000).

---

## Prévisualisation en local

```bash
cd "/Users/lil/Documents/Gîte Hélène/gites-helene"
python3 -m http.server 8000
```

Puis ouvrir [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## Déploiement o2switch

1. Uploader le contenu du dossier (sans `scripts/node_modules/`)
2. Vérifier que `index.html` est à la racine du domaine
3. Aucune installation Node.js ni build requis

---

## Points en attente

- [ ] **Palette définitive** — choisir entre Spring test, Summer vibes ou Provençale
- [ ] **Descriptions gîtes** — remplacer les placeholders par les textes du site original
- [ ] **Photos gîtes** — ajouter une photo dédiée par gîte
- [ ] **Carte Google Maps** — intégrer sur la page contact (remplacer le placeholder)
- [ ] **Formulaire contact** — connecter via PHP ou service externe compatible o2switch
- [ ] **Maquettes Figma** — recapturer après changements visuels majeurs (palette, réseaux sociaux, etc.)

---

## Contraintes pratiques

- Fichiers statiques déployables directement sur o2switch
- Pas de base de données côté front
- Google Fonts autorisées (Cormorant Garamond + Outfit)
- Images optimisées pour le web (poids raisonnable)

---

## Résumé en une phrase

Un site de gîte de montagne, chaleureux et authentique, construit uniquement en HTML/CSS/JS, modernisé avec sobriété — 11 pages, palette Spring test en cours de validation, réseaux sociaux et réservation en ligne intégrés — tout en gardant l'âme des Gîtes Hélène aux Gaillards et à Embrun.
