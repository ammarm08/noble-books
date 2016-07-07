window.initThinkersPage = function() {
  $(document).ready(function() {
    // GLOBALS
    var all_data = [];
    var $recs = $('.recs');

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