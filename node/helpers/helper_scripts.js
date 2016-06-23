var fs = require('fs');

function writeTSVtoJSON () {
  fs.readFile('./data/test_data.tsv', 'utf8', function(err, data) {
    if (err) {
      console.error(err);
    } else {
      var entries = data.split('\r\n').map(function(entry) {
        return entry.split('\t');
      })
      entries.shift();

      //0- Title
      //1- Author
      //2- Recommender
      //3- Rec_Source
      //4- Amazon_Link
      //5- Book_Genre
      //6- Length
      //7- Publish_Date
      //8- On_List?
      //9- Rec_Review
      //10- Recommender_Genre
      
      var books = {};
      var authors = {};
      var recommenders = {};

      entries.forEach(function(entry) {
        var title = entry[0];
        var author = entry[1];
        var recommender = entry[2];
        var slug = title + '\t' + author;
        var source = entry[3];
        var amazon_link = entry[4];
        var summary = entry[5];
        var book_genre = entry[6];
        var length = entry[7]
        var publish_year = entry[8];
        var on_list = entry[9];
        var review_excerpt = entry[10];
        var rec_genre = entry[11];
        var rec_bio = entry[12];

        // BOOK
        if (books[slug]) {
          books[slug].recommenders.push(recommender);
          books[slug].reviews.push(review_excerpt);
        } else {
          books[slug] = { 
            title: title, 
            author: author, 
            recommenders: [recommender],
            amazon_link: amazon_link,
            genre: book_genre,
            length: length,
            year: publish_year,
            summary: summary,
            reviews: [review_excerpt] 
          };
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
          authors[author] = { 
            titles: [title], 
            recommenders: [recommender],
            on_list: on_list
          };
        }

        // RECOMMENDER
        if (recommenders[recommender]) {
          recommenders[recommender].recommended_books.push([title, amazon_link, source]);
          if (recommenders[recommender].recommended_authors.indexOf(author) === -1) {
            recommenders[recommender].recommended_authors.push(author);
            recommenders[recommender].reviews.push(review_excerpt);
          }
        } else {
          recommenders[recommender] = { 
            recommended_books: [[title, amazon_link, source]], 
            recommended_authors: [author],
            reviews: [review_excerpt],
            field: rec_genre,
            bio: rec_bio
          };
        }

      })

      fs.writeFile('./data/authors.json', JSON.stringify(authors));
      fs.writeFile('./data/books.json', JSON.stringify(books));
      fs.writeFile('./data/recommenders.json', JSON.stringify(recommenders));
      console.log('DONE');
    }
  })
}

writeTSVtoJSON();