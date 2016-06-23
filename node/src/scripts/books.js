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

    // INIT
    initializeTooltips();
    setListeners();
    fetch_books();

    function initializeTooltips () {
      $ageFilter.tooltip();
      $lengthFilter.tooltip();
    }

    function setListeners () {
      // set filters
      $ageFilter.on('click', updateAgeFilter);
      $genreFilter.on('click', updateGenreFilter);
      $lengthFilter.on('click', updateLengthFilter);

      $advanced.on('click', toggleAdvancedFilters); // show advanced filters
      $search.on('click', applyFilters); // filter results
      $sorts.on('click', applySort);
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
    }

    function applyFilters (e) {
      resetList();
      selected_data = filterData();
      loadNextBooksGroup(PAGE, selected_data);
      PAGE++;
    }

    function applySort (e) {
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

    function append_one_to_table (book) {
      // CONTAINER
      var $row = $('<li class="list-group-item" style="display: none"></li>');

      // TITLE + AUTHOR
      var $book = $('<div class="book" data-toggle="modal" data-target="#bookModal"></div>')
      var $title = $('<div class="book_title"></div>');
      var $author = $('<div class="book_author"></div>');

      $title.text(formatTitle(book.title));
      $author.text(book.author);
      $book.append($title).append($author);
      $book.click({book: book}, updateModal);

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

    function setDefaultReview (book) {
      var review_index = calculateReviewIndex(book.reviews);
      var review_text = book.reviews[review_index];
      var reviewer = book.recommenders[review_index];

      var $review = $('<div></div>');
      if (review_text) {
        $review.text(review_text + ' - ' + reviewer);
      } else {
        $review.text('None found.');
      }
      
      return $review;
    }

    function setModalThumbnails (book) {
      for (var i = 0; i < book.recommenders.length; i++) {
        var $thumb = $('<img class="img-circle"/>');

        $thumb.data('toggle', 'tooltip');
        $thumb.attr('title', 'Recommended by ' + book.recommenders[i]);
        $thumb.attr('src', book.thumbnails[i]);

        $('.modal-recommenders').append($thumb);
        $thumb.tooltip();
      }
    }

    function updateModal (e) {
      // clear previous values
      $('.modal-review').empty();
      $('.modal-recommenders').empty();

      // update values
      $('.modal-title').text(e.data.book.title);

      if (!e.data.book.summary.length) {
        $('.modal-about').text("We don't have one yet in our system, but it'll be here soon! Help us out by suggesting an edit :)");
      } else {
        $('.modal-about').text(e.data.book.summary);
      }
      
      $('.modal-blurb').text(e.data.book.author);
      $('.get-book').attr('href', e.data.book.link).attr('target', '_blank');
      $('.modal-image').attr('src', 'https://images-na.ssl-images-amazon.com/images/I/41YdCQ5bIAL.jpg');
      $('.modal-year').text(formatYear(e.data.book.year));
      $('.modal-length').text(e.data.book.length + ' pages');
      $('.modal-genre').text(e.data.book.genre);

      // set default review text
      var $review = setDefaultReview(e.data.book);
      $('.modal-review').append($review);

      // set recommender thumbnails
      setModalThumbnails(e.data.book);
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
};