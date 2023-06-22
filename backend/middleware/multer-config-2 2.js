const multer = require('multer');
const SharpMulter = require("sharp-multer");

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};


const storage = SharpMulter({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  },
 imageOptions: {
  fileFormat: "webp",
    quality: 100,
    resize: { width: 824, height: 1040 },
  },  
 });

module.exports = multer({ storage }).single('image');


// https://dev.to/ranjan/simple-node-js-resize-image-before-upload-using-sharp-multer-p8c




// Redimensionnement de l'image
module.exports.resizeImage = (req, res, next) => {
    // Je vérifie si une image a été chargé et si un chemin existe
    if (req.file && req.file.path) {
     const originalImagePath = req.file.path;
     // je remplace l'extension par webp
     const outputPath = req.file.path.replace(/\.[^.]+$/, '.webp');
     
     // Utilisation de la biblio sharp pour convertir l'image et la sauvegarder
     sharp(originalImagePath)
         .toFormat('webp')
         .resize({
             width: 800,
             height: 800,
             fit: 'contain'
         })// redimension des images
         .toFile(outputPath)
         .then(() => {
             // Je vérifie si le fichier d'origine existe pour le supprimer
             if (fs.existsSync(originalImagePath)) {
                 fs.unlinkSync(originalImagePath);
             }
             // mise à jour du chemin du fichier
             req.file.path = outputPath.replace('images\\', '');
             next();
         })
         .catch(error => {
             console.error('Error converting image to webp:', error);
             next();
         });
 } else {
     // si aucune image, je passe au middleware suivant
     next();
 }
 };