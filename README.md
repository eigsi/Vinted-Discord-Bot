# Stage technicien du 27 mai au 21 juillet 2024 au soir.

Le but de ce projet est de réaliser un watcher en JavaScript en utilisant un conteneur Docker.
## Exécution du projet 
```docker build -t nomConteneur .```
```docker run -dp 3000:3000 -v $(pwd)/data:/app/data nomConteneur```

