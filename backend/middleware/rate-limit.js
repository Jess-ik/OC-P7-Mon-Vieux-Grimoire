const rateLimit = require('express-rate-limit');
//https://www.npmjs.com/package/express-rate-limit
module.exports = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 6,
    handler: function (req, res, next) {
        return res.status(429).json({ error: 'Vous avez envoyé trop de requêtes, attendez une minute' })
    }
});



  // const apiLimiter = rateLimit({
  //   windowMs: 15 * 60 * 1000, // 15 minutes
  //   max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  //   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  //   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // });

  //https://www.npmjs.com/package/express-rate-limit?activeTab=readme
//app.set('trust proxy', 2)