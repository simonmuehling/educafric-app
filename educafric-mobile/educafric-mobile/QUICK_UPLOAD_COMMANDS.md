# ⚡ COMMANDES RAPIDES GITHUB UPLOAD

## Copiez-collez ces commandes UNE PAR UNE dans le Shell Replit :

```bash
# Nettoyer les verrous Git
rm -rf .git/index.lock .git/config.lock 2>/dev/null || true

# Ajouter tous les fichiers EDUCAFRIC
git add .

# Commiter avec votre code complet
git commit -m "EDUCAFRIC Platform v4.2.1 - Complete Educational Management System with Android assets and multi-role dashboards"

# Configurer la branche
git branch -M main

# Supprimer ancien remote
git remote remove origin 2>/dev/null || true

# Ajouter votre repository
git remote add origin https://github.com/simonmuehling/educafric-platform.git

# Upload vers GitHub
git push -u origin main
```

## Si GitHub demande vos identifiants :
- **Username** : `simonmuehling`
- **Password** : Utilisez un Personal Access Token (pas votre mot de passe)

## Générer un token sur GitHub :
1. GitHub.com → Settings → Developer settings → Personal access tokens
2. "Generate new token" → Cocher "repo" → Générer
3. Copiez le token et utilisez-le comme mot de passe

## ✅ Résultat attendu :
Votre projet EDUCAFRIC complet (2,892 lignes) sera uploadé avec tous les assets Android !