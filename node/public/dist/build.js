(function () {
  $(document).ready(function() {

    var globals = {
      page_increment: 10
    };

    var config = {
      // arrays of all possible filters
      genres : $('.genre_filter').map(function() { return $(this).data('genre'); }).toArray(),
      lengths : $('.filter-by-length button').map(function() { return $(this).data('length'); }).toArray(),
      ages : $('.filter-by-age button').map(function() { return $(this).data('age'); }).toArray()
    };

    var state = {
      store: {
        // will be populated w/ books
        all: [],
        selected: [],

        // defaults: all filters are selected
        lengths: config.lengths,
        genres: config.genres,
        ages: config.ages
      },
      page: 0,
      sort: 'frequencies_title' // default sort
    };

    var components = {
      books_list: $('.books-list'),
      book : $('.book-row'),
      advanced_toggle: $('.show-advanced'),
      advanced_filter: $('.advanced-filter'),
      search: $('.show-results'),
      age_filter : $('.filter-by-age button'),
      genre_filter : $('.genre_filter'),
      length_filter : $('.filter-by-length button'),
      sorts : $('.dropdown-item')
    };

    // INIT
    initializeTooltips();
    setListeners();
    fetch_books(setInitialBooksData);

    function initializeTooltips () {
      components.age_filter.tooltip();
      components.length_filter.tooltip();
      $('.books-list span').tooltip();
    }

    function setListeners () {
      // prevent hover prop from overriding new styling
      components.search.mouseup(blurComponent);

      // on click, (de)select filters and update state
      components.age_filter.on('click', updateAgeFilter);
      components.genre_filter.on('click', updateGenreFilter);
      components.length_filter.on('click', updateLengthFilter);
      components.advanced_toggle.on('click', toggleAdvancedFilters); 
      components.search.on('click', applyFilters);
      components.sorts.on('click', applySort);
      components.book.on('click', updateModal);
    }

    function fetch_books (callback) {
      $.ajax({
        type: 'GET',
        url: '/api/books' + '?' + 'sort=' + state.sort,
        success: callback
      })
    }

    function setInitialBooksData (data) {
      // set state
      state.store.all = data;
      state.store.selected = state.store.all;

      // bind data for each book to respective DOM element
      setDataAttributesForAll();

      // append pagination and email signup DOM elements
      append_pagination(state.store.selected);
      append_email_signup();

      // increment page #
      state.page++;
    }

    function updateBooksData (data) {
      // empty current books list
      components.books_list.empty();

      // update state
      state.store.all = data;
      state.store.selected = state.store.all;

      // update DOM
      loadNextBooksGroup(state.page, state.store.selected);

      // increment page #
      state.page++;
    }

    function setDataAttributesForAll () {
      components.book.each(function(i) {
        var $book = $(this);
        setDataAttributesForOne($book, i);
        setBookRecommenderTooltips($book, i);
      });
    }

    function setDataAttributesForOne ($book, index) {
      $book.data('book-title', state.store.selected[index].title);
      $book.data('book-author', state.store.selected[index].author);
      $book.data('book-summary', state.store.selected[index].summary);
      $book.data('book-link', state.store.selected[index].link);
      $book.data('book-year', state.store.selected[index].year);
      $book.data('book-genre', state.store.selected[index].genre);
      $book.data('book-reviews', state.store.selected[index].reviews);
      $book.data('book-recommenders', state.store.selected[index].recommenders);
      $book.data('book-length', state.store.selected[index].length);
      $book.data('book-thumbnails', state.store.selected[index].thumbnails);
    };

    function setBookRecommenderTooltips ($book, book_index) {
      $book.find('.img-circle').each(function(i) {
        var review = state.store.selected[book_index].reviews[i];
        var recommender = state.store.selected[book_index].recommenders[i];
        var tooltip_text = review === '""' ? recommender : recommender + ': ' + review;

        $(this).attr('title', tooltip_text);
        $(this).tooltip();
      })
    }

    function toggleAdvancedFilters (e) {
      e.preventDefault();

      if ($('.advanced-filter:visible').length) {
        components.advanced_filter.hide();
        components.advanced_toggle.text('Advanced Filters');
      } else {
        components.advanced_filter.show();
        components.advanced_toggle.text('Hide Filters')
      }

      blurComponent();
    }

    function applyFilters (e) {
      resetBooksList();

      // update state & DOM
      state.store.selected = filterData();
      loadNextBooksGroup(state.page, state.store.selected);

      // remove active state from search button
      removeActiveFromSearch();

      // increment page
      state.page++;
    }

    function applySort (e) {
      e.preventDefault();
      resetBooksList();

      state.sort = $(this).data('sort');
      var sort_text = $('[data-sort="' + state.sort + '"]').text();
      $('#current-sort').text('Sort By: ' + sort_text)

      fetch_books(updateBooksData);
    }

    function resetBooksList () {
      components.books_list.empty();
      state.page = 0;
    }

    function filterData () {
      return state.store.all.filter(function(book) {
        return isSelectedGenre(book.genre) && isSelectedLength(book.length) && isSelectedAge(book.year);
      })
    }

    function isSelectedGenre (g) {
      return state.store.genres.indexOf(g) !== -1;
    }

    function isSelectedLength (l) {
      if (state.store.lengths.indexOf('short') !== -1 && l < 150) {
        return true;
      } else if (state.store.lengths.indexOf('medium') !== -1 && l > 150 && l < 400) {
        return true;
      } else if (state.store.lengths.indexOf('long') !== -1 && l > 400) {
        return true;
      } else {
        return false;
      }
    }

    function isSelectedAge (a) {
      if (state.store.ages.indexOf(1900) !== -1 && a < 1900) {
        return true;
      } else if (state.store.ages.indexOf(1901) !== -1 && a >= 1900 && a < 2000) {
        return true;
      } else if (state.store.ages.indexOf(2000) !== -1 && a >= 2000) {
        return true;
      } else {
        return false;
      }
    }

    function blurComponent (e) {
      $(this).blur();
    };

    function updateLengthFilter (e) {
      e.preventDefault();

      if ($(this).data('length') === 'all') {
        setAsUniquelyActive(components.length_filter, $(this));
        state.store.lengths = config.lengths;
      } else if ($(this).hasClass('active')) {
        removeActiveClass($(this));
        state.store.lengths = updateFilterOptions(state.store.lengths, 'length', $(this));
      } else if ($('.filter-by-length .active').length >= 2) {
        $('.all_lengths').trigger('click');
      } else {
        $(this).addClass('active');
        $('.all_lengths').removeClass('active');
        state.store.lengths = emptyListOnFirstTimeFilter(state.store.lengths, $('.filter-by-length .active'));
        addFilterToList(state.store.lengths, $(this).data('length'));
      }

      addActiveToSearch();
    }

    // TO-DO CLEAN UP FILTER UPDATING CODE LOGIC. IT IS SLOPPY!!!
    // - modularize (there's a lot of code repetition)
    // - stick to modifying components previously declared
    function updateAgeFilter (e) {
      e.preventDefault();

      if ($(this).data('age') === 'all') {
        setAsUniquelyActive(components.age_filter, $(this));
        state.store.ages = config.ages;
      } else if ($(this).hasClass('active')) {
        removeActiveClass($(this));
        state.store.ages = updateFilterOptions(state.store.ages, 'age', $(this));
      } else if ($('.filter-by-age .active').length >= 2) {
        $('.all_ages').trigger('click');
      } else {
        $(this).addClass('active');
        $('.all_ages').removeClass('active');
        state.store.ages = emptyListOnFirstTimeFilter(state.store.ages, $('.filter-by-age .active'));
        addFilterToList(state.store.ages, $(this).data('age'));
      }

      addActiveToSearch();
    }

    function updateGenreFilter (e) {
      e.preventDefault();

      if ($(this).data('genre') === 'All') {
        setAsUniquelyActive(components.genre_filter, $(this));
        state.store.genres = config.genres;
      } else if ($(this).hasClass('active')) {
        removeActiveClass($(this));
        state.store.genres = updateFilterOptions(state.store.genres, 'genre', $(this));
      } else if ($('.filter-by-genre .active').length >= 6) {
        $('.all_genres').trigger('click');
      } else {
        $(this).addClass('active');
        $('.all_genres').removeClass('active');
        state.store.genres = emptyListOnFirstTimeFilter(state.store.genres, $('.filter-by-genre .active'));
        addFilterToList(state.store.genres, $(this).data('genre'));
      }

      addActiveToSearch();
    }

    function addActiveToSearch () {
      if (!components.search.hasClass('active')) {
        components.search.addClass('active');
      }
    }

    function removeActiveFromSearch () {
      if (components.search.hasClass('active')) {
        components.search.removeClass('active');
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
    function loadNextBooksGroup(page, book_data) {
      var next_page_start = page * globals.page_increment;
      var next_page_end = globals.page_increment + page * globals.page_increment;
      var next_visible_group = book_data.slice(next_page_start, next_page_end);

      append_all_to_table(next_visible_group);
      append_pagination(book_data);
    }

    // APPEND A LIST OF BOOKS
    function append_all_to_table(books) {
      books.forEach(function(book, i) {
        append_one_to_table(book, i);
      });

      append_email_signup();
    }

    function append_email_signup() {
      if ($('#email-signup').length === 0) {
        var $email = $('<a id="email-signup" class="list-group-item"> Get early access to new books and exclusive author interviews. </a>');

        $email.attr('href', 'http://eepurl.com/b5XRYX');
        $email.attr('target', '_blank');

        $('.books-list li:eq(4)').after($email);
      }
    }

    function append_pagination(book_data) {
      var total = book_data.length;
      var current = calculateBooksCurrentlyViewed(total);

      var $next_results = $('<a class="next_results"></a>');
      $next_results.text('More Results (viewing ' + current + ' of ' + total + ')');
      $next_results.click({book_data: book_data}, showMoreResults);

      components.books_list.append($next_results);
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

      $book.on('click', updateModal);

      $title.text(formatTitle(book.title));
      $author.text(book.author);
      $book.append($title).append($author);

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

      components.books_list.append($row);
      $row.fadeIn(1000);
    }

    function calculateBooksCurrentlyViewed (total) {
      return total <= globals.page_increment + state.page * globals.page_increment ? total : globals.page_increment + state.page * globals.page_increment; // factor of 15 unless on last page
    }

    function showMoreResults (e) {
      this.remove();
      e.preventDefault();
      loadNextBooksGroup(state.page, e.data.book_data);
      state.page++;
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

      // set GoodReads widget if applicable
      if ($(this).data('book-link').indexOf('amazon.com') > -1) {
        append_good_reads_widget($(this).data('book-link'));
      }
    }

    function append_good_reads_widget (link) {
      // clear previous values
      $('#gr_add_to_books').empty();

      // skeleton DOM elements
      var $gr_container = $('<div class="gr_custom_each_container_"></div>');
      var $gr_link = $('<a target="_blank" style="border:none"></a>');
      var $script = $('<script></script>');

      // data formatting
      var isbn = link.split('/').pop();
      var details = '?atmb_widget%5Bbutton%5D=atmb_widget_1.png&amp;atmb_widget%5Bhide_friends%5D=on'; 
      var widget = 'https://www.goodreads.com/book/add_to_books_widget_frame/' + isbn + details;

      var good_reads_link = 'https://www.goodreads.com/book/isbn/' + isbn;

      // binding data to DOM elements
      $gr_link.attr('href', good_reads_link);
      $script.attr('src', widget);
      $gr_container.append($gr_link);
      $('#gr_add_to_books').append($gr_container).append($script);
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
})();;window.initThinkersPage = function() {
  $(document).ready(function() {
    // GLOBALS
    var all_data = [];
    var $recs = $('.recs');
    
    $('.thumbnail-container').on('click', updateRecModal);
    background_fetch();

    function background_fetch () {
      $.ajax({
        type: 'GET',
        url: '/api/recommenders',
        success: function(data) {
          all_data = data;
          setDataAttributesForRecs();
        }
      })
    }

    function setDataAttributesForRecs () {
      $('.thumbnail-container').each(function(i) {
        var $self = $(this);
        $self.data('recommended-books', all_data[i].recommended_books);
      });
    }

    function updateRecModal (e) {
      $('.modal-title').text($(this).data('name') + "'s Picks");
      $('.modal-about').text($(this).data('name') + ' ' + $(this).data('bio'));

      $('.recommendations-container').empty();

      var books = $(this).data('recommended-books');
      for (var i = 0; i < books.length; i++) {
        var $rec_group = $('<div></div>');
        var $recommendation = $('<a class="list-group-item thumbnail recommendation"></a>');
        var $rec_src = $('<a class="glyphicon glyphicon-question-sign"></a>');

        $recommendation.text(books[i][0]);
        $recommendation.attr('href', books[i][1]);
        $recommendation.attr('target', '_blank');

        $rec_src.attr('title', 'Source');
        $rec_src.attr('href', books[i][2]);
        $rec_src.attr('target', '_blank');
        $rec_src.data('toggle', 'tooltip');
        $rec_src.tooltip();

        $rec_group.append($recommendation).append($rec_src);
        $('.recommendations-container').append($rec_group);
      }
    }
  });
};