'use strict';

let app = require('./server-config.js');
let cluster = require('cluster');
const PORT = 8080;

function restartWorkers () {
  let workerIds = [];

  for (let wid in cluster.workers) {
    workerIds.push(wid);
  }

  workerIds.forEach(function (wid) {
    cluster.workers[wid].send({
      text: 'shutdown',
      from: 'master'
    });

    setTimeout(function () {
      if (cluster.workers[wid]) {
        cluster.workers[wid].kill('SIGKILL');
      }
    }, 5000);
  });
}

if (cluster.isMaster) {
  let numWorkers = require('os').cpus().length;
  let fs = require('fs');
  let worker;

  console.log('Master cluster setting up ' + numWorkers + 'workers...');

  for (let i = 0; i < numWorkers; i++) {
    worker = cluster.fork();
    worker.on('message', function () {
      console.log('arguments', arguments);
    });
  }

  cluster.on('exit', function (_worker, code, signal) {
    console.log('Worker ' + _worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
    console.log('Starting a new worker');

    worker = cluster.fork();
    worker.on('message', function() {
      console.log('arguments', arguments);
    });
  });
} else {
  process.on('message', function (message) {
    if (message.type === 'shutdown') {
      process.exit(0);
    }
  });

  app.listen(PORT, function () {
    console.log('Worker ' + process.pid + ' is alive and listening on ', PORT);
  });
}