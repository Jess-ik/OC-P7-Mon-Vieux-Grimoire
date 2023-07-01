//configure et demarre le serveur HTTP

const http = require('http');
const app = require('./app');

//Pour normaliser le numéro de port utilisé par le serveur
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

//port 4000 par defaut
const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

//Pour gérer les erreurs qui se produisent lors du démarrage du serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

//on crée le server HTPP avec app comme application associée
const server = http.createServer(app);

//on defini les gestionnaires d'evenement
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

//démarre le serveur et commence à écouter les connexions entrantes sur le port spécifié et active les deux evenements precedents
//le serveur est pret a recevoir les requetes
server.listen(port);
