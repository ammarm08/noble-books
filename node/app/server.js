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



