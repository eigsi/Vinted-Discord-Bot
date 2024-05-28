require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();

// paramètres du fichier à créer dans le volume quand on va sur l'url
const content = 'Pitié faites que ça marche';
const filePath = process.env.FILE_PATH || '/app/data/test.txt';

// paramètres du fichier à créer dans le volume au lancement
const content_Init = 'Fichier créé au démarrage du container';
const filePath_Init = process.env.FILE_PATH_INIT || '/app/data/Init.txt';

const port = process.env.PORT || 3000; //variable par défaut au cas où
const message = process.env.MESSAGE || 'Hello World!';

function init() {
    fs.appendFile(filePath_Init, content_Init, (err) => {
        if (err){
            console.error('Error writing file', err);
        }
        else {
            console.log('Init File written successfully');
        }
    })
}

init();

app.get ('/', (req, res ) => {
    fs.appendFile(filePath, content, (err) => {  //appendFile ajoute du contenu à un fichier ou alors le créer
        if (err){
            console.error('Error writing file', err);
        }
        else {
            console.log('Test File written successfully');
        }
    })
    res.send(message)
});
app.listen (port, () => console.log(`Server is running on port ${port}`));
