const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

//on utilise multer pour gérer le stockage des fichiers sur le disque
const storage = multer.diskStorage({ //Save on disk - config object for multer
  //on defini le dossier de destination des images 
  destination: (req, file, callback) => { 
    callback(null, 'images');
  },
  //on défini le nom du fichier
  filename: (req, file, callback) => { //define file name
    //on remplace les espaces par des underscore et on supprime l'extension
    const name = file.originalname.split(' ').join('_').replace(/\.[^.]*$/,''); 
    //on récupère le type de fichier dans la constante extension
    const extension = MIME_TYPES[file.mimetype]; // generate file extension
    //on renome le fichier en y ajoutant la date en millisecondes pour le rendre unique et son extension
    callback(null, name + Date.now() + '.' + extension); 
  }
});

//on telecharge un seul fichier image en utilisant l'objet de configuration storage pour spécifier où et comment enregistrer les fichiers téléchargés
module.exports = multer({storage: storage}).single('image');