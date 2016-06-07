'use strict';

let BOOKS = require('../data/books.json');
let AUTHORS = require('../data/authors.json');
let RECS = require('../data/recommenders.json');

let book_title_frequencies = []; // {title: freq}
let book_author_frequencies = []; // {title: freq}

Object.keys(AUTHORS).forEach(function(author) {
  let freq = [author, AUTHORS[author].recommenders.length, AUTHORS[author].recommenders, AUTHORS[author].titles];
  book_author_frequencies.push(freq)
})

let sorted = book_author_frequencies.sort(function (a, b) {
  return b[1] - a[1]; 
})

console.log(book_author_frequencies.slice(0,10));
console.log('SORTED:')
console.log(sorted.slice(0,30));