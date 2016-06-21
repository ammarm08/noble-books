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

let THUMBNAILS = {
  'Steven Pinker': 'https://qph.is.quoracdn.net/main-thumb-148986927-50-fbohjmmcrizbhsijbkiuuxdekhbtppdf.jpeg',
  'Daniel Dennett': 'http://img2-ak.lst.fm/i/u/64s/25bcf1206e94470aa8525d44f82f635d.png',
  'Nassim Taleb': 'https://pbs.twimg.com/profile_images/429346159870488576/N18OCeAD_normal.jpeg',
  'Paul Coelho': 'https://pbs.twimg.com/profile_images/378800000632812409/8df49dbba51e94557c46fe7fd26137ce.jpeg',
  'Pope Francis': 'https://pbs.twimg.com/profile_images/646734494100164608/f_q8fX35.jpg',
  'Richard Dawkins': 'https://pbs.twimg.com/profile_images/659105461841457152/kIhybzJ8.jpg',
  'Noam Chomsky': 'https://i.guim.co.uk/img/static/sys-images/Guardian/Pix/pictures/2003/01/27/chomsky.jpg?w=620&q=55&auto=format&usm=12&fit=max&s=8398cfe3da5b90d86320ddf033408005',
  'Peter Singer': 'https://i.guim.co.uk/img/static/sys-images/Books/Pix/authors/2004/04/14/petersinger1.jpg?w=620&q=55&auto=format&usm=12&fit=max&s=113e6355cf9d846fc439baa63ed97b28',
  'Malala Yousafzai': 'https://pbs.twimg.com/profile_images/719420323565858817/uDbNnmIs.jpg',
  'Haruki Murakami': 'https://i.guim.co.uk/img/static/sys-images/Books/Pix/authors/2003/05/16/murakami128.jpg?w=620&q=55&auto=format&usm=12&fit=max&s=bfeaca482b4dd45f924a2790ce8b72fe',
  'Amartya Sen': 'https://pbs.twimg.com/profile_images/653624414278258688/HTpM-LqE.jpg',
  'Jane Goodall': 'http://media.todaybirthdays.com/thumb_x256x256/upload/1934/04/03/jane-goodall.jpg',
  'Paul Krugman': 'http://media.todaybirthdays.com/thumb_x256x256/upload/1953/02/28/paul-krugman.jpg',
  'Salman Rushdie': 'http://images2.villagevoice.com/imager/u/original/6704703/salmanrushdie091411_4beowulfs_2_reasonably_small.jpg',
  'Elon Musk': 'https://pbs.twimg.com/profile_images/378800000305778238/852d2f76797dbe1da82095f988d38fbe.png',
  'Jared Diamond': 'https://cdn1.hbs.to/b/photo/96/jzn/vnq/dqs/jared-diamond.jpg',
  'Lawrence Lessig': 'http://cdn.thedailybeast.com/etc/authors/l/lawrence-lessig/image.crop.96.96.jpg/46091637.cached.jpg',
  'Shashi Tharoor': 'http://static.dnaindia.com/sites/default/files/2015/08/31/371135-shashi-tharoor-twitter.jpeg',
  'Steven Weinberg': 'https://pbs.twimg.com/profile_images/3108931126/51c89880964bca0ca8b3cc083d3e1c96.jpeg',
  'Matt Ridley': 'http://1.bp.blogspot.com/-MEY2S8CL07w/VV8Ohs9DvmI/AAAAAAAADE0/03Vr04q77eo/s1600/Matt.Ridley_avatar.jpg',
  'Ayaan Hirsi Ali': 'http://cdn.thedailybeast.com/etc/authors/a/ayaan-hirsi-ali/image.crop.96.96.jpg/47358194.cached.jpg',
  'Abdullah Gul': 'https://pbs.twimg.com/profile_images/643431387723247616/2Y8Ka1B8.jpg',
  'Bono': 'http://media.todaybirthdays.com/thumb_x256x256/upload/1960/05/10/bono.jpg',
  'Eric Schmidt': 'http://farm4.staticflickr.com/3823/11093285846_a7458ae9f2_o.jpg',
  'Richard Posner': 'http://media2.fdncms.com/chicago/imager/posner/u/square/7371985/1346879870-posner.jpg',
  'Joichi Ito': 'https://events.ccc.de/congress/2006/Fahrplan/images/speaker-187-128x128.jpg',
  'Sam Harris': 'https://lh3.googleusercontent.com/-wPanaRpgQ7M/AAAAAAAAAAI/AAAAAAAAAEg/6qSNVhmm5uU/s46-c-k-no/photo.jpg',
  'Cornel West': 'http://www.huffingtonpost.com/contributors/cornel-west/headshot.jpg',
  'Alain de Botton': 'https://pbs.twimg.com/profile_images/644583190435352576/3pRBrBdu_normal.jpg',
  'Douglas Rushkoff': 'http://www.digital.nyc/sites/default/files/styles/micro/public/author/douglas_rushkoff.jpg?itok=MnyTHJyq',
  'Eckhart Tolle': 'http://65.media.tumblr.com/avatar_e63c6e7d8448_128.png',
  "Tim O'Reilly": 'http://cdn.slidesharecdn.com/profile-photo-timoreilly-96x96.jpg?cb=1425558109',
  'Seth Godin': 'http://readtoleadpodcast.com/wp-content/uploads/2015/01/Seth-Godin-35x35.png',
  'Niall Ferguson': 'https://www.thechicagocouncil.org/sites/default/files/styles/96x96/public/fergusonsquare.png?itok=T2mFo18X',
  'Guy Kawasaki': 'https://pbs.twimg.com/profile_images/375889332/guy2.0_normal.jpg',
  'Reza Aslan': 'http://www.huffingtonpost.com/contributors/reza-aslan/headshot.jpg',
  'Elif Shafak': 'http://static.quoteswave.com/wp-content/uploads/2013/06/Elif-Shafak-50x50.jpg?31a535',
  'Fareed Zakaria': 'https://lh3.googleusercontent.com/-9Jgzy-NTAys/AAAAAAAAAAI/AAAAAAAAAA8/-05N93GIq6k/s46-c-k-no/photo.jpg',
  'Jack Ma': 'https://lh3.googleusercontent.com/-r9gwgzqhIL4/AAAAAAAAAAI/AAAAAAAAAA8/dBbsLeh_bng/s46-c-k-no/photo.jpg',
  'Azar Nfisi': 'http://www.thedailybeast.com/etc/authors/a/azar-nafisi/image.full.96.96.jpg/43499191.cached.jpg',
  'Evgeny Morozov': 'https://pbs.twimg.com/profile_images/640536915477794816/u9TxNsKI_normal.jpg',
  'Peter Diamandis': 'https://pbs.twimg.com/profile_images/3239999517/bc55855b075a7d816b882103f496893d_normal.jpeg',
  'Bill McKibben': 'http://s1.evcdn.com/images/block/I0-001/026/920/884-2.jpeg_/bill-mckibben-84.jpeg',
  'Wade Davis': 'https://pbs.twimg.com/profile_images/737663288968925189/VuRJz7Iq_normal.jpg',
  'Sean Carroll': 'http://i.embed.ly/1/display/resize?key=1e6a1a1efdb011df84894040444cdc60&url=http%3A%2F%2Fpbs.twimg.com%2Fprofile_images%2F554901773467406337%2FemLyWwmt_normal.jpeg',
  'Dambisa Moyo': 'http://cdn.thedailybeast.com/etc/authors/d/dambisa-moyo/image.crop.96.96.jpg/43499148.cached.jpg',
  'Dani Rodrik': 'https://pbs.twimg.com/profile_images/463546417999396864/XpJflXF5_normal.png',
  'John Gray': 'https://www.couplewise.com/assets/cw-advisors-john-bc84e12d0271065b1424189a33235d9906585b7b69d28090440dbd56039d2d47.jpg',
  'Tom Peters': 'http://static2.quoteswave.com/wp-content/uploads/2012/12/Tom-Peters1-50x50.jpg?31a535'
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
    let genre = GENRE_LOOKUP[BOOKS[book].genre] ? GENRE_LOOKUP[BOOKS[book].genre] : BOOKS[book].genre;
    let link = BOOKS[book].amazon_link;
    let thumbnails = recommenders.map(function(person) { return THUMBNAILS[person]; });

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
      thumbnail: THUMBNAILS[rec]
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
  });
  sorted_by_title_freq = JSON.stringify(sorted_by_title_freq);

  let sorted_by_author_freq = list.sort(function(a,b) {
    return b.author_recs.length - a.author_recs.length;
  });
  sorted_by_author_freq = JSON.stringify(sorted_by_author_freq);

  let sorted_by_title = list.sort(function(a,b) {
    return a.title.toLowerCase().charCodeAt(0) - b.title.toLowerCase().charCodeAt(0);
  });
  sorted_by_title = JSON.stringify(sorted_by_title);

  let sorted_by_author = list.sort(function(a,b) {
    return a.author.toLowerCase().charCodeAt(0) - b.author.toLowerCase().charCodeAt(0);
  })
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
