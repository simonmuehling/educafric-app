#!/bin/bash

# EDUCAFRIC Auto Quality Monitor Runner
# Ce script lance la surveillance automatique de la qualité des boutons

echo "🚀 Démarrage du moniteur qualité automatique EDUCAFRIC..."

# Vérifier que Node.js est disponible
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installation requise."
    exit 1
fi

# Vérifier que le script principal existe
SCRIPT_PATH="scripts/auto-button-quality-monitor.js"
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Script principal non trouvé: $SCRIPT_PATH"
    exit 1
fi

# Créer le répertoire de logs si nécessaire
mkdir -p logs

# Lancer le moniteur avec logs
echo "📊 Lancement de la surveillance qualité..."
echo "📝 Logs disponibles dans: logs/button-quality-monitor.log"

# Exécuter le moniteur qualité
node "$SCRIPT_PATH" 2>&1 | tee logs/button-quality-monitor.log

echo "✅ Moniteur qualité arrêté"