'use strict';

let BOOKS = require('../data/books.json');
let AUTHORS = require('../data/authors.json');
let RECS = require('../data/recommenders.json');

function sort_by_title_freq () {
  let book_title_frequencies = Object.keys(BOOKS).reduce(function(frequencies, book) {
    let title = BOOKS[book].title;
    let author = BOOKS[book].author;
    let on_list = AUTHORS[BOOKS[book].author].on_list;
    let recommenders = BOOKS[book].recommenders;
    let reviews = BOOKS[book].reviews;
    let length = BOOKS[book].length;
    let year = BOOKS[book].year;
    let genre = BOOKS[book].genre;
    let frequency = recommenders.length;

    frequencies.push([title, [author, on_list], recommenders, reviews, length, year, genre, frequency]);
    return frequencies;
  }, []);

  return book_title_frequencies.sort(function (a,b) {
    return b[7] - a[7];
  });
}

module.exports = sort_by_title_freq;