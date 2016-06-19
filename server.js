'use strict';

let express = require('express');
let app = express();
const PORT = 8080;

let process_books = require('./helpers/list_processing.js').process_books;
let process_recommenders = require('./helpers/list_processing.js').process_recommenders;
let process_authors = require('./helpers/list_processing.js').process_authors;

let favicon = require('serve-favicon');

app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.get('/', function (req, res) {
  res.render('index');
})

app.get('/books', function (req, res) {
  res.render('index');
})

app.get('/collections', function (req, res) {
  res.render('collections');
})

app.get('/api/books', function (req, res) {
  res.json(process_books());
})

app.get('/api/recommenders', function (req, res) {
  res.json(process_recommenders());
})

app.get('/*', function (req, res) {
  res.redirect('/');
})

app.listen(PORT, function () {
  console.log('Listening on port', PORT)
})