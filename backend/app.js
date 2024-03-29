const express = require('express');

const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
//plugin  contre les attaques d'injection de code malveillant dans les requêtes MongoDB
//https://www.npmjs.com/package/express-mongo-sanitize

const helmet = require('helmet');
// securisation : configuration des en-têtes HTTP, la protection contre les attaques XSS, la désactivation de la mise en cache côté client, etc.
//https://www.npmjs.com/package/helmet

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

const path = require('path');

//connexion mongo
require('dotenv').config();
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4pt78ld.mongodb.net/?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

//en tetes CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

//on securise
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  // crossOriginResourcePolicy: { policy: 'same-site' },
  crossOriginResourcePolicy: false,
  dnsPrefetchControl: true,
  expectCt: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
}));

//intercepte tout en format json ce qui nous donne le json dans req.body
app.use(express.json());
app.use(mongoSanitize());
//on configure la route vers le dossier images
app.use('/images', express.static(path.join(__dirname, 'images')));
//on definie les routes
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;