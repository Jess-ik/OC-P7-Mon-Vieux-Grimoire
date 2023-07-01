const rateLimit = require('express-rate-limit');
//https://www.npmjs.com/package/express-rate-limit
module.exports = rateLimit({
    //periode de 1min
    windowMs: 1 * 60 * 1000,
    //6 requetes autorisees
    max: 6,
    //si la limite est depassée : erreur 429 Too Many Request
    handler: function (req, res, next) {
        return res.status(429).json({ error: 'Vous avez envoyé trop de requêtes, attendez une minute' })
    }
});



