'use strict'

const SITE = 'amazon.com'
const fs = require('fs')

let Google = require('google')
Google.resultsPerPage = 3

// search for a book on google and limit results to those from amazon.
// callback returns the first link found, else an empty array.
const getBookLink = (book, cb) => {
  const query = book + 'site:' + SITE

  Google(query, (err, res) => {
    if (err) {
      return cb(err, null)
    }

    const result = res.links[0] ? res.links[0].href : []
    return cb(null, result)
  })
}

// Remaining: list of books left to scrape.
// Done: list of books already scraped.
// When a book is successfully scraped, it is removed from remaining and added to done.
fs.readFile('./data/remaining.tsv', 'utf8', (err, data) => {
  if (err) {
    return console.error(err)
  }

  const books = data.split('\r\n')
  const book = books[0].replace('\t', ' ') // book to scrape.
  const remaining = books.slice(1)

  getBookLink(book, (err, link) => {
    if (err) {
      return console.error(err)
    }

    fs.appendFileSync('./data/done.tsv', book + '\t' + link + '\n')
    fs.writeFileSync('./data/remaining.tsv', remaining.join('\r\n'))
    console.log(book + '\t' + link)
  })
})

/* TODO: async calls for batch scraping */
// const fetch_stagger = (list) => {
//   var copy = list.slice();

//   function step () {
//     var current = copy.shift();
//     if (current) {
//       (function (k) {
//         setTimeout(function() {
//           var msg = k.replace('\t', ' ');
//           getResponse(msg, function(e,l) {
//             if (e) {
//               console.error(e);
//             } else {
//               console.log(msg + '\t' + l);
//             }
//             step();
//           })
//         }, 5000)
//       })(current)
//     }
//   }
//   step();
// }
