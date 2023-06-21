const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({ //Save on disk - config object for multer
  destination: (req, file, callback) => { // where to save files
    callback(null, 'images'); //no err, folder name
  },
  filename: (req, file, callback) => { //define file name
    const name = file.originalname.split(' ').join('_').replace(/\.[^.]*$/,''); 
    const extension = MIME_TYPES[file.mimetype]; // generate file extension
    callback(null, name + Date.now() + '.' + extension); // +timestamp : unique!
  }
});

module.exports = multer({storage: storage}).single('image'); // img file, unique