# Gîtes Hélène

Site web statique pour les locations de vacances Gîtes Hélène à Embrun (Hautes-Alpes).

Compatible avec l'hébergement **o2switch** — aucune compilation nécessaire.

## Structure

```
gites-helene/
├── index.html, gites.html, activites.html, contact.html
├── gite-*.html             # 5 fiches gîtes
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

**Option 1 — double-clic (macOS)**  
Ouvrez `Lancer le site.command` dans le Finder.

**Option 2 — terminal**

```bash
cd "/Users/lil/Documents/Gîte Hélène/gites-helene"
./lancer.sh
```

Le site s'ouvre sur [http://127.0.0.1:8000](http://127.0.0.1:8000). Un serveur HTTP local est nécessaire pour le sprite SVG, le carrousel et les icônes.

Port personnalisé : `PORT=3000 ./lancer.sh`

## Déploiement sur o2switch

1. Connectez-vous à votre espace o2switch (cPanel ou FTP)
2. Uploadez le contenu du dossier dans `www/` (ou le répertoire de votre domaine)
3. Vérifiez que `index.html` est bien à la racine

Aucune installation Node.js ou build n'est requise.

## Réservation en ligne

[https://hautes-alpes-mb-prestataire.for-system.com/f133618_fr-.aspx](https://hautes-alpes-mb-prestataire.for-system.com/f133618_fr-.aspx)

## Prochaines étapes

- Récupérer le contenu du site existant (textes, coordonnées)
- Compléter les fiches de chaque gîte (photos, descriptions)
- Connecter le formulaire de contact (PHP ou service externe compatible o2switch)
- Intégrer une carte Google Maps
