'use strict'

let express = require('express')
let app = express()

/* JSON files */
let db = {
  alphabetized_author: require('./data/alphabetized_author.json'),
  alphabetized_title: require('./data/alphabetized_title.json'),
  frequencies_author: require('./data/frequencies_author.json'),
  frequencies_title: require('./data/frequencies_title.json'),
  recommenders_list: require('./data/recommenders_list.json'),
  techies: require('./data/filter-by-tech.json'),
  writers: require('./data/filter-by-lit.json'),
  entrepreneurs: require('./data/filter-by-biz.json'),
  history_buffs: require('./data/filter-by-history.json'),
  econ_nerds: require('./data/filter-by-econ.json'),
  scientists: require('./data/filter-by-sci.json'),
  philosophers: require('./data/filter-by-phil.json')
}

/* CONFIGURATION */
app.set('views', __dirname + '/../public/views')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/../public'))

/* ROUTES */
app.get('/', (req, res) => {
  res.render('index', {page_name: 'books', data: db.frequencies_title.slice(0, 10)})
})

app.get('/books', (req, res) => {
  res.render('index', {page_name: 'books', data: db.frequencies_title.slice(0, 10)})
})

app.get('/thinkers', (req, res) => {
  res.render('thinkers', {page_name: 'thinkers', data: db.recommenders_list })
})

app.get('/api/books', (req, res) => {
  const query = req.query.sort

  if (db[query]) {
    res.json(db[query])
  } else {
    res.json(db['frequencies_title'])
  }
})

app.get('/api/recommenders', (req, res) => {
  res.json(db.recommenders_list)
})

app.get('/*', (req, res) => {
  res.redirect('/')
})

module.exports = app
