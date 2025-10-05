#!/bin/bash

# EDUCAFRIC Button Testing Suite
# Ce script exécute tous les tests de validation des boutons

echo "🚀 EDUCAFRIC - Suite de Tests des Boutons"
echo "========================================"

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

echo ""
echo "🔍 1. Validation statique du code..."
echo "-----------------------------------"
node scripts/button-functionality-validator.js

echo ""
echo "🌐 2. Tests d'interaction dans le navigateur..."
echo "----------------------------------------------"
# Vérifier si le serveur de dev est en cours d'exécution
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Le serveur de développement n'est pas en cours d'exécution"
    echo "   Démarrez-le avec: npm run dev"
    echo "   Puis relancez ce script"
else
    node scripts/button-test-runner.js
fi

echo ""
echo "📊 3. Surveillance en temps réel (optionnel)..."
echo "-----------------------------------------------"
read -p "Voulez-vous démarrer la surveillance en temps réel? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔍 Démarrage de la surveillance en temps réel..."
    echo "   Appuyez sur Ctrl+C pour arrêter"
    node scripts/real-time-button-monitor.js
fi

echo ""
echo "✅ Tests terminés!"
echo "📄 Consultez les rapports générés:"
echo "   - button-functionality-report.json"
echo "   - button-test-results.json"
echo "   - button-monitoring-report.json (si surveillance utilisée)"