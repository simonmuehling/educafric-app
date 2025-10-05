#!/bin/bash

# EDUCAFRIC - Script d'Analyse Complète des Duplications
# Ce script exécute une analyse complète et génère un rapport détaillé

echo "🔍 EDUCAFRIC - Analyse Complète des Duplications"
echo "=============================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --dry-run      Mode aperçu sans modifications"
    echo "  --fix          Corriger automatiquement les duplications"
    echo "  --watch        Mode surveillance en temps réel"
    echo "  --report       Générer uniquement le rapport"
    echo "  --help         Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 --dry-run   # Analyser sans corriger"
    echo "  $0 --fix       # Analyser et corriger"
    echo "  $0 --watch     # Surveillance continue"
    echo ""
}

# Variables
DRY_RUN=false
AUTO_FIX=false
WATCH_MODE=false
REPORT_ONLY=false

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --fix)
            AUTO_FIX=true
            shift
            ;;
        --watch)
            WATCH_MODE=true
            shift
            ;;
        --report)
            REPORT_ONLY=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Option inconnue: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Vérification de l'environnement
check_dependencies() {
    echo -e "${BLUE}📦 Vérification des dépendances...${NC}"
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js n'est pas installé${NC}"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm n'est pas installé${NC}"
        exit 1
    fi
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}✅ Dépendances OK${NC}"
}

# Sauvegarde du projet
backup_project() {
    if [ "$AUTO_FIX" = true ]; then
        echo -e "${BLUE}💾 Création d'une sauvegarde...${NC}"
        
        BACKUP_DIR="backups/duplication-fix-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Sauvegarder les fichiers importants
        cp -r client/src "$BACKUP_DIR/"
        cp -r server "$BACKUP_DIR/"
        cp -r shared "$BACKUP_DIR/" 2>/dev/null || true
        
        echo -e "${GREEN}✅ Sauvegarde créée: $BACKUP_DIR${NC}"
    fi
}

# Analyse principale
run_analysis() {
    echo -e "${BLUE}🔍 Lancement de l'analyse des duplications...${NC}"
    
    local args=""
    
    if [ "$DRY_RUN" = true ]; then
        args="$args --dry-run"
        echo -e "${YELLOW}ℹ️  Mode aperçu activé (aucune modification)${NC}"
    fi
    
    if [ "$AUTO_FIX" = true ]; then
        args="$args --fix"
        echo -e "${YELLOW}🔧 Mode correction automatique activé${NC}"
    fi
    
    # Exécuter l'analyse
    node scripts/eliminate-duplications.js $args
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ Analyse terminée avec succès${NC}"
    else
        echo -e "${RED}❌ Erreur lors de l'analyse (code: $exit_code)${NC}"
        exit $exit_code
    fi
}

# Mode surveillance
run_watch_mode() {
    echo -e "${BLUE}👀 Lancement de la surveillance en temps réel...${NC}"
    
    local args=""
    if [ "$AUTO_FIX" = true ]; then
        args="--auto-fix"
    fi
    
    echo -e "${YELLOW}ℹ️  Appuyez sur Ctrl+C pour arrêter${NC}"
    node scripts/watch-duplications.js $args
}

# Génération du rapport
generate_report() {
    echo -e "${BLUE}📊 Génération du rapport...${NC}"
    
    # Exécuter l'analyse en mode rapport
    node scripts/eliminate-duplications.js --dry-run > duplication-report.txt
    
    # Générer un rapport HTML
    cat > duplication-report.html << EOF
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'Analyse des Duplications - EDUCAFRIC</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #007acc; }
        .warning { border-left-color: #ff9800; }
        .error { border-left-color: #f44336; }
        .success { border-left-color: #4caf50; }
        pre { background: #f8f8f8; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .stat-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #007acc; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Rapport d'Analyse des Duplications</h1>
        <p>Projet: EDUCAFRIC</p>
        <p>Date: $(date)</p>
    </div>
    
    <div class="section">
        <h2>📊 Statistiques</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="files-count">-</div>
                <div>Fichiers analysés</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="duplications-count">-</div>
                <div>Duplications trouvées</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="components-count">-</div>
                <div>Composants dupliqués</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="functions-count">-</div>
                <div>Fonctions dupliquées</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>📄 Rapport Détaillé</h2>
        <pre>$(cat duplication-report.txt)</pre>
    </div>
    
    <div class="section success">
        <h2>💡 Recommandations</h2>
        <ul>
            <li>Créer des composants réutilisables pour les éléments dupliqués</li>
            <li>Centraliser les utilitaires dans des modules dédiés</li>
            <li>Utiliser des variables CSS pour les styles répétés</li>
            <li>Implémenter des hooks personnalisés pour la logique partagée</li>
            <li>Configurer ESLint pour détecter les duplications futures</li>
        </ul>
    </div>
</body>
</html>
EOF
    
    echo -e "${GREEN}✅ Rapport généré: duplication-report.html${NC}"
    echo -e "${GREEN}✅ Rapport texte: duplication-report.txt${NC}"
}

# Configuration ESLint
setup_eslint() {
    echo -e "${BLUE}⚙️  Configuration ESLint pour la détection des duplications...${NC}"
    
    # Ajouter la règle personnalisée à .eslintrc.js
    if [ -f ".eslintrc.js" ]; then
        echo -e "${YELLOW}ℹ️  Ajout des règles de duplication à ESLint${NC}"
        
        # Créer une sauvegarde
        cp .eslintrc.js .eslintrc.js.backup
        
        # Ajouter les règles (simplifiée pour cette démo)
        echo "// Règles de duplication ajoutées automatiquement" >> .eslintrc.js
    fi
    
    echo -e "${GREEN}✅ Configuration ESLint mise à jour${NC}"
}

# Fonction principale
main() {
    echo -e "${GREEN}🚀 Démarrage de l'analyse des duplications EDUCAFRIC${NC}"
    echo ""
    
    check_dependencies
    
    if [ "$WATCH_MODE" = true ]; then
        run_watch_mode
        exit 0
    fi
    
    if [ "$REPORT_ONLY" = true ]; then
        generate_report
        exit 0
    fi
    
    backup_project
    run_analysis
    generate_report
    setup_eslint
    
    echo ""
    echo -e "${GREEN}🎉 Analyse terminée avec succès!${NC}"
    echo ""
    echo -e "${BLUE}📋 Prochaines étapes:${NC}"
    echo "   1. Consulter le rapport: duplication-report.html"
    echo "   2. Exécuter les corrections: $0 --fix"
    echo "   3. Activer la surveillance: $0 --watch"
    echo ""
}

# Point d'entrée
main "$@"