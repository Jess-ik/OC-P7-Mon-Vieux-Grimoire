const bcrypt = require('bcrypt');
const User= require('../models/User');
const jwt = require('jsonwebtoken');

//au moins une lettre majuscule, une lettre minuscule, un chiffre, et a une longueur minimale de 6 caractères
const passwordRegex = /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/;
//format email
const emailRegex = /^([a-z0-9_\.-]+\@[\da-z\.-]+\.[a-z\.]{2,6})$/;

exports.signup = (req, res, next) => {
  //on récupère l'email et le mdp envoyés par l'utilisateur
  const password = req.body.password;
  const email = req.body.email;

  //on vérifie la complexité du mdp
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Le mot de passe ne respecte pas les critères de complexité.' });
  }

  //on vérifie le format de l'email
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "L'adresse e-mail n'est pas valide." });
  }

  //on hash le mdp a 10 tours
  bcrypt.hash(password, 10)
    .then(hash => {
      //on crée un nouvel utilisateur avec l'email et le hash du mdp
      const user = new User({
        email: email,
        password: hash
      });
      //on enregistre l'objet dans la BDD
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    //on cherche un User avec l'email correspondant
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            //s'il y en a un, on compare le mdp envoyé et celui de l'objet User trouvé
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    //s'il correspond, on génère un token valide 4h qui permettra d'avoir les authorisations necessaires par la suite
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '4h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };
