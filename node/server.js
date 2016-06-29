'use strict';

let debug = require('debug')('https-server');
let app = require('./server-config.js');
let https = require('https');
let http = require('http');
let fs = require('fs');

const PORT = 8080;

app.listen(PORT, function () {
  console.log('Listening on: ', PORT);
})

// let key;
// let cert;

// if (process.env.NODE_ENV) {
//   key = fs.readFileSync('./ssl/private/bookswell.key');
//   cert = fs.readFileSync('./ssl/certs/www_bookswell_io.certchain.crt');
// } else {
//   key = fs.readFileSync('./ssl/development/test.key');
//   cert = fs.readFileSync('./ssl/development/test.crt');
// }

// let config = {
//     key: key,
//     cert: cert,
//     passphrase: 'test'
// };

// let httpPort = 8080;
// let httpsPort = 8443;

/* Two server instances. HTTP server redirects to HTTPS server */
// let sslEncryptedServer = function() {
//   http.createServer(app).listen(httpPort, function() {
//     console.log("HTTP listening on", httpPort);
//   });

//   https.createServer(config, app).listen(httpsPort, function() {
//     console.log("HTTPS securely listening on", httpsPort);
//   });
// };



