require('dotenv').config();

const puppeteer = require("puppeteer");
const fs = require('fs');
const express = require('express');
const app = express();

//parameters
const content = 'Pitié faites que ça marche';
const filePath = process.env.FILE_PATH || '/home/pptruser/data/test.txt';
const filePath_Init = process.env.FILE_PATH_INIT || '/home/pptruser/data/Init.txt';
const port = process.env.PORT || 3000; //variable par défaut au cas où
const message = process.env.MESSAGE || 'Hello World!';

//créer le fichier dans lequel on collecte la data
function init(data) {
    const content_Init = data.join('\n')  || 'lancement du fichier'; // prend les données récupérées et les met dans un string
    fs.appendFile(filePath_Init, content_Init, (err) => {
        if (err){
            console.error('Error writing Init file', err);
        }
        else {
            console.log('Init File written successfully');
        }
    })
}

// fonction du watcher
async function watcher(){
    try{
        //URL de la page à surveiller
        const URL= "https://www.vinted.fr/"

        //Lancement du "headless browser"
        const browser = await puppeteer.launch({
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'
        });
        const page = await browser.newPage();
        //Aller sur l'URL à surveiller
        await page.goto(URL);
        // récupérer ce qui nous intéresse dans la page
        const data = await page.evaluate(() => {
            const results = []; //tableau pour stocker les données
            const items = document.querySelectorAll('h1'); //sélectionner les éléments à récupérer
            items.forEach(item => {
                results.push(item.innerText);
            });
            return results;
        });
        //appel de la fonction init pour stocker les données dans un fichier
        init(data);
        //fermer le browser
        await browser.close();
    }
    catch (err) {
        console.error('Error collecting data', err);
    }
}

// lancement de watcher en asynchrone pour pouvoir mettre await
(async () => {
    await watcher();
})();

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
