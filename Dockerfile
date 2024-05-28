FROM node:14
LABEL authors="antoine"
WORKDIR /app
COPY package*.json app.js ./
RUN npm install
COPY . .
EXPOSE 3000
# Point de montage
VOLUME /app/data

CMD ["npm", "start"]

