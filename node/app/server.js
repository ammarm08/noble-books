'use strict';

const app = require('./server-config.js')
const cluster = require('cluster')
const PORT = 8080

function launchCluster () {
  if (cluster.isMaster) {
    const numWorkers = require('os').cpus().length
    console.log('Master cluster setting up ' + numWorkers + ' workers...')
    createWorkers(numWorkers)
  } else {
    app.listen(PORT, function () { console.log('Listening on port', PORT) })
  }
}

function createWorkers (n) {
  for (let i = 0; i < n; i++) {
    createWorker()
  }
}

function createWorker () {
  const worker = cluster.fork()
  worker.on('exit', function (w, code, sig) {
    console.log('Worker ' + w.process.pid + ' died with code: ' + code + ', and signal: ' + sig)
    console.log('Spinning up new worker')
    createWorker() // respawn on exit
  })
}

launchCluster()
