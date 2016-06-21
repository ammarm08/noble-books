(function() {

  $(document).ready(function() {
    // GLOBALS
    var all_data = [];
    var $books = $('.books');
    var $loader = $('.loader');

    // INITIAL DATA FETCH
    fetch_books();

    function fetch_books() {
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
          var $recommendation = $('<a class="list-group-item thumbnail recommendation"></a>');
          $recommendation.text(b[0]);
          $recommendation.attr('href', b[1]);
          $recommendation.attr('target', '_blank');
          $('.recommendations-container').append($recommendation);
        })
      });

      $books.append($grid);
      $grid.fadeIn(1000);
    }
  })
})()