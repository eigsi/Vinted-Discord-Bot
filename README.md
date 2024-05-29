# Stage technicien du 27 mai au 21 juillet 2024.

Le but de ce projet est de réaliser un watcher en JavaScript en utilisant un conteneur Docker.
## Prérequis
- Docker doit être installé
- Node.js doit être installé pour le developpement local

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
3. **Installer Chrome pour Puppeteer**
```bash
npx puppeteer browsers install chrome
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
```
### Explication des variables
- `PORT` = Port d'activation du docker
- `MESSAGE` = Message affiché sur l'url par défaut
- `FILE_PATH` = chemin et nom du fichier créé dans le volume à chaque venue sur l'url
- `FILE_PATH_INIT` = chemin et nom du fichier créé dans le volume au lancement du conteneur