# ⚡ COMMANDES RAPIDES SEULEMENT

## Copiez-collez UNE PAR UNE dans le terminal :

```bash
# 1. Nettoyer Git
cd ~/workspace
rm -f .git/index.lock .git/config.lock .git/refs/heads/main.lock 2>/dev/null
pkill -f git 2>/dev/null || true

# 2. Récupérer le distant
git fetch origin main

# 3. Forcer votre version
git reset --hard HEAD
git clean -fd

# 4. Ajouter votre code
git add .

# 5. Commiter
git commit -m "EDUCAFRIC Platform v4.2.1 - Complete Educational Management System with 2,892 lines of code, Android v4.2.1 config, and complete assets"

# 6. Configurer authentification (REMPLACEZ YOUR_TOKEN par votre vrai token GitHub)
git config user.name "simonmuehling"
git remote set-url origin https://YOUR_TOKEN@github.com/simonmuehling/educafric-platform.git

# 7. Pousser (force push pour écraser le conflit)
git push -f origin main
```

## 🔑 TOKEN GITHUB REQUIS :
- GitHub.com → Settings → Developer settings → Personal access tokens
- "Generate new token" → Cocher "repo" → Copier le token
- Remplacer YOUR_TOKEN dans la commande ci-dessus

## ✅ Succès = Votre EDUCAFRIC complet sera sur GitHub !