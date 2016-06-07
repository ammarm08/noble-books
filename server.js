'use strict'

let express = require('express');
let app = express();
const PORT = 8080;

let process_books = require('./helpers/list_processing.js');

app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index');
})

app.get('/api/books', function (req, res) {
  // query builder
  res.json(process_books());
})

app.get('/*', function (req, res) {
  res.redirect('/');
})

app.listen(PORT, function () {
  console.log('Listening on port', PORT)
})