
function writeTSVtoJSON () {
  fs.readFile('master_list.tsv', 'utf8', function(err, data) {
    if (err) {
      console.error(err);
    } else {
      var entries = data.split('\r\n').map(function(entry) {
        return entry.split('\t').slice(0,3);
      })
      entries.shift();
      
      var books = {};
      var authors = {};
      var recommenders = {};

      entries.forEach(function(entry) {
        var title = entry[0];
        var author = entry[1];
        var recommender = entry[2];
        var slug = title + '\t' + author;

        // BOOK
        if (books[slug]) {
          books[slug].recommenders.push(recommender);
        } else {
          books[slug] = { title: title, author: author, recommenders: [recommender] };
        }

        // AUTHOR
        if (authors[author]) {
          if (authors[author].recommenders.indexOf(recommender) === -1) {
            authors[author].recommenders.push(recommender);
          }

          if (authors[author].titles.indexOf(title) === -1) {
            authors[author].titles.push(title);
          }

        } else {
          authors[author] = { titles: [title], recommenders: [recommender] };
        }

        // RECOMMENDER
        if (recommenders[recommender]) {
          recommenders[recommender].recommended_books.push(title);
          if (recommenders[recommender].recommended_authors.indexOf(author) === -1) {
            recommenders[recommender].recommended_authors.push(author);
          }
        } else {
          recommenders[recommender] = { recommended_books: [title], recommended_authors: [author] };
        }

      })

      fs.writeFile('authors.json', JSON.stringify(authors));
      fs.writeFile('books.json', JSON.stringify(books));
      fs.writeFile('recommenders.json', JSON.stringify(recommenders));
      console.log('DONE');
    }
  })
}