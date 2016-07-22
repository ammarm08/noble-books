'use strict';

let app = require('./server-config.js');
let cluster = require('cluster');
const PORT = 8080;

function launchCluster () {
  if (cluster.isMaster) {
    let numWorkers = require('os').cpus().length;
    console.log('Master cluster setting up ' + numWorkers + ' workers...');
    createWorkers(numWorkers);
  } else {
    app.listen(PORT, function () { console.log('Listening on port', PORT); });
  }
}

function createWorkers (n) {
  for (let i = 0; i < n; i++) {
    createWorker();
  }
}

function createWorker () {
  let worker = cluster.fork();
  worker.on('exit', function (w, code, sig) {
    console.log('Worker ' + w.process.pid + ' died with code: ' + code + ', and signal: ' + sig);
    console.log('Spinning up new worker');
    createWorker(); // respawn on exit
  })
}

launchCluster();