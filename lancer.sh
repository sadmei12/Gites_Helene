#!/usr/bin/env bash
# Lance le site Gîtes Hélène en local (serveur HTTP + ouverture navigateur)

set -e

PORT="${PORT:-8000}"
HOST="127.0.0.1"
URL="http://${HOST}:${PORT}"

cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Erreur : python3 est requis pour lancer le site."
  exit 1
fi

if lsof -iTCP:"${PORT}" -sTCP:LISTEN -P -n >/dev/null 2>&1; then
  echo "Le port ${PORT} est déjà utilisé — ouverture du site existant."
  open "${URL}" 2>/dev/null || xdg-open "${URL}" 2>/dev/null || true
  exit 0
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Gîtes Hélène — prévisualisation locale"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  → ${URL}"
echo ""
echo "  Appuyez sur Ctrl+C pour arrêter le serveur."
echo ""

if command -v open >/dev/null 2>&1; then
  (sleep 0.5 && open "${URL}") &
elif command -v xdg-open >/dev/null 2>&1; then
  (sleep 0.5 && xdg-open "${URL}") &
fi

exec python3 -m http.server "${PORT}" --bind "${HOST}"
