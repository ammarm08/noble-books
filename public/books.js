(function() {
  $(document).ready(function() {
    // GLOBALS
    var PAGE = 0;
    var genre_list = $('.genre_filter').map(function() { return $(this).text().trim(); }).toArray();
    var length_list = $('.filter-by-length button').map(function() { return $(this).data('length'); }).toArray();
    var age_list = $('.filter-by-age button').map(function() { return $(this).data('age'); }).toArray();
    var all_data = [];
    var selected_data = [];
    var selected_lengths = length_list;
    var selected_genres = genre_list;
    var selected_ages = age_list;
    var $list = $('.books-list');

    // SHOW/HIDE ADVANCED LISTENER
    $('.show-advanced').on('click', function(e) {
      e.preventDefault();
      if ($('.advanced-filter:visible').length) {
        $('.advanced-filter').hide();
        $('.show-advanced').text('Advanced Filters');
      } else {
        $('.advanced-filter').show();
        $('.show-advanced').text('Show Less Filters')
      }
    })

    // SHOW RESULTS
    $('.show-results').on('click', function(e) {
      $list.empty();
      PAGE = 0;

      // set data to all books within selected list of genres
      selected_data = all_data.filter(function(book) {
        return selected_genres.indexOf(book.genre) !== -1;
      })

      selected_data = selected_data.filter(function(book) {
        if (selected_lengths.indexOf('short') !== -1 && book.length < 150) {
          return true;
        } else if (selected_lengths.indexOf('medium') !== -1 && book.length > 150 && book.length < 400) {
          return true;
        } else if (selected_lengths.indexOf('long') !== -1 && book.length > 400) {
          return true;
        } else {
          return false;
        }
      })

      selected_data = selected_data.filter(function(book) {
        if (selected_ages.indexOf(1900) !== -1 && book.year < 1900) {
          return true;
        } else if (selected_ages.indexOf(1901) !== -1 && book.year >= 1900 && book.year < 2000) {
          return true;
        } else if (selected_ages.indexOf(2000) !== -1 && book.year >= 2000) {
          return true;
        } else {
          return false;
        }
      })

      loadNextBooksGroup(PAGE, selected_data);
      PAGE++;
    })  

    // LENGTH FILTER LISTENER
    $('.filter-by-length button').on('click', function(e) {
      e.preventDefault();

      if ($(this).data('length') === 'all') {
        $('.filter-by-length button').removeClass('active');
        $(this).addClass('active');
        selected_lengths = length_list;
      } else if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).blur();
        var self = this;
        selected_lengths = selected_lengths.filter(function(length) {
          return length !== $(self).data('length');
        })
      } else if ($('.filter-by-length .active').length >= 2) {
        $('.all_lengths').trigger('click');
      } else {
        $(this).addClass('active');
        $('.all_lengths').removeClass('active');

        // first time
        if ($('.filter-by-length .active').length === 1) {
          selected_lengths = [];
        }

        selected_lengths.push($(this).data('length'));
      }
    })

    // AGE FILTER LISTENER
    $('.filter-by-age button').on('click', function(e) {
      e.preventDefault();

      if ($(this).data('age') === 'all') {
        $('.filter-by-age button').removeClass('active');
        $(this).addClass('active');
        selected_ages = age_list;
      } else if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).blur();
        var self = this;
        selected_ages = selected_ages.filter(function(age) {
          return age !== $(self).data('age');
        })
      } else if ($('.filter-by-age .active').length >= 2) {
        $('.all_ages').trigger('click');
      } else {
        $(this).addClass('active');
        $('.all_ages').removeClass('active');

        // first time
        if ($('.filter-by-age .active').length === 1) {
          selected_ages = [];
        }

        selected_ages.push($(this).data('age'));
      }
    })   

    // GENRE FILTER LISTENER
    $('.genre_filter').on('click', function(e) {
      e.preventDefault();

      // reset to ALL
      if ($(this).text().trim() === 'All') {
        $('.genre_filter').removeClass('active');
        $('.all_genres').addClass('active');
        selected_genres = genre_list;
      // toggle off 
      } else if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).blur();
        var self = this;
        selected_genres = selected_genres.filter(function(genre) {
          return genre !== $(self).text().trim();
        });
      // edge case: all filters selected, reset to ALL
      } else if ($('.filter-by-genre .active').length >= 6) {
        $('.all_genres').trigger('click');
      // toggle on
      } else {
        $(this).addClass('active');
        $('.all_genres').removeClass('active');

        // first filter applied -> empty genres array
        if ($('.filter-by-genre .active').length === 1) {
          selected_genres = [];
        }

        selected_genres.push($(this).text().trim());
      }
    });

    // INITIAL DATA FETCH
    fetch_books();

    function fetch_books() {
      $.ajax({
        type: 'GET',
        url: '/api/books',
        success: function(data) {
          $list.empty();
          all_data = data;
          selected_data = all_data;
          loadNextBooksGroup(PAGE, selected_data);
          PAGE++;
        }
      })
    }

    // LOAD NEXT 15 results
    function loadNextBooksGroup(p, data) {
      append_all_to_table(data.slice(p*15, 15 + p*15));
      append_pagination(data);
    }

    // APPEND A LIST OF BOOKS
    function append_all_to_table(books) {
      books.forEach(function(book) {
        append_one_to_table(book);
      });
    }

    function append_pagination(data) {
      var total = data.length;
      var current = total <= 15 + PAGE * 15 ? total : 15 + PAGE * 15;
      var $next_results = $('<a class="next_results">More Results (viewing ' + current + ' of ' + total + ') </a>');
      $next_results.click(function(e) {
        this.remove();
        e.preventDefault();
        loadNextBooksGroup(PAGE, data);
        PAGE++;
      });
      $list.append($next_results);
    }

    // BUILD INDIVIDUAL BOOK ITEM & APPEND IT TO LIST
    function append_one_to_table(book) {
      var $row = $('<li class="list-group-item" style="display: none"></li>');

      var $book = $('<div class="book" data-toggle="modal" data-target="#bookModal"></div>')
      var $title = $('<div class="book_title"></div>');
      var $author = $('<div class="book_author"></div>');

      var $data = $('<div class="book_data"></div>')
      var $genre = $('<div class="book_genre">' + book.genre + '</div>');

      var year = book.year;
      if (year < 0) {
        year = parseInt(Math.abs(year)) + ' BC';
      } else if (parseInt(year) < 1400) {
        year = parseInt(year) + ' AD';
      }
      var $length = $('<div class="book_length">' + book.length + ' pages  (' + year + ')</div>');

      var $recommenders = $('<div class="book_recommenders"></div>'); 

      // TITLE + AUTHOR
      if (book.title.length > 50) {
        $title.text(book.title.slice(0,50) + '...');
      } else {
        $title.text(book.title);
      }
      
      $author.text(book.author);
      $book.append($title).append($author);
      $book.on('click', function(e) {
        $('.modal-title').text(book.title);
        $('.modal-about').text(book.summary);
        $('.modal-blurb').text('Richard Dawkins is an English ethologist, evolutionary biologist and author. He is an emeritus fellow of New College, Oxford.')
        $('.get-book').attr('href', book.link).attr('target', '_blank');
        $('.modal-image').attr('src', 'https://images-na.ssl-images-amazon.com/images/I/41YdCQ5bIAL.jpg');
        $('.modal-year').text(year);
        $('.modal-length').text(book.length + ' pages');
        $('.modal-genre').text(book.genre);

        $('.modal-review').empty();
        $('.modal-recommenders').empty();

        var count = 0;
        var review_text = "";
        while (count < book.reviews.length) {
          if (book.reviews[count] !== '""') {
            review_text = book.reviews[count];
            break;
          } else {
            count++;
          }
        }

        if (review_text.length) {
          var $review = $('<div></div>');
          $review.text(review_text + ' - ' + book.recommenders[count]);
          $('.modal-review').append($review);
        }

        var i = 0;
        while (i < book.recommenders.length) {
          var $thumb = $('<img class="img-circle"/>');
          var recommender = book.recommenders[i];

          $thumb.data('toggle', 'tooltip');
          $thumb.attr('title', 'Recommended by ' + recommender);
          $thumb.attr('src', book.thumbnails[i]);

          $('.modal-recommenders').append($thumb);
          $thumb.tooltip();

          i++;
        }
      })

      // DATA
      $data.append($genre).append($length);

      // RECOMMENDERS
      var i = 0;
      while (i < book.recommenders.length) {
        var $thumb = $('<img class="img-circle"/>');
        var recommender = book.recommenders[i];
        var review = book.reviews[i] === '""' ? null : book.reviews[i].trim();
        var tooltip_text = review ? recommender + ': ' + review : recommender;

        $thumb.data('toggle', 'tooltip');
        $thumb.attr('title', tooltip_text);
        $thumb.attr('src', book.thumbnails[i]);

        $recommenders.append($thumb);
        $thumb.tooltip();

        i++;
      }

      var $span = $('<span><a href="#"></a></span>');
      $span.addClass('glyphicon glyphicon-chevron-right');
      $span.data('toggle', 'tooltip');
      $span.attr('title', book.recommenders.join(', '));
      $recommenders.append($span);
      $span.tooltip();

      // POST
      $row.append($book)
          .append($data)
          .append($recommenders);

      $list.append($row);
      $row.fadeIn();
    }
  })
})()