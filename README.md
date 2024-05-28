# Stage technicien du 27 mai au 21 juillet 2024 au soir.

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

## Exécution du projet 
```bash
docker build -t nomConteneur .
docker run -dp 3000:3000 -v $(pwd)/data:/app/data nomConteneur
```

## Configuration des variables d'environnement
Les variables d'environnement du projet sont définies dans un fichier .env
### Exemple de configuartion 
```env
PORT = 3000
MESSAGE = 'Hello World'
FILE_PATH = '/app/data/test.txt'
```
### Explication des variables
- `PORT` = Port d'activation du docker
- `MESSAGE` = Message affiché sur l'url par défaut
- `FILE_PATH` = chemin et nom du fichier créé dans le volume
