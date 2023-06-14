const multer = require('multer');
const SharpMulter  =  require("sharp-multer");

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = SharpMulter({
  destination:(req, file, callback) =>callback(null, "images"),
              imageOptions:{
               quality: 80,
               resize: { width: 206, height: 260 },
                 },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');



// https://dev.to/ranjan/simple-node-js-resize-image-before-upload-using-sharp-multer-p8c
