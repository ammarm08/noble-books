'use strict';

let BOOKS = require('../data/books.json');
let AUTHORS = require('../data/authors.json');
let RECS = require('../data/recommenders.json');

function sort_by_title_freq () {
  let book_title_frequencies = Object.keys(BOOKS).reduce(function(frequencies, book) {
    let title = BOOKS[book].title;
    let author = BOOKS[book].author;
    let recommenders = AUTHORS[author].recommenders;
    let frequency = recommenders.length;

    frequencies.push([title, author, recommenders, frequency]);
    return frequencies;
  }, []);

  return book_title_frequencies.sort(function (a,b) {
    return b[3] - a[3];
  });
}

module.exports = sort_by_title_freq;