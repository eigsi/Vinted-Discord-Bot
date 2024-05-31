# compatible avec l'architecture arm64 des macs à puce Silicon
FROM --platform=$BUILDPLATFORM node:20-bullseye-slim

# Configure default locale (important for chrome-headless-shell).
ENV LANG en_US.UTF-8

# Installer les dépendances nécessaires pour Puppeteer et Chromium
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=arm64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] https://dl-ssl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r pptruser && useradd -rm -g pptruser -G audio,video pptruser

WORKDIR /home/pptruser

ENV DBUS_SESSION_BUS_ADDRESS=autolaunch:
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN npm install puppeteer
RUN npm install puppeteer-extra puppeteer-extra-plugin-stealth

COPY package*.json app.js ./

RUN npm install
RUN npm i discord.js
RUN npm install pg



COPY . .

# change l'utilisateur par soucis de sécurité
USER pptruser

EXPOSE 3000

# Point de montage
VOLUME /home/pptruser/data

CMD ["npm", "start"]


