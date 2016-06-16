'use strict'

const SITE = 'amazon.com';

let Google = require('google');
Google.resultsPerPage = 3;

let fs = require('fs');

function getResponse(msg, cb) {
  Google(msg + 'site:' + SITE, function (err, res) {
    if (err) {
      return cb(err);
    } else {
      let results = res.links[0].href;
      return cb(results);
    }
  })
}

fs.readFile('./data/remaining.tsv', 'utf8', function(err, data) {
  if (err) {
    console.error(err);
  } else {
    var lines = data.split('\r\n');
    lines.forEach(function(line) {
      var msg = line.replace('\t', ' ');
      getResponse(msg, function(l) {
        console.log(msg + '\t' + l);
      })
    })
  }
})
