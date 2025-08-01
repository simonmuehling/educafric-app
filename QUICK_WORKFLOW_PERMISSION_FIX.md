# ⚡ FIX RAPIDE - Permissions Workflow GitHub

## 🎯 Action immédiate

Votre token GitHub manque la permission `workflow`. Voici la solution la plus rapide :

### Étape 1 : Nouveau token GitHub
```
1. GitHub → Settings → Developer settings → Personal access tokens
2. "Generate new token (classic)"
3. Cocher : ✅ repo + ✅ workflow 
4. Copier le nouveau token
```

### Étape 2 : Mettre à jour Git
```bash
# Remplacer NOUVEAU_TOKEN par votre vrai token
git remote set-url origin https://NOUVEAU_TOKEN@github.com/simonmuehling/educafric-platform.git
git push origin main
```

## 🔄 Alternative rapide

Si vous ne voulez pas créer nouveau token maintenant :

```bash
# 1. Annuler le dernier commit
git reset HEAD~1

# 2. Push sans workflows
git push origin main

# 3. Créer workflows directement sur GitHub interface
# Aller sur GitHub → Actions → New workflow → Copier-coller contenu
```

## ✅ Résultat attendu

Une fois corrigé :
- ✅ Workflows GitHub Actions opérationnels
- ✅ CI/CD pipeline automatique
- ✅ Build Android APK/AAB
- ✅ Branch protection configurée

Le problème est juste une permission manquante sur votre token !