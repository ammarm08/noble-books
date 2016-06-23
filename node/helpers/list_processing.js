'use strict';
let fs = require('fs');
let BOOKS = require('../data/books.json');
let AUTHORS = require('../data/authors.json');
let RECS = require('../data/recommenders.json');
let GENRE_LOOKUP = {
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

function formatThumbLink (person) {
  return 'https://s3.amazonaws.com/bookswell-media/thinker-thumbnails/' + person + '.png';
}

function process_books () {
  let book_title_frequencies = Object.keys(BOOKS).reduce(function(frequencies, book) {
    let title = BOOKS[book].title;
    let author = BOOKS[book].author;
    let summary = BOOKS[book].summary;
    let on_list = AUTHORS[author].on_list === 'TRUE' ? 1 : 0;
    let recommenders = BOOKS[book].recommenders;
    let reviews = BOOKS[book].reviews;
    let length = BOOKS[book].length > 0 ? BOOKS[book].length : 150;
    let year = BOOKS[book].year;
    let genre = GENRE_LOOKUP[BOOKS[book].genre] ? GENRE_LOOKUP[BOOKS[book].genre] : BOOKS[book].genre || 'Misc';
    let link = BOOKS[book].amazon_link;
    let thumbnails = recommenders.map(function(person) { return formatThumbLink(person); });

    // calculate score
    let score = (recommenders.length * 5) + (AUTHORS[author].recommenders.length * 0.5) + (100/year) + (10/length);

    var book_obj = {
      title: title,
      author: author,
      link: link,
      on_list: on_list,
      recommenders: recommenders,
      author_recs: AUTHORS[author].recommenders,
      summary: summary,
      reviews: reviews,
      length: length,
      year: year,
      genre: genre,
      score: score,
      thumbnails: thumbnails
    };

    frequencies.push(book_obj);
    return frequencies;
  }, []);

  return book_title_frequencies;
}

exports.process_recommenders = function () {
  let recommenders_list = Object.keys(RECS).reduce(function(results, rec) {
    var rec_obj = {
      name: rec,
      bio: RECS[rec].bio,
      recommended_books: RECS[rec].recommended_books,
      thumbnail: formatThumbLink(rec)
    }
    results.push(rec_obj);
    return results;
  }, []);

  return recommenders_list.sort(function(a,b) {
    return a.recommended_books.length - b.recommended_books.length;
  });
}

function writeProcessedDataToFile () {
  let list = process_books();

  let sorted_by_title_freq = list.sort(function(a,b) {
    return b.recommenders.length - a.recommenders.length;
  })

  sorted_by_title_freq = sorted_by_title_freq.filter(function(item) {
    return item.genre !== 'Misc';
  });

  sorted_by_title_freq = JSON.stringify(sorted_by_title_freq);

  let sorted_by_author_freq = list.sort(function(a,b) {
    return b.author_recs.length - a.author_recs.length;
  })

  sorted_by_author_freq = sorted_by_author_freq.filter(function(item) {
    return item.genre !== 'Misc';
  });

  sorted_by_author_freq = JSON.stringify(sorted_by_author_freq);

  let sorted_by_title = list.sort(function(a,b) {
    return a.title.toLowerCase().charCodeAt(0) - b.title.toLowerCase().charCodeAt(0);
  });

  sorted_by_title = sorted_by_title.filter(function(item) {
    return item.genre !== 'Misc';
  });

  sorted_by_title = JSON.stringify(sorted_by_title);

  let sorted_by_author = list.sort(function(a,b) {
    return a.author.toLowerCase().charCodeAt(0) - b.author.toLowerCase().charCodeAt(0);
  });

  sorted_by_author = sorted_by_author.filter(function(item) {
    return item.genre !== 'Misc';
  });

  sorted_by_author = JSON.stringify(sorted_by_author);

  fs.writeFile('./data/frequencies_title.json', sorted_by_title_freq, 'utf8', function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('Title freq: ', sorted_by_title_freq[0].title);
    }
  });

  fs.writeFile('./data/frequencies_author.json', sorted_by_author_freq, 'utf8', function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('Author freq: ', sorted_by_author_freq[0].author);
    }
  });

  fs.writeFile('./data/alphabetized_title.json', sorted_by_title, 'utf8', function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('Alpha title: ', sorted_by_title[0].title);
    }
  });

  fs.writeFile('./data/alphabetized_author.json', sorted_by_author, 'utf8', function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('Alpha author: ', sorted_by_author[0].author);
    }
  });
}

// writeProcessedDataToFile();