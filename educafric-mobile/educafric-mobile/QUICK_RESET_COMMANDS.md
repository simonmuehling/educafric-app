# ⚡ COMMANDES RAPIDES - Reset Git complet

## Copiez-collez ces commandes UNE PAR UNE :

```bash
# 1. Aller dans le bon dossier
cd ~/workspace

# 2. Supprimer Git complètement et recommencer
rm -rf .git
git init
git branch -M main

# 3. Créer .gitignore strict
cat > .gitignore << 'EOF'
node_modules/
dist/
build/
.env
.env.local
*.tar.gz
*.zip
*backup*
attached_assets/
backups/
*.sql
*.dump
logs/
*.log
*.tmp
*.temp
.DS_Store
.replit
.upm/
venv/
__pycache__/
EOF

# 4. Ajouter SEULEMENT le code essentiel
git add client/ server/ shared/ android/ public/ scripts/
git add package.json capacitor.config.ts README.md replit.md .env.example .gitignore

# 5. Vérifier qu'aucun gros fichier n'est inclus
git status

# 6. Commit propre
git commit -m "EDUCAFRIC Platform v4.2.1 - Clean commit without large backup files"

# 7. Ajouter remote avec votre token (REMPLACEZ YOUR_TOKEN)
git remote add origin https://YOUR_TOKEN@github.com/simonmuehling/educafric-platform.git

# 8. Push final
git push -f origin main
```

## 🔑 IMPORTANT
Remplacez YOUR_TOKEN par votre vrai token GitHub dans l'étape 7.

## ✅ Cette méthode va réussir car :
- Historique Git complètement nettoyé
- Aucun gros fichier dans le nouveau repository
- Upload propre sans conflit