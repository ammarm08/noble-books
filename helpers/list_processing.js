'use strict';

let BOOKS = require('../data/books.json');
let AUTHORS = require('../data/authors.json');
let RECS = require('../data/recommenders.json');
let GENRE_LOOKUP = {
  'Evolutionary Biology': 'Math + Sci',
  'Physics': 'Math + Sci',
  'Anthropology': 'Math + Sci',
  'Mathematics': 'Math + Sci',
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

exports.process_books = function () {
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

    var book_obj = {
      title: title,
      author: author,
      link: link,
      on_list: on_list,
      recommenders: recommenders,
      reviews: reviews,
      length: length,
      year: year,
      genre: genre,
      frequency: frequency,
      score: score
    };

    frequencies.push(book_obj);
    return frequencies;
  }, []);

  return book_title_frequencies.sort(function (a,b) {
    return b.score - a.score;
  });
}

exports.process_recommenders = function () {
  let recommenders_list = Object.keys(RECS).reduce(function(results, rec) {
    var rec_obj = {
      name: rec,
      recommended_books: RECS[rec].recommended_books
    }
    results.push(rec_obj);
    return results;
  }, []);

  return recommenders_list.sort(function(a,b) {
    return b.recommended_books.length - a.recommended_books.length;
  });
}

exports.process_authors = function () {
  let authors_list = Object.keys(AUTHORS).reduce(function(results, a) {
    var a_obj = {
      name: a,
      books: AUTHORS[a].titles
    }
    results.push(a_obj);
    return results;
  }, []);

  return authors_list.sort(function(a,b) {
    return b.books.length - a.books.length;
  })
}
