'use strict'

const fs = require('fs')
const BOOKS = require('../data/books.json')
const AUTHORS = require('../data/authors.json')
const RECS = require('../data/recommenders.json')

const GENRE_LOOKUP = {
  'Evolutionary Biology': 'Math / Science',
  'Physics': 'Math / Science',
  'Anthropology': 'Math / Science',
  'Mathematics': 'Math / Science',
  'Neuroscience': 'The Mind',
  'Psychology': 'The Mind',
  'Philosophy': 'The Mind',
  'Finance & Economics': 'Econ + Gov',
  'Politics': 'Econ + Gov',
  'Law': 'Econ + Gov',
  'Literature': 'Fiction',
  'Technology': 'Culture',
  'Culture & Society': 'Culture',
  'Biography': 'Culture',
  'Performing Arts': 'Culture',
  'Religion & Spirituality': 'Faith'
}

const process_books = () => {
  return Object.keys(BOOKS).reduce(calculateFrequencies, [])
}

const calculateFrequencies = (acc, book) => {
  // build all metadata for book
  let book_obj = {
    title: BOOKS[book].title,
    author: BOOKS[book].author,
    summary: BOOKS[book].summary,
    recommenders: BOOKS[book].recommenders,
    reviews: BOOKS[book].reviews,
    length: BOOKS[book].length > 0 ? BOOKS[book].length : 150,
    year: BOOKS[book].year,
    genre: GENRE_LOOKUP[BOOKS[book].genre] || BOOKS[book].genre || 'Misc',
    link: BOOKS[book].amazon_link
  }

  book_obj.on_list = AUTHORS[book_obj.author].on_list === 'TRUE' ? 1 : 0
  book_obj.thumbnails = book_obj.recommenders.map(person => formatThumbLink(person))

  // calculate book "score"
  const bookRecs = book_obj.recommenders.length
  const authorRecs = AUTHORS[book_obj.author].recommenders.length
  book_obj.score = calculateScore(bookRecs, authorRecs, book_obj.year, book_obj.length)

  acc.push(book_obj)
  return acc
}

// Score is the weighted sum of book rec freq, author rec freq, age of book, and length of book
const calculateScore = (bookRecs, authorRecs, bookYear, bookLength) => {
  return (bookRecs * 5) + (authorRecs * 0.5) + (bookLength * 0.1) + (bookYear * 0.01)
}

const formatThumbLink = (person) => {
  return 'https://s3.amazonaws.com/bookswell-media/thinker-thumbnails/' + person + '.png'
}

// given a list of books, filter out those which do not belong to target fields list
const filter_list_by_field = (list, target_fields) => {
  return list.filter(book => {
    // if a book recommender is not in the field of study that we're looking for, filter him out
    const remainingRecommenders = book.recommenders.filter(rec => target_fields.indexOf(RECS[rec].field) > -1)

    // if there are NONE remaining, that means this book should be filtered out
    return !!remainingRecommenders.length
  })
}

const process_recommenders = () => {
  return Object.keys(RECS).reduce((results, rec) => {
    const rec_obj = {
      name: rec,
      bio: RECS[rec].bio,
      recommended_books: RECS[rec].recommended_books,
      thumbnail: formatThumbLink(rec)
    }
    results.push(rec_obj)
    return results
  }, [])
}

const sortRecommendersByFrequency = (recommendersList) => {
  return recommendersList.sort((a, b) => a.recommended_books.length - b.recommended_books.length)
}

// sort list as indicated, then filter out books with Misc genre
const sortAndFilterList = (list, sort_type) => {
  return filterIncompleteBooks(sortBookList(list, sort_type))
}

const sortBookList = (list, sort_type) => {
  let sortPredicate

  switch (sort_type) {
    case 'freq-title':
      sortPredicate = (a, b) => b.recommenders.length - a.recommenders.length
      break
    case 'freq-author':
      sortPredicate = (a, b) => b.author_recs.length - a.author_recs.length
      break
    case 'alpha-title':
      sortPredicate = (a, b) => a.title.toLowerCase().charCodeAt(0) - b.title.toLowerCase().charCodeAt(0)
      break
    default:
      sortPredicate = (a, b) => a.author.toLowerCase().charCodeAt(0) - b.author.toLowerCase().charCodeAt(0)
  }

  return list.sort(sortPredicate)
}

// Only keep books that have valid genres
const filterIncompleteBooks = (list) => {
  return list.filter(book => book.genre !== 'Misc')
}

const writeBookListToFile = (list, sort_type, dest) => {
  const sorted = sortAndFilterList(list, sort_type)
  const stringifiedJSON = JSON.stringify(sorted)

  fs.writeFile(dest, stringifiedJSON, (err, data) => {
    if (err) {
      return console.log(err)
    }

    console.log('DONE', dest)
  })
}

const writeAllBooksToFiles = () => {
  const booksSortedByFrequency = process_books()

  // SORTED BOOK LISTS
  writeBookListToFile(booksSortedByFrequency, 'freq-title', './data/frequencies_title.json')
  writeBookListToFile(booksSortedByFrequency, 'freq-author', './data/frequencies_author.json')
  writeBookListToFile(booksSortedByFrequency, 'alpha-title', './data/alphabetized_title.json')
  writeBookListToFile(booksSortedByFrequency, 'alpha-author', './data/alphabetized_author.json')

  // FIELD-SPECIFIC
  const technologyBooks = filter_list_by_field(booksSortedByFrequency, ['Technology'])
  const bizBooks = filter_list_by_field(booksSortedByFrequency, ['Business'])
  const litBooks = filter_list_by_field(booksSortedByFrequency, ['Literature'])
  const historyBooks = filter_list_by_field(booksSortedByFrequency, ['Politics', 'Culture & Society', 'Journalism'])
  const econBooks = filter_list_by_field(booksSortedByFrequency, ['Finance & Economics', 'Law'])
  const sciBooks = filter_list_by_field(booksSortedByFrequency, ['Physics', 'Evolutionary Biology', 'Anthropology', 'Environmental Science'])
  const philBooks = filter_list_by_field(booksSortedByFrequency, ['Philosophy', 'Religion & Spirituality', 'Linguistics', 'Cognitive Science'])

  writeBookListToFile(technologyBooks, 'freq-title', './data/filter-by-tech.json')
  writeBookListToFile(bizBooks, 'freq-title', './data/filter-by-biz.json')
  writeBookListToFile(litBooks, 'freq-title', './data/filter-by-lit.json')
  writeBookListToFile(historyBooks, 'freq-title', './data/filter-by-history.json')
  writeBookListToFile(econBooks, 'freq-title', './data/filter-by-econ.json')
  writeBookListToFile(sciBooks, 'freq-title', './data/filter-by-sci.json')
  writeBookListToFile(philBooks, 'freq-title', './data/filter-by-phil.json')
}

const writeRecommendersListToFile = () => {
  const recommendersList = sortRecommendersByFrequency(process_recommenders())
  const stringifiedJSON = JSON.stringify(recommendersList)

  fs.writeFile('./data/recommenders_list.json', stringifiedJSON, (err, data) => {
    if (err) {
      return console.log(err)
    }

    console.log('DONE', 'recommenders-list')
  })
}

writeAllBooksToFiles()
writeRecommendersListToFile()
