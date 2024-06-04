require('dotenv').config();

const discord = require('discord.js');
const bot = new discord.Client({intents : 3276799});
const puppeteer = require("puppeteer-extra");
const fs = require('fs');
const express = require('express');
const app = express();
const createEmbed = require('./tools/embed.js');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { Client } = require('pg'); // module PostgreSQL pour node

// permet de rendre le bot moins détectable par les sites web
puppeteer.use(StealthPlugin());

//variables de la boucle while
let lastMaxId = 0;
let continueScraping = false;

//paramètres
const content = 'test';
const filePath = process.env.FILE_PATH || '/home/pptruser/data/test.txt';
const filePath_Init = process.env.FILE_PATH_INIT || '/home/pptruser/data/Init.txt';
const URL = process.env.URL || 'https://www.vinted.fr';
const port = process.env.PORT || 3000; 
const messageWeb = process.env.MESSAGE || 'Hello World!';
const token = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;

//connection à la base de données
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database successfully');
    } catch (err) {
        console.error('Error connecting to PostgreSQL database', err);
    }
}

//----------------------------------------------------------------------------------------------------
//----------------------------------- FONCTIONS DE PREPARATION----------------------------------------
//----------------------------------------------------------------------------------------------------

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

//scroll de la page pour avoir suffisamment d'items
async function autoScroll(page, nbItems) {

    const scrollResults = await page.evaluate(async (nbItems) => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight || document.querySelectorAll('a.new-item-box__overlay').length >= nbItems) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    }, nbItems);
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

async function watcherVinted(URL, lastMaxId, nbItems = 5){
    try{
        //Lancement du headless browser
        const browser = await puppeteer.launch({
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'
        });
        const page = await browser.newPage();

        while (continueScraping) {
            //Aller sur l'URL à surveiller
            await page.goto(URL, { waitUntil: 'networkidle2' });

            //Récupérer le nombre d'items avant de scroller
            const itemsBeforeScroll = await page.evaluate(() => {
                return document.querySelectorAll('a.new-item-box__overlay').length;
            });
            console.log(`Number of items found before scroll: ${itemsBeforeScroll}`);

            // Scroller la page pour charger un minimum d'items
            console.log('Scrolling page...');
            await autoScroll(page, nbItems);

            // récupérer ce qui nous intéresse dans la page
            console.log('Collecting data...');
            const { results, logs } = await page.evaluate((lastMaxId, nbItems) => {
                const results = []; //tableau pour stocker les données
                const logs = [];
                const items = document.querySelectorAll('a.new-item-box__overlay');
                logs.push(`Number of items found: ${items.length}`);
                const limitItems = Array.from(items).slice(0, nbItems); // limiter le nombre de résultats
                logs.push(`Number of items limited to: ${limitItems.length}`);
                limitItems.forEach(item => {
                    const productId = parseInt(item.href.match(/\/items\/(\d+)-/)[1]);
                    //Récupérer l'url de l'image
                    if (productId > lastMaxId) {
                    const titleAttribute = item.getAttribute('title');
                    const parts = titleAttribute.split(', ')

                    const titre = parts[0];
                    const prix = parts[1].split(': ')[1];
                    const marque = parts[2].split(': ')[1];
                    const taille = parts[3].split(': ')[1];


                    const imgElement = item.closest('div.u-position-relative').querySelector('img');
                    const image = imgElement ? imgElement.src : null;

                    results.push({ titre, prix, marque, taille, lien : item.href, parts, image, productId});
                    }
                });
                return { results, logs };
            }, lastMaxId, nbItems);

            //afficher les logs
            logs.forEach(log => console.log(log));

            if (results.length > 0) {
                console.log('Data collected:', results.length, 'items');
                lastMaxId = Math.max(...results.map(item => item.productId)); //nouveau maxId
                const formattedData = dataToText(results);
                init(formattedData); // data envoyé dans init.txt
                await discordData(results, channelId); // data envoyé sur Discord

                //envoyer la data dans la db
                for (const item of results) {
                    const description = {
                        titre: item.titre,
                        prix: item.prix,
                        marque: item.marque,
                        taille: item.taille,
                        lien: item.lien,
                        id: item.productId
                    };
                    try {
                        await client.query(
                            'INSERT INTO articles (description) VALUES ($1)',
                            [description]
                        );
                        console.log(`Article ${item.productId} inserted successfully.`);
                    } catch (err) {
                        console.error('Error inserting data into PostgreSQL', err);
                    }
                }
            }else {
                console.log('No new items');
            }
            // Afficher les données dans la console pour inspection
            results.forEach(item => {
                console.log(item.parts);
            });
            await new Promise(resolve => setTimeout(resolve, 500)); //temps de pause
        }
        await browser.close();
    } catch (err) {
        console.error('Error collecting data', err);
    }
}

//fonction pour lancer la boucle
async function startScraping() {
    if (!continueScraping) {
        continueScraping = true;
        await watcherVinted(URL, lastMaxId);
    }
}

//fonction pour arrêter la boucle
async function stopScraping() {
    if (continueScraping) {
        continueScraping = false;
    }
}
//----------------------------------------------------------------------------------------------------
//------------------------------------ AU DÉMARRAGE DU CONTAINER -------------------------------------
//----------------------------------------------------------------------------------------------------


//démarrer bot discord & connection à la db
(async () => {
    await startBot();
    await connectToDatabase();
})();

bot.on("ready", async () => {
    await watcherVinted(URL, lastMaxId, 5);
})

//écoute des commandes start et stop
bot.on('messageCreate', async (message) => {
    if (message.content === '!startBot') {
        await message.reply('Scraping started 👍');
        await startScraping();
    }
    if (message.content === '!stopBot') {
        await stopScraping();
        await message.reply('Scraping stopped 🛑');
    }
});


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
    res.send(messageWeb)
});
app.listen (port, () => console.log(`Server is running on port ${port}`));
