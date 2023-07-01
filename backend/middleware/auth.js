const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        //on récupère le token dans l'en tete
        const token = req.headers.authorization.split(' ')[1];
        //on décode le token et sa clé secrete associée
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        //on récupère le userId du token
        const userId = decodedToken.userId;
        //on stock le userId vérifié dans l'objet auth  
        req.auth = {
            userId: userId
        };
        //si l'userId est validé et donc l'utilisateur authorisé on passe au middleware/fonction suivante
        next();
    } catch (error) {
        res.status(401).json({ error });
    }
};

