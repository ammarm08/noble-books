(function() {
  $(document).ready(function() {
    // PAGINATION STATE
    var PAGE = 0;

    // FILTER CATEGORIES
    var genre_list = $('.genre_filter').map(function() { return $(this).text().trim(); }).toArray();
    var length_list = $('.filter-by-length button').map(function() { return $(this).data('length'); }).toArray();
    var age_list = $('.filter-by-age button').map(function() { return $(this).data('age'); }).toArray();

    // DATA STORE (ALL v. SELECTED)
    var all_data = [];
    var selected_data = [];

    // FILTER STORE
    var selected_lengths = length_list;
    var selected_genres = genre_list;
    var selected_ages = age_list;

    // SELECTORS
    var $list = $('.books-list');
    var $advanced = $('.show-advanced');
    var $search = $('.show-results');
    var $ageFilter = $('.filter-by-age button');
    var $genreFilter = $('.genre_filter');
    var $lengthFilter = $('.filter-by-length button');

    // INIT
    setListeners();
    fetch_books();

    function setListeners () {
      // set filters
      $ageFilter.on('click', updateAgeFilter);
      $genreFilter.on('click', updateGenreFilter);
      $lengthFilter.on('click', updateLengthFilter);

      $advanced.on('click', toggleAdvancedFilters); // show advanced filters
      $search.on('click', applyFilters); // filter results
    }

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

    function toggleAdvancedFilters (e) {
      e.preventDefault();
      if ($('.advanced-filter:visible').length) {
        $('.advanced-filter').hide();
        $('.show-advanced').text('Advanced Filters');
      } else {
        $('.advanced-filter').show();
        $('.show-advanced').text('Show Less Filters')
      }
    }

    function applyFilters (e) {
      resetList();
      selected_data = filterData();
      loadNextBooksGroup(PAGE, selected_data);
      PAGE++;
    }

    function resetList () {
      $list.empty();
      PAGE = 0;
    }

    function filterData () {
      return all_data.filter(function(book) {
        return isSelectedGenre(book.genre) && isSelectedLength(book.length) && isSelectedAge(book.year);
      })
    }

    function isSelectedGenre (g) {
      return selected_genres.indexOf(g) !== -1;
    }

    function isSelectedLength (l) {
      if (selected_lengths.indexOf('short') !== -1 && l < 150) {
        return true;
      } else if (selected_lengths.indexOf('medium') !== -1 && l > 150 && l < 400) {
        return true;
      } else if (selected_lengths.indexOf('long') !== -1 && l > 400) {
        return true;
      } else {
        return false;
      }
    }

    function isSelectedAge (a) {
      if (selected_ages.indexOf(1900) !== -1 && a < 1900) {
        return true;
      } else if (selected_ages.indexOf(1901) !== -1 && a >= 1900 && a < 2000) {
        return true;
      } else if (selected_ages.indexOf(2000) !== -1 && a >= 2000) {
        return true;
      } else {
        return false;
      }
    }

    function updateLengthFilter (e) {
      e.preventDefault();

      if ($(this).data('length') === 'all') {
        setAsUniquelyActive($lengthFilter, $(this));
        selected_ages = length_list;
      } else if ($(this).hasClass('active')) {
        removeActiveClass($(this));
        selected_ages = updateFilterOptions(selected_lengths, 'length', $(this));
      } else if ($('.filter-by-length .active').length >= 2) {
        $('.all_lengths').trigger('click');
      } else {
        $(this).addClass('active');
        $('.all_lengths').removeClass('active');
        selected_lengths = emptyListOnFirstTimeFilter(selected_lengths, $('.filter-by-length .active'));
        addFilterToList(selected_lengths, $(this).data('length'));
        console.log(selected_lengths);
      }
    }

    function updateAgeFilter (e) {
      e.preventDefault();

      if ($(this).data('age') === 'all') {
        setAsUniquelyActive($ageFilter, $(this));
        selected_ages = age_list;
      } else if ($(this).hasClass('active')) {
        removeActiveClass($(this));
        selected_ages = updateFilterOptions(selected_ages, 'age', $(this));
      } else if ($('.filter-by-age .active').length >= 2) {
        $('.all_ages').trigger('click');
      } else {
        $(this).addClass('active');
        $('.all_ages').removeClass('active');
        selected_ages = emptyListOnFirstTimeFilter(selected_ages, $('.filter-by-age .active'));
        addFilterToList(selected_ages, $(this).data('age'));
      }
    }

    function updateGenreFilter (e) {
      e.preventDefault();

      if ($(this).data('genre') === 'All') {
        setAsUniquelyActive($genreFilter, $(this));
        selected_genres = genre_list;
      } else if ($(this).hasClass('active')) {
        removeActiveClass($(this));
        selected_genres = updateFilterOptions(selected_genres, 'genre', $(this));
      } else if ($('.filter-by-genre .active').length >= 6) {
        $('.all_genres').trigger('click');
      } else {
        $(this).addClass('active');
        $('.all_genres').removeClass('active');
        selected_genres = emptyListOnFirstTimeFilter(selected_genres, $('.filter-by-genre .active'));
        addFilterToList(selected_genres, $(this).data('genre'));
      }
    }

    function setAsUniquelyActive($selectors, $target) {
      $selectors.removeClass('active');
      $target.addClass('active');
    }

    function removeActiveClass($target) {
      $target.removeClass('active');
      $target.blur();
    }

    function updateFilterOptions(filter_list, type, $target) {
      return filter_list.filter(function(item) {
        return item !== $target.data(type);
      })
    }

    function emptyListOnFirstTimeFilter (filter_list, $target) {
      if ($target.length === 1) {
        return [];
      } else {
        return filter_list;
      }
    }

    function addFilterToList (filter_list, filter) {
      filter_list.push(filter);
    }

    // LOAD NEXT 15 results
    function loadNextBooksGroup(p, book_data) {
      append_all_to_table(book_data.slice(p*15, 15 + p*15)); // only append 15 at a time
      append_pagination(book_data);
    }

    // APPEND A LIST OF BOOKS
    function append_all_to_table(books) {
      books.forEach(function(book) {
        append_one_to_table(book);
      });
    }

    function append_pagination(book_data) {
      var total = book_data.length;
      var current = calculateBooksCurrentlyViewed(total);

      var $next_results = $('<a class="next_results"></a>');
      $next_results.text('More Results (viewing ' + current + ' of ' + total + ')');
      $next_results.click({book_data: book_data}, showMoreResults);

      $list.append($next_results);
    }

    function calculateBooksCurrentlyViewed (total) {
      return total <= 15 + PAGE * 15 ? total : 15 + PAGE * 15; // factor of 15 unless on last page
    }

    function showMoreResults (e) {
      this.remove();
      e.preventDefault();
      loadNextBooksGroup(PAGE, e.data.book_data);
      PAGE++;
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