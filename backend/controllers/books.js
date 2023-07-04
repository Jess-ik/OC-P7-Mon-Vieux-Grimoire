const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    //on convertit le JSON en objet pour le manipuler dans bookObject
    const bookObject = JSON.parse(req.body.book); 
    // //on supprime l'id généré automatiquement pas mongoDB
    // console.log(bookObject)
    // delete bookObject._id; 
    //on supprime le userId pour des raisons de sécurité et pour éviter toute manipulation non autorisée de cette information lors de la modification du livre
    delete bookObject._userId; 

    //on crée une nouvelle instance du modele Book
    const book = new Book({
        //on récupère toutes les propriétés
        ...bookObject,
        //on récupère le userId de l'utilisateur authentifié
        userId: req.auth.userId,
        //on crée l'url de l'image uplodé
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized-${req.file.filename.replace(/\.[^.]*$/, '')}.webp`,
        //on crée l'objet ratings en sauvegardant le userId et sa note donnée 
        ratings: { 
            userId: req.auth.userId,
            grade: bookObject.ratings[0].grade
        },
        //on définie la note moyenne qui est = à la note qui vient d'etre donnée (c'est le premier à noter le livre)
        averageRating: bookObject.ratings[0].grade 
    });
    //on enregistre le nouveau book
    book.save() 
        .then(() => res.status(201).json({ message: "Livre enregistré !" }))
        .catch(error => res.status(400).json({ error })); 
};

exports.getOneBook = (req, res, next) => {
    //on cherche le premier livre dont le parametre id correspond au id de la route
    Book.findOne({ _id: req.params.id })
        .then((book) => { res.status(200).json(book); })
        .catch((error) => { res.status(404).json({ error: error }); });
};

exports.modifyBook = (req, res, next) => {
    //on regarde si la requete contient une image
    const bookObject = req.file ? { 
        //on convertit le JSON en objet pour le manipuler dans bookObject
        ...JSON.parse(req.body.book),
        //on crée l'url de la nouvelle image
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized-${req.file.filename.replace(/\.[^.]*$/, '')}.webp`
    } : { ...req.body }; // If not, just get req body obj
    //on supprime le userId pour des raisons de sécurité et pour éviter toute manipulation non autorisée de cette information lors de la modification du livre
    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then(book => {
            //on verifie si l'utilisateur correspond au userId de celui qui a crée le book
            if (book.userId != req.auth.userId) { 
                res.status(401).json({ message: 'Not authorized' });
            } else {
                if (req.file) {
                    //S'il y a une nouvelle image, on supprime (unlink) et remplace (updateOne) l'ancienne
                    const oldImg = book.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${oldImg}`, () => {
                        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                            .then(() => res.status(200).json({ message: "Livre modifié!" }))
                            .catch(error => res.status(400).json({ error }));
                    });
                } else {
                    //S'il n'y a pas de nouvelle image, on met à jour les infos du livres
                    Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: "Livre modifié!" }))
                        .catch(error => res.status(400).json({ error }));
                };
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    //on récupère le livre à l'id correspondant
    Book.findOne({ _id: req.params.id })
        .then(book => {
            //on vérifie que l'utilisateur est celui qui a crée se livre
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                //on récupère le nom du fichier
                const filename = book.imageUrl.split('/images/')[1];
                //on supprime le fichier du dossier images
                fs.unlink(`images/${filename}`, () => {
                    //on supprime le book à l'id correspondant
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.getBestRate = (req, res, next) => {
    //https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/sort/ pour ranger les notes par ordre décroissant
    //https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/limit/ pour prendre les 3e 
    Book.find().sort({ averageRating: -1 }).limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.rateBook = (req, res) => {
    //on récupère le livre à l'id correspondant
    Book.findOne({ _id: req.params.id })
        .then(book => {
            //on vérifie si l'utilisateur a déjà noté le libre
            if (book.ratings.includes(rating => rating.userId == req.auth.userId)) {
                res.status(404).json({ message: 'Vous avez déja noté ce livre' });
            // on vérifie que la note soit comprise entre 1 et 5
            } else if (1 > req.body.rating > 5) {
                res.status(404).json({ message: 'La note soit être comprise entre 1 et 5' });
            } else {
                //push le userId et le grade dans le tableau rattings de l'objet book
                book.ratings.push({
                    userId: req.auth.userId,
                    grade: req.body.rating
                });
                //on initialise la somme de toutes les notes du tableau ratings
                let sumGrades = 0
                //pour chaque index du tableau ratings, on récupère la 'grade' et on l'ajoute à la somme des notes
                for (let i = 0; i < book.ratings.length; i++) {
                    let indexGrade = book.ratings[i].grade;
                    sumGrades += indexGrade;
                }
                //on actualise la note moyenne en divisant la somme des notes par le nombre de notes dispo dans le tableau
                book.averageRating = Math.round((sumGrades / book.ratings.length) * 100) / 100;
                return book.save();
            }
        })
        .then((book) => { res.status(200).json(book); })
        .catch((error) => { res.status(404).json({ error: error }); });
};
