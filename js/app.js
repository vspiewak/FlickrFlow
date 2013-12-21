(function(window) {
  "use strict";

  var DEFAULT_TAGS = "Batman";
  var Flickr_API_KEY = "cbb9cfe0e72aea222eac937f10afc677";
  var Flickr_SIZE = "small_url";
  var Flickr_IMAGE_PER_PAGE = 200;
  var ANIMATION_RATE = 3000;
  var pictures = [];

  // when ready
  $(document).ready(function() {
    
    function build_flickr_url(photo) {
      /*
        s petit carré 75x75
        q large square 150x150
        t miniature, côté le plus long de 100
        m petit, côté le plus long de 240
        n small, 320 on longest side
        - moyen, côté le plus long de 500
        z Moyen 640, côté le plus long de 640
        c moyen 800, 800 sur la longueur†
        b grand, côté le plus long de 1 024*
        o image d'origine, jpg, gif ou png selon le format source
       */
      photo.mini_url = "http://farm"+ photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_" + "s" + ".jpg";
      photo.small_url = "http://farm"+ photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_" + "q" + ".jpg";

      return photo;
      
    }

    function load_pictures(tags) {
    
      var url = "http://api.flickr.com/services/rest/?";
      $.getJSON(url, {
        tags: tags,
        tagmode: "all",
        format: "json",
        nojsoncallback: 1,
        per_page: Flickr_IMAGE_PER_PAGE,
        api_key: Flickr_API_KEY,
        safe_search: 3,
        method: "flickr.photos.search"
      })
      .success(function(data){

        pictures = data.photos.photo;
        
        // build flickr url
        $.map(pictures, function(item){ build_flickr_url(item); });
        render_pictures(pictures);

      });

    }

    function render_pictures(pictures) {
      
      $('#grid').html("");

      var top = 51;
      var total_width = 0;
      var window_width = $(window).width();

      var div_line = $("<div>").attr("class", "line");
      $('#grid').append(div_line);

      $.each(pictures, function(i, photo) {
        
        if(photo && photo[Flickr_SIZE]) {
          var div = $("<div>").attr("class", "picture").css("position", "fixed").css("top", top + "px").css("left", total_width);
          var link = $("<a>").attr("href", photo[Flickr_SIZE]).attr("target", "_blank");
          var img = $("<img>").attr("src", photo[Flickr_SIZE]).attr("target", "_blank");

          link.append(img);
          var html = div.append(link);

          div_line.append(html);

          //console.log(img.width());
          //console.log(img.height());
          total_width += img.width();

          if(total_width > window_width) {
            top += img.height();
            total_width = 0;
            div_line = $("<div>").attr("class", "line");
            $('#grid').append(div_line);
          }
        } 
      });

    }

    function move_pictures() {

      var lines = $('.line');
      var pic_by_lines = $(lines[0]).children('.picture').length;
      //console.log(pic_by_lines.length);

      // put first to last
      var removed = pictures[0];
      pictures.splice(0, 1);
      pictures.push(removed);

      //rotate all first pics 
      $.each(pictures, function (i, picture){ 

        if(i % (2 * pic_by_lines) === 0) {
          
          //push to new place
          if(i > 0) {
            //console.log(i);

            removed = pictures[i - 1];
            pictures.splice(i - 1, 1);
            //console.log(removed);
            pictures.splice(i - pic_by_lines - 1, 0, removed);
          }

        }

      }); 

    }

    // load default tags picture on app launch
    load_pictures(DEFAULT_TAGS);

    // animate
    function animate_pictures() {
    
      move_pictures();
      render_pictures(pictures);

    }

    setInterval(animate_pictures, ANIMATION_RATE);

    // launch search on click 
    $('#search').click(function(event) { 
      // disable page reload on submit
      event.preventDefault();

      var tags = $('#tags').val() || DEFAULT_TAGS;
      load_pictures(tags);
     
    });

    // re-render with specific mini size
    $('#set-mini-size').click(function(event) { 

      Flickr_SIZE = "mini_url";
      render_pictures(pictures);

    });

    // re-render with specific small size
    $('#set-small-size').click(function(event) { 

      Flickr_SIZE = "small_url";
      render_pictures(pictures);

    });

  });

})(this);
