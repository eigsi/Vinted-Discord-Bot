require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();

// paramètres du fichier à créer dans le volume
const content = 'Pitié faites que ça marche';
const filePath = process.env.FILE_PATH || '/app/data/test.txt';

const port = process.env.PORT || 3000; //variable par défaut au cas où
const message = process.env.MESSAGE || 'Hello World!';


app.get ('/', (req, res ) => {
    fs.appendFile(filePath, content, (err) => {  //appendFile ajoute du contenu à un fichier ou le créer
        if (err){
            console.error('Error writing file', err);
        }
        else {
            console.log('File written successfully');
        }
    })
    res.send(message)
});
app.listen (port, () => console.log(`Server is running on port ${port}`));
