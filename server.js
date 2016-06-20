'use strict';

let express = require('express');
let app = express();
const PORT = 8080;

let utils = require('./helpers/list_processing.js');
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
  res.json(utils.process_books());
})

app.get('/api/recommenders', function (req, res) {
  res.json(utils.process_recommenders());
})

app.get('/*', function (req, res) {
  res.redirect('/');
})

app.listen(PORT, function () {
  console.log('Listening on port', PORT)
})