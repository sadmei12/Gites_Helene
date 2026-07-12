#!/usr/bin/env bash
# Prépare le dossier deploy-o2switch/ prêt à uploader dans public_html/

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/deploy-o2switch"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Gîtes Hélène — préparation o2switch"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

rm -rf "$DEST"
mkdir -p "$DEST"

rsync -a \
  --exclude='.git/' \
  --exclude='.vercel/' \
  --exclude='.firebase/' \
  --exclude='.cursor/' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='node_modules/' \
  --exclude='scripts/' \
  --exclude='docs/' \
  --exclude='/design-system/' \
  --exclude='partials/' \
  --exclude='deploy-o2switch/' \
  --exclude='CONTEXTE.md' \
  --exclude='README.md' \
  --exclude='vercel.json' \
  --exclude='package.json' \
  --exclude='package-lock.json' \
  --exclude='firebase.json' \
  --exclude='.firebaserc' \
  --exclude='firestore.rules' \
  --exclude='storage.rules' \
  --exclude='firebase-debug.log' \
  --exclude='firestore-debug.log' \
  --exclude='ui-debug.log' \
  --exclude='config.local.example.js' \
  --exclude='contact.config.example.php' \
  --exclude='config.runtime.js' \
  --exclude='lancer.sh' \
  --exclude='Lancer le site.command' \
  --exclude='Preparer o2switch.command' \
  --exclude='.gitignore' \
  "$ROOT/" "$DEST/"

if [[ ! -f "$ROOT/config.local.js" ]]; then
  echo "⚠️  config.local.js absent — copiez config.local.example.js et remplissez les clés Firebase."
else
  cp "$ROOT/config.local.js" "$DEST/"
  echo "✓ config.local.js inclus"
fi

if [[ -f "$ROOT/contact.config.php" ]]; then
  cp "$ROOT/contact.config.php" "$DEST/"
  echo "✓ contact.config.php inclus"
fi

echo ""
echo "Optimisation images (WebP) sur la source…"
if command -v python3 >/dev/null 2>&1; then
  python3 "$ROOT/scripts/optimize-images.py" | tail -5
  rsync -a "$ROOT/assets/" "$DEST/assets/"
  echo "✓ assets/ (JPEG + WebP) synchronisés"
else
  echo "⚠️  python3 absent — WebP non régénérés."
fi

FILE_COUNT="$(find "$DEST" -type f | wc -l | tr -d ' ')"

cat > "$DEST/LISEZMOI-O2SWITCH.txt" <<'EOF'
Gîtes Hélène — déploiement o2switch
===================================

1. cPanel → Gestionnaire de fichiers → public_html/
2. Supprimez la page par défaut o2switch si présente
3. Uploadez TOUT le contenu de ce dossier (pas le dossier lui-même)
4. Vérifiez que index.html est à la racine de public_html/

Fichiers indispensables :
  - config.local.js   (Firebase — tarifs + admin)
  - contact.php       (formulaire contact)
  - contact.config.php
  - .htaccess         (HTTPS + www)

DNS OVH (zone gite-embrun.fr) :
  - A  @    → IP du serveur o2switch
  - A  www  → même IP

Après propagation DNS :
  - Créez contact@gite-embrun.fr dans cPanel → Comptes email
  - Testez https://gite-embrun.fr
  - Testez https://gite-embrun.fr/admin.html (tarifs + photos)
  - Testez le formulaire sur /contact.html
  - Vérifiez la section « Ce que disent nos vacanciers » sur l'accueil

Firebase : déjà configuré pour gite-embrun.fr (aucun changement).
Règles Firestore : npm run firebase:deploy-rules (depuis le Mac, si besoin).
EOF

echo ""
echo "Dossier prêt : $DEST"
echo "Fichiers : $FILE_COUNT"
echo ""
echo "Uploadez le contenu de deploy-o2switch/ dans public_html/ sur o2switch."
echo "Voir LISEZMOI-O2SWITCH.txt dans ce dossier."
