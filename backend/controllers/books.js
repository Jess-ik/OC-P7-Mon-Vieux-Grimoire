const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ message: 'Vérifiez que tous les champs sont corretement remplis' }) })
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => { res.status(200).json(book); })
        .catch((error) => { res.status(404).json({ error: error }); });
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};



exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
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
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.ratings.includes(rating => rating.userId == req.body.userId)) {
                res.status(404).json({ message: 'Vous avez déja noté ce livre' });
            } else if (1 <= req.body.rating <= 5) {
                //push le userId et le grade dans le tableau rattings de l'objet book
                book.ratings.push({
                    userId: req.auth.userId,
                    grade: req.body.rating
                });
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

