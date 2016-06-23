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

function process_recommenders () {
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

function sortBookList (list, sort_type) {
  if (sort_type === 'freq-title') {
    return list.sort(function(a,b) {
      return b.recommenders.length - a.recommenders.length;
    })
  } else if (sort_type === 'freq-author') {
    return list.sort(function(a,b) {
      return b.author_recs.length - a.author_recs.length;
    })
  } else if (sort_type === 'alpha-title') {
    return list.sort(function(a,b) {
      return a.title.toLowerCase().charCodeAt(0) - b.title.toLowerCase().charCodeAt(0);
    })
  } else {
    return list.sort(function(a,b) {
      return a.author.toLowerCase().charCodeAt(0) - b.author.toLowerCase().charCodeAt(0);
    });
  }
}

function filterIncompleteBooks (list) {
  return list.filter(function(item) {
    return item.genre !== 'Misc';
  });
}

function sortAndFilterList (list, sort_type) {
  return filterIncompleteBooks(sortBookList(list, sort_type));
}

function writeBookListToFile (list, sort_type) {
  var list = sortAndFilterList(list, sort_type);
  var stringifiedJSON = JSON.stringify(list); 
  var dest;

  if (sort_type === 'freq-title') {
    dest = './data/frequencies_title.json';
  } else if (sort_type === 'freq-author') {
    dest = './data/frequencies_author.json';
  } else if (sort_type === 'alpha-title') {
    dest = './data/alphabetized_title.json';
  } else {
    dest = './data/alphabetized_author.json';
  }

  fs.writeFile(dest, stringifiedJSON, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('DONE', sort_type);
    }
  })
}

function writeAllBooksToFiles () {
  writeBookListToFile(process_books(), 'freq-title');
  writeBookListToFile(process_books(), 'freq-author');
  writeBookListToFile(process_books(), 'alpha-title');
  writeBookListToFile(process_books(), 'alpha-author');
}

function writeRecommendersListToFile () {
  var list = process_recommenders();
  list = JSON.stringify(list);

  fs.writeFile('./data/recommenders_list.json', list, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('DONE', 'recommenders-list');
    }
  })
}

writeAllBooksToFiles();
writeRecommendersListToFile();