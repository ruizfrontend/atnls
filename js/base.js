/* Desarrollo: David Ruiz @2016__________________________ */

'use strict';
/*global labTools */
/*global Modernizr */
/*global Waypoint */
/*global $ */
/*global EDI */
/*global YT */
/*global Popcorn */


/*global dataCalc */

// Objeto principal
// -----------------------------------------------------------------------------------

var atnls = {
  init: function() {
    
      // check required libraries
    if(!labTools || !labTools.url) { console.log('ERROR INICIANDO LABTOOLS'); return; }

    $(window).scrollTop(0);

    atnls.preload(atnls.ready);

  },
  ready: function() {

      // redimensionados____________________________________________________________
    $(window).bind('orientationchange resize', throttle(atnls.handleResize, 200)).resize();

    atnls.initUrls();

    atnls.initUI();
  },
          // función control de redimensionados______________________________________________________
  handleResize: function() {

    atnls.cache.winWidth = atnls.cache.$window.width();
    atnls.cache.winHeigth = atnls.cache.$window.height();

    atnls.cache.responsive = atnls.cache.winWidth < 800 ? true : false;
    atnls.cache.mini = atnls.cache.winWidth < 500 ? true : false;



    var padd = 10;
    var maxWidth = 1500;
    var proportion = 0.67; //9 / 16; // 3 / 4; 
    var w, h, top;

    if(atnls.cache.winWidth > maxWidth) {
      
      w = maxWidth;
      h = maxWidth * proportion;
      top = (atnls.cache.winHeigth - h) / 2;

      atnls.cache.$canvas.css({
        'left': (atnls.cache.winWidth - w) / 2,
        'top': top > 0 ? top : 0,
        'width': w,
        'height': h
      });

    } else if(atnls.cache.winWidth > atnls.cache.breakpoint){
      
      w = atnls.cache.winWidth - (2 * padd);
      h = (w * proportion);
      top = (atnls.cache.winHeigth - h) / 2;

      atnls.cache.$canvas.css({
        'left': padd,
        'top': top > 0 ? top : 0,
        'width': w,
        'height': h
      });
    } else {

      atnls.cache.$canvas.css({
        'left': 0,
        'top': 0,
        'width': atnls.cache.winWidth,
        'height': atnls.cache.winHeigth
      });

    }
  },

  preload: function(ready) {
    $.get(projRoot + rawData.ajaxUrl, function(e){
      $('#content').html(e);
      ready();
    }, 'html');
  },
  initUrls: function() {

    labTools.url.data.baseUrl = '';

    labTools.url.initiate(false, atnls.updatePage, function(){ console.log('url changed!!'); });

      // url management
    $('.url-lib').click(function(){
        // ignore if link is active
      if($(this).hasClass('url-current')) return false;

      var target = $(this).attr('href');
      
      labTools.url.setUrl(target);
      
      return false;
    });

  },

  updatePage: function(target) {
    
    console.log('nueva url: ', target);

      // manage active elements classes
    $('.url-current').removeClass('url-current');
    $('[href="' + target + '"]').addClass('url-current');
    $('.url-poly').each(function(){
      var $this = $(this);
      if(target.indexOf($this.attr('href')) != -1 ) {
        $this.addClass('url-active');
      } else {
        $this.removeClass('url-active');
      }
    });

    $('#credits, #menu').fadeOut(400);

      // pinta la página correspondiente
    if(target.indexOf('/poemas') != -1) {

      $('#poemas').fadeIn(400);

      var found = false;
      $('#poemas .page-poema').each(function(){
        
        var $this = $(this);

        if(target.indexOf($this.data('poema')) != -1) {
          $this.fadeIn(400).addClass('act');
          atnls.player.playPage($this);
          found = true;

          var $elm = $this;
          setTimeout(function(){
            var height = $elm.height();
            var pHeight = $('.col-poemas').height();
            if(height > pHeight) {
              $elm.find('.scrool-wrap').slimScroll({ height: pHeight });
            }
          }, 100);

        } else {
          $this.removeClass('act').hide();

        }
      });

      if(!found) {
        $('.bl-playlist').fadeIn(400);
      } else {
        $('.bl-playlist').hide();
      }

    } else {
      $('#poemas').hide();
    }

    if (target.indexOf('/poetas') != -1) {
      $('#poetas').fadeIn(400);
    } else {
      $('#poetas').hide();
    }

    if (target.indexOf('/redes') != -1) {
      $('#redes').fadeIn(400);
    } else {
      $('#redes').hide();
      // asumimos home
    }

    $('#loader').fadeOut(400);

  },

  initUI: function() {

    atnls.initPlayer();
    atnls.initNav();

    $('body')
      .delegate('.twIntent, .verso', 'click', atnls.tweetText);
    

    $('.share-poema-twitter').click(function(){

    });

    $('.share-poema-facebook').click(function(){

    });
  },

  initNav: function() {

      // toggle credits page
    $('.toggleCredits').click(function(){
      
      $('#menu').hide();
      $('#credits').fadeToggle(400);
    
      return false;
    });

    $('.hideCredits').click(function(){
      
      $('#credits').fadeOut(400);

      return false;
    });


      // toggle menu
    $('.showMenu').click(function(){
      
      $('#credits').hide();
      $('#menu').fadeToggle(400);
    
      return false;
    });

    $('.hideMenu').click(function(){
      
      $('#menu').fadeOut(400);

      return false;
    });
  },

  tweetText: function(e) {
    var $text = $(this);
    var text = $text.data('text') ? $text.data('text') : $text.text() ? $text.text() : null;
    if(!text) return;

    atnls.openTweet(text);
  },

  openTweet: function(texto, url) {
    if(!texto) return;

    var windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
        width = 550,
        height = 420,
        winHeight = screen.height,
        winWidth = screen.width;

    var left = Math.round((winWidth / 2) - (width / 2));
    var top = 0;

    if (winHeight > height) {
      top = Math.round((winHeight / 2) - (height / 2));
    }

    var target = 'https://twitter.com/intent/tweet?text=' + texto + '&url=' + (url ? url : encodeURIComponent(window.location.href));
    if(rawData.hash) {
      target += '&hashtags=' + rawData.hash;
    } else if (atnls.cache.hash) {
      target += '&hashtags=' + atnls.cache.hash;
    }
    if(atnls.cache.via) target += '&via=' + atnls.cache.via;

    window.open(target, 'intent', windowOptions + ',width=' + width +
                                       ',height=' + height + ',left=' + left + ',top=' + top);
  },

  initPlayer: function() {
    $('.plyr-prev').click(atnls.player.prev);
    $('.plyr-play').click(atnls.player.togglePlay);
    $('.plyr-next').click(atnls.player.next);
    $('.plyr-mute').click(atnls.player.toggleMute);
    $('.plyr-list').click(function(){
      $('.bl-playlist').slideToggle();

      return false;
    });
  },

  player: {
    active: null,
    activePage: null,
    mute: true,
    miniDisplay: false,

    prev: function() {

    },
    next: function() {
      if(!atnls.player.active) return;

    },
    togglePlay: function() {
      if(!atnls.player.active) return false;

      if(atnls.player.active.paused()) {
        atnls.player.active.play();
      } else {
        atnls.player.active.pause();
      }
      
      return false;
    },

    initAudio: function() {

    },
    stopAll: function() {
      $('audio, video').each(function(){ this.pause(); });
      atnls.player.active = null;

      return false;
    },
    playPage: function($page) {

        // si el widget está activado, el comportamiento cambia
      if(atnls.player.miniDisplay) {

        atnls.player.miniDisplay = false;
        return;
      }

        // 
      atnls.player.stopAll();

      var $body = $page.find('.poema-body');
      var times = $body.data('times');

      var id = 'd' + Date.now();
      var $audio = $page.find('audio').attr('id', id);

      var prevAudio = atnls.player.active;

      atnls.player.active = Popcorn('#' + id);
      atnls.player.activePage = $page;

      if(prevAudio && prevAudio.muted()) atnls.player.active.mute();

      $audio[0].play();

      if(!times) return;

      for (var i = 0; i < times.length; i++) {
        if(i === 0) continue;

        (function(){
          
          var pos = i - 1;

          atnls.player.active.code({
            start: times[i-1]/1000,
            end: times[i]/1000,
            onStart: function(options) {
              $body
                .find('.act').removeClass('act').end()
                .find('.verso:eq(' + pos + ')').addClass('act');
            },
            // onEnd: function( options ) {
            //  console.log(pos + ' end');
            // }
          });

        })();

      }
    },
    toggleMute: function() {
      console.log(atnls.player.active);
      if(!atnls.player.active) return;

      if(atnls.player.active.muted()) {
        atnls.player.active.unmute();
      } else {
        atnls.player.active.mute();
      }
      return false;
    }
  },



      // imagenes responsibe
    // if(!atnls.cache.mini) {
    //   $('.wrap-graph img').each(function(){
    //     var $this = $(this);
    //     var img = $this.attr('src', $this.data('imgbig') );
    //   });
    // }
    // atnls.initIframe();

    // if(mapp) mapp.init();
    
    // atnls.drawSlides();

    // $('.closefooter').click(function(){ $('.footer').slideUp(400); return false; });

    // $('p').selectionSharer();

    // $('#toggleMenu').click(function(){ $('html, body').animate({ scrollTop: $('#footer-grid').offset().top - 60 }, 500);; return false; });

    // if(!atnls.cache.responsive) atnls.gl.init();

      // esperamos hasta que la página está cargada al 100% para inicializar todo el tema waypoints
    // $(window).load(function(){


    //   $(window).trigger('resize');

    //   // new Waypoint.Sticky({ element: $('#headFix')[0] });

    // });

  videoCache: {},

};

// Almacenamiento en general
// -----------------------------------------------------------------------------------
atnls.cache = {
  $window: $(window),
  $canvas: $('#webdoc'),

  winWidth: 0,                            // tamaños de cosas
  winHeigth: 0,

  responsive: true,
  mini: true,

  baseUrl: '/atnls',

  ajaxUrl: '/ajax/',

  breakpoint: 980, // swithchs from canvas layout to full

  hash: 'atnls',
  via: 'ruizfrontend',
};


// DOCUMENT READY
// ----------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------

$(atnls.init);


// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function throttle (callback, limit) {   // http://sampsonblog.com/749/simple-throttle-function modificado!
    var wait = false;                 // Initially, we're not waiting
    return function () {              // We return a throttled function
        if (!wait) {                  // If we're not waiting
                                       // Execute users function
            wait = true;              // Prevent future invocations
            setTimeout(function () {  // After a period of time
                callback.call();
                wait = false;         // And allow future invocations
            }, limit);
        }
    }
}
function numberWithCommas(num) {
  var x = num.toString().split(',');
  var out = x[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if(x[1]) out += ',' + x[1]
  return out;
}
