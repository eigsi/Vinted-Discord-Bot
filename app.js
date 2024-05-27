require('dotenv').config();
const express = require('express');
const app = express();

const port = process.env.PORT || 3000; //variable par défaut au cas ou
const message = process.env.MESSAGE || 'Hello World!';

app.get ('/', (req, res ) => res.send(message));
app.listen (port, () => console.log('Server is running on port *{port}'));
