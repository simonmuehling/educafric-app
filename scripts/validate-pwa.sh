#!/bin/bash

# Script de Validation PWA pour EDUCAFRIC
# Usage: ./scripts/validate-pwa.sh

echo "🔍 Validation PWA EDUCAFRIC..."
echo "================================"

# Configuration
BASE_URL="http://localhost:5000"
ERROR_COUNT=0

# Fonction pour vérifier une ressource
check_resource() {
    local resource=$1
    local name=$2
    
    if curl -f -s "${BASE_URL}${resource}" > /dev/null 2>&1; then
        echo "✅ $name - OK"
    else
        echo "❌ $name - MANQUANT"
        ((ERROR_COUNT++))
    fi
}

# Vérifier les icônes PWA
echo "📱 Vérification des icônes PWA..."
check_resource "/educafric-logo-128.png" "Logo 128x128"
check_resource "/educafric-logo-512.png" "Logo 512x512"
check_resource "/android-chrome-192x192.png" "Android Chrome 192x192"
check_resource "/android-chrome-512x512.png" "Android Chrome 512x512"
check_resource "/android-icon-192x192.png" "Android Icon 192x192"
check_resource "/apple-touch-icon.png" "Apple Touch Icon"
check_resource "/favicon.ico" "Favicon"

echo ""

# Vérifier les fichiers PWA
echo "⚙️ Vérification des fichiers PWA..."
check_resource "/manifest.json" "Manifeste PWA"
check_resource "/sw.js" "Service Worker"
check_resource "/offline.html" "Page Offline"

echo ""

# Valider le contenu du manifeste
echo "📋 Validation du manifeste..."
if curl -f -s "${BASE_URL}/manifest.json" > /dev/null 2>&1; then
    MANIFEST_CONTENT=$(curl -s "${BASE_URL}/manifest.json")
    
    # Vérifier que les icônes dans le manifeste existent
    echo "🔗 Vérification des liens dans le manifeste..."
    
    # Extraire les sources d'icônes (méthode basique sans jq)
    if echo "$MANIFEST_CONTENT" | grep -q "educafric-logo-128.png"; then
        echo "✅ Référence logo 128 - OK"
    else
        echo "❌ Référence logo 128 - MANQUANTE"
        ((ERROR_COUNT++))
    fi
    
    if echo "$MANIFEST_CONTENT" | grep -q "android-chrome-192x192.png"; then
        echo "✅ Référence Android 192 - OK"
    else
        echo "❌ Référence Android 192 - MANQUANTE"
        ((ERROR_COUNT++))
    fi
    
    if echo "$MANIFEST_CONTENT" | grep -q "android-chrome-512x512.png"; then
        echo "✅ Référence Android 512 - OK"
    else
        echo "❌ Référence Android 512 - MANQUANTE"
        ((ERROR_COUNT++))
    fi
else
    echo "❌ Impossible de lire le manifeste"
    ((ERROR_COUNT++))
fi

echo ""

# Résumé
echo "📊 RÉSUMÉ DE LA VALIDATION"
echo "=========================="
if [ $ERROR_COUNT -eq 0 ]; then
    echo "🎉 Toutes les vérifications PWA sont RÉUSSIES!"
    echo "✅ La PWA EDUCAFRIC est correctement configurée"
    exit 0
else
    echo "⚠️ $ERROR_COUNT erreur(s) détectée(s)"
    echo "❌ Veuillez corriger les problèmes avant le déploiement"
    exit 1
fi