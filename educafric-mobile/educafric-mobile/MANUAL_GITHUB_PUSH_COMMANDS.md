# 🔧 Commandes manuelles - Push GitHub Actions

## Situation actuelle
- ✅ Workflows GitHub Actions créés localement
- ⚠️ Conflit Git avec changements distants
- 🎯 Besoin de synchroniser et pousser

## 📋 Commandes à exécuter manuellement

```bash
# 1. Nettoyer les verrous Git
cd ~/workspace
rm -f .git/index.lock .git/config.lock 2>/dev/null

# 2. Récupérer les changements distants
git fetch origin main

# 3. Fusionner les changements
git merge origin/main

# 4. Vérifier les workflows
ls -la .github/workflows/
git status

# 5. Ajouter les nouveaux workflows
git add .github/workflows/ci.yml
git add .github/workflows/android-release.yml

# 6. Committer les workflows
git commit -m "Add enhanced GitHub Actions workflows

✅ CI/CD Pipeline with comprehensive testing
✅ Android APK/AAB build automation  
✅ Security scanning and code quality checks
✅ Ready for branch protection rules"

# 7. Pousser vers GitHub
git push origin main
```

## ✅ Ce qui va être ajouté

### Workflow CI/CD (`ci.yml`)
- **5 jobs parallèles** : test, security, android-build, deploy-check, code-quality
- **Validation complète** : TypeScript, build React, audit sécurité
- **Android ready** : Vérification configuration Capacitor

### Workflow Android (`android-release.yml`)  
- **APK Debug** automatique pour tests
- **AAB Release** pour Google Play Store
- **Artifacts téléchargeables** depuis GitHub Actions

## 🎯 Après le push réussi

1. **GitHub → Actions** - Voir les workflows s'exécuter
2. **Attendre tous les jobs** ✅
3. **Settings → Branches** - Configurer protection avec status checks
4. **Sélectionner les jobs** : test, security, android-build, deploy-check, code-quality

## 🚀 Résultat final

Votre repository aura :
- ✅ Pipeline CI/CD professionnel
- ✅ Build Android automatisé
- ✅ Protection branches avec status checks
- ✅ Génération APK/AAB sur releases

Exécutez ces commandes une par une pour résoudre le conflit Git !