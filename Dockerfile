FROM node:14
LABEL authors="antoine"
WORKDIR /app
COPY package*.json app.js ./
RUN npm install
EXPOSE 3000

# Point de montage
VOLUME /app/data

CMD ["sh","-c", "echo 'Pitié faites que ça marche' > /app/data/test.txt && npm start"]
# run le docker avec la commande -v $(pwd)/data:/app/data" pour lier le volume au dossier data

