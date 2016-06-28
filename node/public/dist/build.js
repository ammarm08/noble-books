window.initBooksPage = function () {
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

    // LOADER
    var $loader = $('.loader');

    // SELECTORS
    var $list = $('.books-list');
    var $advanced = $('.show-advanced');
    var $search = $('.show-results');
    var $ageFilter = $('.filter-by-age button');
    var $genreFilter = $('.genre_filter');
    var $lengthFilter = $('.filter-by-length button');
    var $sorts = $('.dropdown-item');
    var $book = $('.book-row');

    // INIT
    initializeTooltips();
    setListeners();
    background_fetch();

    function initializeTooltips () {
      $ageFilter.tooltip();
      $lengthFilter.tooltip();
      $('.books-list span').tooltip();
    }

    function setListeners () {
      // immediately apply appropriate styling on all buttons
      $search.mouseup(function(e) { $(this).blur(); });
      
      // set filters
      $ageFilter.on('click', updateAgeFilter);
      $genreFilter.on('click', updateGenreFilter);
      $lengthFilter.on('click', updateLengthFilter);

      $advanced.on('click', toggleAdvancedFilters); // show advanced filters
      $search.on('click', applyFilters); // filter results
      $sorts.on('click', applySort);

      // set initial listeners on server-rendered data
      $book.on('click', updateModal);
    }

    function background_fetch (q) {
      q = q || "";

      $.ajax({
        type: 'GET',
        url: '/api/books' + '?' + 'sort=' + q,
        success: function(data) {
          // set in-browser data
          all_data = data;
          selected_data = all_data;

          // append "More Results" and data attributes
          append_pagination(selected_data);
          setDataAttributesForBooks();

          // plug for joining listserve
          if ($('#email-signup').length === 0) {
            append_email_signup();
          }

          // increment global page # tracker
          PAGE++;
        }
      })
    }

    function setDataAttributesForBooks () {
      $('.book-row').each(function(i) {
        var $self = $(this);

        $self.data('book-title', selected_data[i].title);
        $self.data('book-author', selected_data[i].author);
        $self.data('book-summary', selected_data[i].summary);
        $self.data('book-link', selected_data[i].link);
        $self.data('book-year', selected_data[i].year);
        $self.data('book-genre', selected_data[i].genre);
        $self.data('book-reviews', selected_data[i].reviews);
        $self.data('book-recommenders', selected_data[i].recommenders);
        $self.data('book-length', selected_data[i].length);
        $self.data('book-thumbnails', selected_data[i].thumbnails);

        // set thumbnail tooltips
        $self.find('.img-circle').each(function(j) {
          var review = selected_data[i].reviews[j];
          var recommender = selected_data[i].recommenders[j];
          var tooltip_text = review === '""' ? recommender : recommender + ': ' + review; 
          $(this).attr('title', tooltip_text);
          $(this).tooltip();
        })
      })
    }

    function fetch_books(q) {
      $list.append($('<div class="loader"><img src="https://s3.amazonaws.com/bookswell-media/img-assets/default.svg"/></div>'));
      $loader.fadeIn();
      q = q || "";

      $.ajax({
        type: 'GET',
        url: '/api/books' + '?' + 'sort=' + q,
        success: function(data) {
          $loader.fadeOut(1500);
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
        $('.show-advanced').text('Hide Filters')
      }

      $(this).blur();
    }

    function applyFilters (e) {
      resetList();
      selected_data = filterData();
      loadNextBooksGroup(PAGE, selected_data);
      removeActiveFromSearch();
      PAGE++;
    }

    function applySort (e) {
      e.preventDefault();
      resetList();

      var sort_type = $(this).data('sort');
      var sort_text = $('[data-sort="' + sort_type + '"]').text();
      $('#current-sort').text('Sort By: ' + sort_text)

      fetch_books(sort_type);
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
        selected_lengths = length_list;
      } else if ($(this).hasClass('active')) {
        removeActiveClass($(this));
        selected_lengths = updateFilterOptions(selected_lengths, 'length', $(this));
      } else if ($('.filter-by-length .active').length >= 2) {
        $('.all_lengths').trigger('click');
      } else {
        $(this).addClass('active');
        $('.all_lengths').removeClass('active');
        selected_lengths = emptyListOnFirstTimeFilter(selected_lengths, $('.filter-by-length .active'));
        addFilterToList(selected_lengths, $(this).data('length'));
      }

      addActiveToSearch();
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

      addActiveToSearch();
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

      addActiveToSearch();
    }

    function addActiveToSearch () {
      if (!$search.hasClass('active')) {
        $search.addClass('active');
      }
    }

    function removeActiveFromSearch () {
      if ($search.hasClass('active')) {
        $search.removeClass('active');
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
      books.forEach(function(book, i) {
        append_one_to_table(book, i);
      });

      if ($('#email-signup').length === 0) {
        append_email_signup();
      }
    }

    function append_email_signup() {
      var $email = $('<a id="email-signup" class="list-group-item"> Get early access to new books and exclusive author interviews. </a>');

      $email.attr('href', 'http://eepurl.com/b5XRYX');
      $email.attr('target', '_blank');

      $('.books-list li:eq(8)').after($email);
    }

    function append_pagination(book_data) {
      var total = book_data.length;
      var current = calculateBooksCurrentlyViewed(total);

      var $next_results = $('<a class="next_results"></a>');
      $next_results.text('More Results (viewing ' + current + ' of ' + total + ')');
      $next_results.click({book_data: book_data}, showMoreResults);

      $list.append($next_results);
    }

    function append_one_to_table (book, i) {
      // CONTAINER
      var $row = $('<li class="list-group-item book-row" style="display: none"></li>');

      // TITLE + AUTHOR
      var $book = $('<div class="book" data-toggle="modal" data-target="#bookModal"></div>')
      var $title = $('<div class="book_title"></div>');
      var $author = $('<div class="book_author"></div>');

      // DATA
      $book.data('book-title', book.title);
      $book.data('book-author', book.author);
      $book.data('book-summary', book.summary);
      $book.data('book-link', book.link);
      $book.data('book-year', book.year);
      $book.data('book-genre', book.genre);
      $book.data('book-reviews', book.reviews);
      $book.data('book-recommenders', book.recommenders);
      $book.data('book-length', book.length);
      $book.data('book-thumbnails', book.thumbnails);

      $title.text(formatTitle(book.title));
      $author.text(book.author);
      $book.append($title).append($author);
      // $book.on('click', updateModal);

      // GENRE + LENGTH
      var $data = $('<div class="book_data"></div>')
      var $genre = $('<div class="book_genre">' + book.genre + '</div>');
      var $length = $('<div class="book_length">' + book.length + ' pages  (' + formatYear(book.year) + ')</div>');

      $data.append($genre).append($length);

      // RECOMMENDERS
      var $recommenders = $('<div class="book_recommenders"></div>'); 
      setListThumbnails(book, $recommenders);
      setRecommenderChevron(book, $recommenders);

      // APPEND ALL
      $row.append($book)
          .append($data)
          .append($recommenders);

      $list.append($row);
      $row.fadeIn(1000);
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

    function formatYear (year) {
      if (year < 0) {
        return parseInt(Math.abs(year)) + ' BC';
      } else if (parseInt(year) < 1400) {
        return parseInt(year) + ' AD';
      } else {
        return year;
      }
    }

    function formatTitle (title) {
      if (title.length > 50) {
        return title.slice(0,50) + '...';
      } else {
        return title;
      }
    }

    function calculateReviewIndex (reviews) {
      var i = 0;
      var review_index = -1;

      while (i < reviews.length) {
        if (reviews[i] !== '""') {
          review_index = i;
          break;
        } else {
          i++;
        }
      }

      return review_index;
    }

    function setDefaultReview (reviews, recommenders) {
      var review_index = calculateReviewIndex(reviews);
      var review_text = reviews[review_index];
      var reviewer = recommenders[review_index];

      var $review = $('<div></div>');
      if (review_text) {
        $review.text(review_text + ' - ' + reviewer);
      } else {
        $review.text('None found.');
      }
      
      return $review;
    }

    function setModalThumbnails (recommenders, thumbnails) {
      for (var i = 0; i < recommenders.length; i++) {
        var $thumb = $('<img class="img-circle"/>');

        $thumb.data('toggle', 'tooltip');
        $thumb.attr('title', 'Recommended by ' + recommenders[i]);
        $thumb.attr('src', thumbnails[i]);

        $('.modal-recommenders').append($thumb);
        $thumb.tooltip();
      }
    }

    function updateModal (e) {
      // clear previous values
      $('.modal-review').empty();
      $('.modal-recommenders').empty();

      // update values
      $('.modal-title').text($(this).data('book-title'));

      if (!$(this).data('book-summary').length) {
        $('.modal-about').text("We don't have one yet in our system, but it'll be here soon! Help us out by suggesting an edit :)");
      } else {
        $('.modal-about').text($(this).data('book-summary'));
      }
      
      $('.modal-blurb').text($(this).data('book-author'));
      $('.get-book').attr('href', $(this).data('book-link')).attr('target', '_blank');
      $('.modal-image').attr('src', 'https://images-na.ssl-images-amazon.com/images/I/41YdCQ5bIAL.jpg');
      $('.modal-year').text(formatYear($(this).data('book-year')));
      $('.modal-length').text($(this).data('book-length') + ' pages');
      $('.modal-genre').text($(this).data('book-genre'));

      // set default review text
      var $review = setDefaultReview($(this).data('book-reviews'), $(this).data('book-recommenders'));
      $('.modal-review').append($review);

      // set recommender thumbnails
      setModalThumbnails($(this).data('book-recommenders'), $(this).data('book-thumbnails'));
    }

    function setListThumbnails (book, $recommenders) {
      for (var i = 0; i < book.recommenders.length; i++) {
        var $thumb = $('<img class="img-circle"/>');

        var recommender = book.recommenders[i];
        var review = book.reviews[i] === '""' ? null : book.reviews[i].trim();
        var tooltip_text = review ? recommender + ': ' + review : recommender;

        $thumb.data('toggle', 'tooltip');
        $thumb.attr('title', tooltip_text);
        $thumb.attr('src', book.thumbnails[i]);

        $recommenders.append($thumb);
        $thumb.tooltip();
      }
    }

    function setRecommenderChevron (book, $recommenders) {
      var $span = $('<span><a href="#"></a></span>');
      $span.addClass('glyphicon glyphicon-option-vertical');

      $span.data('toggle', 'tooltip');
      $span.attr('title', book.recommenders.join(', '));
      $span.tooltip();

      $recommenders.append($span);
    }
  })
};;window.initThinkersPage = function() {
  $(document).ready(function() {
    // GLOBALS
    var all_data = [];
    var $books = $('.books');
    var $loader = $('.loader');

    fetch_books();

    function fetch_books () {
      $books.append($('<div class="loader"><img src="https://s3.amazonaws.com/bookswell-media/img-assets/default.svg"/></div>'));
      $loader.fadeIn();
      $.ajax({
        type: 'GET',
        url: '/api/recommenders',
        success: function(data) {
          $loader.fadeOut(1500);
          $books.empty();
          all_data = data;
          loadNextRecommenderGroup(all_data);
        }
      })
    }

    // LOAD NEXT 15 results
    function loadNextRecommenderGroup(data) {
      append_all_recs_to_table(data);
    }

    // APPEND A LIST OF RECOMMENDERS
    function append_all_recs_to_table(recs) {
      recs.forEach(function(r) {
        append_one_rec_to_table(r);
      });
    }

    // BUILD INDIVIDUAL BOOK ITEM & APPEND IT TO LIST
    function append_one_rec_to_table(rec) {
      var $grid = $('<div class="recommender-collection" style="display: none"></div>');
      var $recommender = $('<div class="recommender" data-toggle="modal" data-target="#recModal"></div>');
      $recommender.text(rec.name);

      var $thumbContainer = $('<div class="thumbnail-container" data-toggle="modal" data-target="#recModal"></div>');
      var $thumb = $('<img class="img-circle"/>');
      $thumb.attr('src', rec.thumbnail);

      $thumbContainer.append($thumb);
      $grid.append($thumbContainer).append($recommender);

      $grid.on('click', function(e) {
        e.preventDefault();

        $('.modal-title').text(rec.name + "'s Picks");
        $('.modal-about').text(rec.name + ' ' + rec.bio);

        $('.recommendations-container').empty();
        rec.recommended_books.forEach(function(b) {
          var $rec_group = $('<div></div>');
          var $recommendation = $('<a class="list-group-item thumbnail recommendation"></a>');
          var $rec_src = $('<a class="glyphicon glyphicon-question-sign"></a>');

          $recommendation.text(b[0]);
          $recommendation.attr('href', b[1]);
          $recommendation.attr('target', '_blank');

          $rec_src.attr('title', 'Source');
          $rec_src.attr('href', b[2]);
          $rec_src.attr('target', '_blank');
          $rec_src.data('toggle', 'tooltip');
          $rec_src.tooltip();

          $rec_group.append($recommendation).append($rec_src);
          $('.recommendations-container').append($rec_group);
        })
      });

      $books.append($grid);
      $grid.fadeIn(1000);
    }
  })
};