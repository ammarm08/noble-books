'use strict'

const fs = require('fs')

const writeTSVtoJSON = (path) => {
  const books = removeHeaders(tsvToArray(path))
  const collections = gatherAllBooksToJSON(books)

  fs.writeFile('./data/authors.json', JSON.stringify(collections.authors))
  fs.writeFile('./data/books.json', JSON.stringify(collections.books))
  fs.writeFile('./data/recommenders.json', JSON.stringify(collections.recommenders))
  console.log('DONE')
}

// Given a spreadsheet file, return an array of arrays
const tsvToArray = (path) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      return console.error(err)
    }

    const entries = data.split('\r\n').map(entry => entry.split('\t'))
    return entries
  })
}

const removeHeaders = (tsvArray) => {
  return tsvArray.slice(1)
}

const gatherAllBooksToJSON = (formattedTSV) => {
  let memo = { books: {}, authors: {}, recommenders: {} }
  return formattedTSV.reduce(gatherOneToJSON, memo)
}

const gatherOneToJSON = (acc, book) => {
  let meta = {
    title: book[0],
    author: book[1],
    recommender: book[2],
    source: book[3],
    amazon_link: book[4],
    summary: book[5],
    book_genre: book[6],
    length: book[7],
    publish_year: book[8],
    on_list: book[9],
    review_excerpt: book[10],
    rec_genre: book[11],
    rec_bio: book[12]
  }

  meta.slug = meta.title + '\t' + meta.author

  acc.books[meta.slug] = formatBookCollection(acc, meta)
  acc.authors[meta.author] = formatAuthorCollection(acc, meta)
  acc.recommenders[meta.recommender] = formatRecommenderCollection(acc, meta)

  return acc
}

const formatRecommenderCollection = (collections, metadata) => {
  const recommender = metadata.recommender
  const recommenderEntry = collections.recommenders[recommender]

  if (recommenderEntry) {
    // if author isn't yet in recommender's list of recommender authors, add her
    if (recommenderEntry.recommended_authors.indexOf(metadata.author) === -1) {
      recommenderEntry.recommended_authors.push(metadata.author)
      recommenderEntry.reviews.push(metadata.review_excerpt)
    }

    recommenderEntry.recommended_books.push([metadata.title, metadata.amazon_link, metadata.source])
    return recommenderEntry
  }

  // otherwise, build out entry
  const entry = {
    recommended_books: [[metadata.title, metadata.amazon_link, metadata.source]],
    recommended_authors: [metadata.author],
    reviews: [metadata.review_excerpt],
    field: metadata.rec_genre,
    bio: metadata.rec_bio
  }

  return entry
}

const formatAuthorCollection = (collections, metadata) => {
  const author = metadata.author
  let authorEntry = collections.authors[author]

  if (authorEntry) {
    // if recommender isn't already in list, add him
    if (authorEntry.recommenders.indexOf(metadata.recommender) === -1) {
      authorEntry.recommenders.push(metadata.recommender)
    }

    // if book isn't already in list, add it
    if (authorEntry.titles.indexOf(metadata.title) === -1) {
      authorEntry.titles.push(metadata.title)
    }

    return authorEntry
  }

  // otherwise, build entry
  const entry = {
    titles: [metadata.title],
    recommenders: [metadata.recommender],
    on_list: metadata.on_list
  }

  return entry
}

const formatBookCollection = (collections, metadata) => {
  const bookEntry = collections.books[metadata.slug]

  // if book already exists, then add recommender and her review to that book's entry
  if (bookEntry) {
    bookEntry.recommenders.push(metadata.recommender)
    bookEntry.reviews.push(metadata.review_excerpt)
    return bookEntry
  }

  // otherwise, build the book in the collection
  const entry = {
    title: metadata.title,
    author: metadata.author,
    recommenders: [metadata.recommender],
    amazon_link: metadata.amazon_link,
    genre: metadata.book_genre,
    length: metadata.length,
    year: metadata.publish_year,
    summary: metadata.summary,
    reviews: [metadata.review_excerpt]
  }

  return entry
}

writeTSVtoJSON()
