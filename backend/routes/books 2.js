/**********************ROUTER FILE**********************/ 

const express = require ('express');
const router = express.Router();
//Controllers
const bookCtrl = require('../controllers/books');
//Middlewares
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const resizeImg = require('../middleware/resizeImg');//Img resizing middleware (using sharp)





//get all books
router.get('/', bookCtrl.readAllBook);
//get best rated books, 3
router.get('/bestrating', bookCtrl.bestRatedBooks);
//get one book by id
router.get('/:id', bookCtrl.readOneBook);

// AUTH REQUIRED FOR THE FOLLOWING ROUTES (need to be created):
// Create a new book  
router.post('/', auth, multer, resizeImg, bookCtrl.createBook);
// Create a rating for an identified book
router.post('/:id/rating', auth, bookCtrl.createBookRating);
// Update book info
router.put('/:id', auth, multer, resizeImg, bookCtrl.updateBook);
// Delete book by id
router.delete('/:id', auth, bookCtrl.deleteBook);







module.exports = router;