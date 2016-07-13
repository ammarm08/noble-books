window.initThinkersPage = function() {
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