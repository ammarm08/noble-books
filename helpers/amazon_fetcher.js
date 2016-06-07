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
