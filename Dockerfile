FROM node:14
LABEL authors="antoine"
WORKDIR /app
COPY package*.json app.js ./
RUN npm install
COPY . .
EXPOSE 3000
# Point de montage
VOLUME /app/data

CMD ["sh","-c", "echo 'Pitié faites que ça marche...' > /app/data/test.txt && npm start"]

