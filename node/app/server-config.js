'use strict';

let express = require('express');
let app = express();

/* JSON files */
let db = {
  alphabetized_author : require('./data/alphabetized_author.json'),
  alphabetized_title : require('./data/alphabetized_title.json'),
  frequencies_author : require('./data/frequencies_author.json'),
  frequencies_title : require('./data/frequencies_title.json'),
  recommenders_list : require('./data/recommenders_list.json'),
  techies : require('./data/filter-by-tech.json'),
  writers: require('./data/filter-by-lit.json'),
  entrepreneurs: require('./data/filter-by-biz.json'),
  history_buffs: require('./data/filter-by-history.json'),
  econ_nerds: require('./data/filter-by-econ.json'),
  scientists: require('./data/filter-by-sci.json'),
  philosophers: require('./data/filter-by-phil.json')
}

/* CONFIGURATION */
app.set('views', __dirname + '/../public/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/../public'));

/* ROUTES */
app.get('/', function (req, res) {
  res.render('index', {page_name: 'books', data: db.frequencies_title.slice(0, 10)});
})

app.get('/books', function (req, res) {
  res.render('index', {page_name: 'books', data: db.frequencies_title.slice(0, 10)});
})

app.get('/thinkers', function (req, res) {
  res.render('thinkers', {page_name: 'thinkers', data: db.recommenders_list });
})

app.get('/recommendations-from-techies', function (req, res) {
  res.render('index', {page_name: 'books', data: db.techies.slice(0, 10) });
});

app.get('/recommendations-from-writers', function (req, res) {
  res.render('index', {page_name: 'books', data: db.writers.slice(0, 10) });
});

app.get('/recommendations-from-scientists', function (req, res) {
  res.render('index', {page_name: 'books', data: db.scientists.slice(0, 10) });
});

app.get('/recommendations-from-history-buffs', function (req, res) {
  res.render('index', {page_name: 'books', data: db.history_buffs.slice(0, 10) });
});

app.get('/recommendations-from-econ-nerds', function (req, res) {
  res.render('index', {page_name: 'books', data: db.econ_nerds.slice(0, 10) });
});

app.get('/recommendations-from-philosophers', function (req, res) {
  res.render('index', {page_name: 'books', data: db.philosophers.slice(0, 10) });
});

app.get('/recommendations-from-entrepreneurs', function (req, res) {
  res.render('index', {page_name: 'books', data: db.entrepreneurs.slice(0, 10) });
});

app.get('/api/books', function (req, res) {
  var query = req.query.sort;

  if (db[query]) {
    res.json(db[query]);
  } else {
    res.json(db['frequencies_title']);
  }

})

app.get('/api/recommenders', function (req, res) {
  res.json(db.recommenders_list);
})

app.get('/*', function (req, res) {
  res.redirect('/');
})

module.exports = app;
