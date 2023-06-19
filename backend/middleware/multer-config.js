const multer = require('multer');
const SharpMulter = require("sharp-multer");

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};


// const storage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, 'images');
//   },

//   filename: (req, file, callback) => {
//     const name = file.originalname.split(' ').join('_').replace(/\.[^.]+$/, '');
//     const extension = MIME_TYPES[file.mimetype];
//     callback(null,  name + '_' + Date.now() + '.' + 'webp');
//   }

//  });

 const storage = SharpMulter({
  destination: (req, file, callback) => {
         callback(null, 'images');
       },
imageOptions: {
  fileFormat: "webp",
    quality: 100,
    resize: { width: 824, height: 1040, resizeMode:"fill" },
    useTimestamp: true,
  },  
 });
 

module.exports = multer({ storage }).single('image');

