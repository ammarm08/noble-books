'use strict';

let debug = require('debug')('https-server');
let app = require('./server-config.js');
let https = require('https');
let http = require('http');
let fs = require('fs');

const PORT = 8080;

// let config = {
//     key: fs.readFileSync('./ssl/private/bookswell.key'),
//     cert: fs.readFileSync('./ssl/certs/www_bookswell_io.certchain.crt')
// };

// let httpPort = 8080;
// let httpsPort = 8443;

// /* Two server instances. HTTP server redirects to HTTPS server */
// let sslEncryptedServer = function() {
//   http.createServer(app).listen(httpPort, function() {
//     console.log("HTTP listening on", httpPort);
//   });

//   https.createServer(config, app).listen(httpsPort, function() {
//     console.log("HTTPS securely listening on", httpsPort);
//   });
// };

app.listen(PORT, function() {
  console.log('Server listening on ', PORT);
});
