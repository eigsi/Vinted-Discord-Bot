require('dotenv').config();

const discord = require('discord.js');
const bot = new discord.Client({intents : 3276799});
const puppeteer = require("puppeteer");
const fs = require('fs');
const express = require('express');
const app = express();
const createEmbed = require('./tools/embed.js');


//paramètres
const content = 'Pitié faites que ça marche';
const filePath = process.env.FILE_PATH || '/home/pptruser/data/test.txt';
const filePath_Init = process.env.FILE_PATH_INIT || '/home/pptruser/data/Init.txt';
const URL = process.env.URL || 'https://www.vinted.fr';
const port = process.env.PORT || 3000; //variable par défaut au cas où
const message = process.env.MESSAGE || 'Hello World!';
const token = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;

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

//formater les données
function dataToText(data){
    return data.map(item => {
        return `Titre: ${item.titre}\nPrix: ${item.prix}\nMarque: ${item.marque}\nTaille: ${item.taille}\nlien: ${item.lien}\n\n`;
    });
}
//formater les données pour discord
function dataToDiscord(data){
    return data.map(item => {
        return {
            title : item.titre,
            description : `💸 **Prix**: ${item.prix}\n🏷️ **Marque**: ${item.marque}\n📏 **Taille**: ${item.taille}\n`,
            url : item.lien,
            image : item.image
        }
    });
}
//----------------------------------------------------------------------------------------------------
//---------------------------------- FONCTIONS POUR DISCORD ------------------------------------------
//----------------------------------------------------------------------------------------------------

async function startBot(){
    try{
        await bot.login(token);
        console.log('Bot is connected');
    } catch (err){
        console.error('Error connecting bot', err);
    }
}

async function discordData(data, channelId){
    try {
        const channel = await bot.channels.fetch(channelId);
        const formatedData = dataToDiscord(data);
        const promises = formatedData.map(async item => {
            const embed = createEmbed(item);
            await channel.send({ embeds: [embed]});
        });
        await Promise.all(promises);
        console.log('Data sent to Discord channel successfully');
    } catch (err) {
        console.error('Error sending data to Discord channel', err);
    }
}
//----------------------------------------------------------------------------------------------------
//---------------------------------- FONCTION WATCHER VINTED -----------------------------------------
//----------------------------------------------------------------------------------------------------

async function watcherVinted(URL){
    try{
        //Lancement du headless browser
        const browser = await puppeteer.launch({
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'
        });
        const page = await browser.newPage();
        //Aller sur l'URL à surveiller
        await page.goto(URL, { waitUntil: 'networkidle2' });
        // récupérer ce qui nous intéresse dans la page
        const data = await page.evaluate(() => {
            const results = []; //tableau pour stocker les données
            const items = document.querySelectorAll('a.new-item-box__overlay');
            const limitItems = Array.from(items).slice(0, 3); // limiter le nombre de résultats
            limitItems.forEach(item => {
                const titleAttribute = item.getAttribute('title');
                const parts = titleAttribute.split(', ')

                const titre = parts[0];
                const prix = parts[1].split(': ')[1];
                const marque = parts[2].split(': ')[1];
                const taille = parts[3].split(': ')[1];

                //Récupérer l'url de l'image
                const imgElement = item.closest('div.u-position-relative').querySelector('img');
                const image = imgElement ? imgElement.src : null;

                results.push({ titre, prix, marque, taille, lien : item.href, parts, image});
            });
            return results;
        });
        // Afficher les données dans la console pour inspection
        data.forEach(item => {
            console.log(item.parts);
        });
        // Formater les données pour les stocker dans un fichier
        const formattedData = dataToText(data);
        init(formattedData);
        //envoyer données à discord
        await discordData(data, channelId);
        //fermer le browser
        await browser.close();
    } catch (err) {
        console.error('Error collecting data', err);
    }
}

//----------------------------------------------------------------------------------------------------
//------------------------------------ AU DÉMARRAGE DU CONTAINER -------------------------------------
//----------------------------------------------------------------------------------------------------


//démarrer bot discord
(async () => {
    await startBot();
})();

bot.on("ready", async () => {
    await watcherVinted(URL);
})


//----------------------------------------------------------------------------------------------------
//------------------------------------ PARTIE WEB DU CONTAINER ---------------------------------------
//----------------------------------------------------------------------------------------------------

app.get ('/', (req, res ) => {
    fs.appendFile(filePath, content, (err) => {
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
