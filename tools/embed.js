const { EmbedBuilder } = require('discord.js');

// Configuration du message envoyé sur discord
function createEmbed(item) {
    return new EmbedBuilder()
        .setTitle(item.title)
        .setDescription(item.description)
        .setURL(item.url)
        .setImage(item.image);  // Utiliser setImage pour inclure l'image
}

module.exports = createEmbed;