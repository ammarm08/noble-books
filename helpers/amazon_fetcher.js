'use strict'

const SITE = 'amazon.com';

let Google = require('google');
Google.resultsPerPage = 3;

let fs = require('fs');

function getResponse(msg, cb) {
  Google(msg + 'site:' + SITE, function (err, res) {
    if (err) {
      return cb(err, null);
    } else {
      let results = res.links[0] ? res.links[0].href : [];
      return cb(null, results);
    }
  })
}

fs.readFile('./data/remaining.tsv', 'utf8', function(err, data) {
  if (err) {
    console.error(err);
  } else {
    var lines = data.split('\r\n');
    var current = lines.shift().replace('\t', ' ');
    getResponse(current, function(err, link) {
      if (err) {
        return console.error(err);
      } else {
        fs.appendFileSync('./data/done.tsv', current + '\t' + link + '\n');
        fs.writeFileSync('./data/remaining.tsv', lines.join('\r\n'));
        console.log(current + '\t' + link);
      }
    })
  }
})

function fetch_stagger (list) {
  var copy = list.slice();
  
  function step () {
    var current = copy.shift();
    if (current) {
      (function (k) {
        setTimeout(function() {
          var msg = k.replace('\t', ' ');
          getResponse(msg, function(e,l) {
            if (e) {
              console.error(e);
            } else {
              console.log(msg + '\t' + l);
            }
            step();
          })
        }, 5000)
      })(current)
    }
  }
  
  step();
}