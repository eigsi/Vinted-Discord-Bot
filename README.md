# Stage technicien du 27 mai au 21 juillet 2024.

Le but de ce projet est de réaliser un watcher en JavaScript en utilisant un conteneur Docker.

## Fonctionnalités actuelles du projet

Le container généré par le projet permet de :
- Lancer un navigateur headless pour scraper des données sur les articles du site Vinted 
- se connecter à un bot discord pour envoyer les données récupérées sur un channel du serveur discord hébergeant le bot
- Créer un fichier texte `init.txt` localement et y stocker les informations scrapées
- Créer un fichier texte `test.txt` localement et y stocker un message prédéfini à chaque visite sur l'url du container

Le bot est capable de scraper les titre, prix, marque, taille, url et image des articles de la page Vinted choisie.
Son taux de rafraîchissement est de 5 secondes.

## Prérequis
- Docker doit être installé
- Node.js & discord.js doivent être installés pour le développement local

## Installation
1. **Cloner le repo**
```bash
git clone https://github.com/eigsi/stage.git
cd stage
```
2. **Créer un dossier pour le volume (si ce n'est pas déjà fait)**
```bash
mkdir -p $(pwd)/data
```
3. **Installer Chrome pour Puppeteer & les bibliothèques nécessaires**
```bash
npx puppeteer browsers install chrome
npm i discord.js
```

## Exécution du projet 
- Il est nécessaire d'ajouter `--platform linux/arm64` seulement pour les mac ayant une puce Apple Silicon
- `nom` est à remplacer par le nom du conteneur
- `--load` permet de générer l'image docker localement et pas seulement dans le cache

```bash
docker buildx build --platform linux/arm64 -t nom . --load
docker run --platform linux/arm64 -i --init --rm --cap-add=SYS_ADMIN --name puppeteer-chrome -dp 3000:3000 -v $(pwd)/data:/home/pptruser/data nom

```

## Configuration des variables d'environnement
Les variables d'environnement du projet sont définies dans un fichier .env
### Exemple de configuration 
```env
PORT = 3000
MESSAGE = 'Hello World'
FILE_PATH = '/home/pptruser/data/test.txt'
FILE_PATH_INIT = '/home/pptruser/data/Init.txt'
URL = 'https://www.vinted.fr/catalog?catalog[]=2050&price_to=50&currency=EUR&price_from=10'
DISCORD_BOT_TOKEN = 'CNIQ4TIFNOEIPJFQOjosdfjqsofi4MTkzNqrdFEL3progjq987a40'
DISCORD_CHANNEL_ID = '1236259281935007744'
```
### Explication des variables
- `PORT` = Port d'activation du docker
- `MESSAGE` = Message affiché sur l'url par défaut
- `FILE_PATH` = chemin et nom du fichier créé dans le volume à chaque venue sur l'url
- `FILE_PATH_INIT` = chemin et nom du fichier créé dans le volume au lancement du conteneur
- `URL` = lien de la page à surveiller
- `DISCORD_BOT_TOKEN` = Token du bot discord
- `DISCORD_CHANNEL_ID` = ID du channel discord