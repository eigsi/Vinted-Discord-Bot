# Les fichiers générés

Le dossier Data est un volume du container lié à un dossier local data situé à la racine du projet.

## test.txt
- Le fichier test est créé lors de la première visite sur l'url du container, avec un message prédéfini dans le fichier app.js
- Le message est de nouveau écrit dans le même fichier à chaque visite sur l'url

## Init.txt
- Le fichier Init est créé lors du lancement du container s'il n'existe pas déjà
- Les données récoltées par le container sont écrites dans le fichier Init