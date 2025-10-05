# 🔐 Résolution : Token GitHub sans permission `workflow`

## ❌ Problème identifié
Votre Personal Access Token GitHub n'a que les permissions `repo` mais pas `workflow`. 
GitHub refuse les workflows sans cette permission spécifique.

## ✅ Solutions disponibles

### Solution 1 : Créer nouveau token avec permissions workflow (RECOMMANDÉ)

1. **Aller sur GitHub** → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Créer nouveau token** → "Generate new token (classic)"
3. **Cocher ces permissions** :
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages)
4. **Générer et copier** le nouveau token
5. **Mettre à jour Git** :
   ```bash
   git remote set-url origin https://NOUVEAU_TOKEN@github.com/simonmuehling/educafric-platform.git
   git push origin main
   ```

### Solution 2 : Créer workflows directement sur GitHub

1. **Sur GitHub** → Votre repo → Actions → "New workflow"
2. **Copier-coller** le contenu des fichiers :
   - `.github/workflows/ci.yml`
   - `.github/workflows/android-release.yml`
3. **Commit directement** sur GitHub
4. **Pull localement** :
   ```bash
   git pull origin main
   ```

### Solution 3 : Push sans workflows (temporaire)

```bash
# Supprimer temporairement les workflows
git reset HEAD~1
git stash

# Push le reste
git push origin main

# Restaurer et créer workflows sur GitHub
git stash pop
```

## 🎯 Recommandation

**Utilisez la Solution 1** - Créer un nouveau token avec permissions `workflow`.
C'est la méthode la plus propre pour le développement futur.

## 📋 Permissions token recommandées pour EDUCAFRIC

Pour un développement complet :
- ✅ `repo` - Accès complet au repository
- ✅ `workflow` - Gestion GitHub Actions
- ✅ `write:packages` - Publication packages
- ✅ `read:org` - Lecture organisation (si applicable)

## 🚀 Après résolution

Une fois les workflows sur GitHub :
1. **Actions** → Voir l'exécution automatique
2. **Settings → Branches** → Configuration protection avec status checks
3. **Release v4.2.1** → Build Android automatique

Votre pipeline CI/CD sera opérationnel avec génération APK/AAB automatique !