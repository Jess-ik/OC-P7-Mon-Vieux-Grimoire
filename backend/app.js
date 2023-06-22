const express = require('express');

const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
//plugin  contre les attaques d'injection de code malveillant dans les requêtes MongoDB
//https://www.npmjs.com/package/express-mongo-sanitize

const helmet = require('helmet') ;
// securisation : configuration des en-têtes HTTP, la protection contre les attaques XSS, la désactivation de la mise en cache côté client, etc.
//https://www.npmjs.com/package/helmet

const rateLimit  = require("express-rate-limit");
//https://www.npmjs.com/package/express-rate-limit

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

const path = require('path');

require('dotenv').config();
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4pt78ld.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

const app = express();

app.use((req, res, next) => {
    //res.setHeader('Access-Control-Allow-Origin', process.env.UrlFront);
    //res.setHeader('Cross-Origin-Resource-Policy', process.env.UrlFront);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


//app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginResourcePolicy: {policy: 'same-site'},
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
app.use('/images', express.static(path.join(__dirname, 'images')));
/*app.use('/images', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.UrlFront);
  next();
}, express.static(path.join(__dirname, 'images')));*/

app.use('/api', apiLimiter)
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);





module.exports = app;