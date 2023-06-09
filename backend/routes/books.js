const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const resizeImg = require('../middleware/resize-img');


const booksController = require('../controllers/books');

router.get('/', booksController.getAllBooks);
router.get('/bestrating', booksController.getBestRate);
router.post('/', auth, multer, resizeImg,  booksController.createBook);
router.get('/:id', booksController.getOneBook);
router.put('/:id', auth, multer, resizeImg,  booksController.modifyBook);
router.delete('/:id', auth, booksController.deleteBook);
router.post('/:id/rating', auth, booksController.rateBook);

module.exports = router;
