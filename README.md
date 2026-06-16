# Gîtes Hélène

Site web statique pour les locations de vacances Gîtes Hélène à Embrun (Hautes-Alpes).

Compatible avec l'hébergement **o2switch** — aucune compilation nécessaire.

## Structure

```
gites-helene/
├── index.html, gites.html, activites.html, contact.html
├── gite-*.html             # 6 fiches gîtes
├── css/
│   ├── design-system/      # tokens.css, foundations.css
│   └── style.css           # Composants
├── js/main.js
├── assets/
│   ├── brand/              # Logo
│   ├── icons/sprite.svg    # Icônes SVG
│   ├── photos/             # hero, editorial, cards, gites
│   └── documents/tarifs/   # PDF
├── design-system/
│   └── DESIGN-SYSTEM.md    # Référence complète
└── partials/               # Fragments HTML de référence
```

Voir **`design-system/DESIGN-SYSTEM.md`** pour tokens, composants et conventions.

## Prévisualisation en local

Ouvrez `index.html` directement dans votre navigateur, ou lancez un serveur local :

```bash
cd /Users/lil/Documents/gites-helene
python3 -m http.server 8000
```

Puis ouvrez [http://localhost:8000](http://localhost:8000).

## Déploiement sur o2switch

1. Connectez-vous à votre espace o2switch (cPanel ou FTP)
2. Uploadez le contenu du dossier dans `www/` (ou le répertoire de votre domaine)
3. Vérifiez que `index.html` est bien à la racine

Aucune installation Node.js ou build n'est requise.

## Réservation en ligne

[https://hautes-alpes-mb-prestataire.for-system.com/f133618_fr-.aspx](https://hautes-alpes-mb-prestataire.for-system.com/f133618_fr-.aspx)

## Prochaines étapes

- Récupérer le contenu du site existant (textes, coordonnées)
- Compléter les fiches de chaque gîte (photos)
- Mettre à jour le PDF tarifs Nid Douillet quand disponible
- Connecter le formulaire de contact (PHP ou service externe compatible o2switch)
- Intégrer une carte Google Maps
