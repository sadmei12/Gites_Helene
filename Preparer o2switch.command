#!/usr/bin/env bash
# Double-clic sur macOS pour préparer le dossier deploy-o2switch/
cd "$(dirname "$0")"
chmod +x scripts/prepare-o2switch.sh
./scripts/prepare-o2switch.sh
echo ""
read -r -p "Appuyez sur Entrée pour fermer…"
