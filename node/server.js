'use strict';

let express = require('express');
let app = express();
const PORT = 8080;

let alpha_author = require('./data/alphabetized_author.json');
let alpha_title = require('./data/alphabetized_title.json');
let freq_author = require('./data/frequencies_author.json');
let freq_title = require('./data/frequencies_title.json');
let recommenders_list = require('./data/recommenders_list.json');

app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index', {page_name: 'books'});
})

app.get('/books', function (req, res) {
  res.render('index', {page_name: 'books'});
})

app.get('/thinkers', function (req, res) {
  res.render('thinkers', {page_name: 'thinkers'});
})

app.get('/api/books', function (req, res) {
  var query = req.query.sort;

  if (query === 'frequencies_author') {
    res.json(freq_author);
  } else if (query === 'alphabetized_title') {
    res.json(alpha_title);
  } else if (query === 'alphabetized_author') {
    res.json(alpha_author);
  } else {
    res.json(freq_title);
  }
})

app.get('/api/recommenders', function (req, res) {
  res.json(recommenders_list);
})

app.get('/*', function (req, res) {
  res.redirect('/');
})

app.listen(PORT, function () {
  console.log('Listening on port', PORT);
})