'use strict';

let BOOKS = require('../data/books.json');
let AUTHORS = require('../data/authors.json');
let RECS = require('../data/recommenders.json');
let GENRE_LOOKUP = {
  'Evolutionary Biology': 'Math & Sci',
  'Physics': 'Math & Sci',
  'Anthropology': 'Math & Sci',
  'Mathematics': 'Math & Sci',
  'Neuroscience': 'The Mind',
  'Psychology': 'The Mind',
  'Philosophy': 'The Mind',
  'Finance & Economics': 'Econ & Gov',
  'Politics': 'Econ & Gov',
  'Law': 'Econ & Gov',
  'Literature': 'Fiction',
  'Technology': 'Culture',
  'Culture & Society': 'Culture',
  'Biography': 'Culture',
  'Performing Arts': 'Culture',
  'Religion & Spirituality': 'Faith'
}

function sort_by_title_freq () {
  let book_title_frequencies = Object.keys(BOOKS).reduce(function(frequencies, book) {
    let title = BOOKS[book].title;
    let author = BOOKS[book].author;
    let on_list = AUTHORS[author].on_list === 'TRUE' ? 1 : 0;
    let recommenders = BOOKS[book].recommenders;
    let reviews = BOOKS[book].reviews;
    let length = BOOKS[book].length > 0 ? BOOKS[book].length : 150;
    let year = BOOKS[book].year;
    let genre = GENRE_LOOKUP[BOOKS[book].genre] ? GENRE_LOOKUP[BOOKS[book].genre] : BOOKS[book].genre;
    let frequency = recommenders.length;
    let link = BOOKS[book].amazon_link;

    // calculate score
    let score = (frequency * 5) + (AUTHORS[author].recommenders.length * 2) + (1000/year) + (100/length) + (on_list * 2);

    frequencies.push([title, [author, on_list], recommenders, reviews, length, year, genre, frequency, score, link]);
    return frequencies;
  }, []);

  return book_title_frequencies.sort(function (a,b) {
    return b[8] - a[8];
  });
}

module.exports = sort_by_title_freq;