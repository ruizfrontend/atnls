/* Desarrollo: David Ruiz @2016__________________________ */

'use strict';
/* global labTools */
/* global Modernizr */
/* global Waypoint */
/* global $ */
/* global EDI */
/* global YT */
/* global Popcorn */
/* global Cookies */
/* global projRoot */


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
  preload: function(ready) {
    $.get(projRoot + rawData.ajaxUrl, function(e){
      $('#content').html(e);
      ready();
    }, 'html');
  },

  initUrls: function() {

    labTools.url.data.baseUrl = '';

    labTools.url.initiate(false, atnls.updatePage, function(){ console.log('url changed!!'); });

      // internal links
    $('body').delegate('.url-lib', 'click', function(){
        // ignore if link is active
      if($(this).hasClass('url-current')) return false;

      var target = $(this).attr('href');
      
      labTools.url.setUrl(target);
      
      return false;
    });

  },
  initUI: function() {

    atnls.initPlayer();
    atnls.initNav();
    atnls.initVid();

  },

    // video inicial de lgm
  initVid: function() {
    var player = parseInt(Cookies.get('initVid'));

    $('#jumpInitVid').click(function(){ $('#initVid').fadeOut(400); });

    if(!player) {

      Cookies.set('initVid', 1);

      $('#initVid').show().click(function(){ atnls.video.playVideo($(this)); });
      atnls.video.launchYoutube(1, $('#initVid .vid')[0], { end: function(){ $('#initVid').fadeOut(400); }});

      setTimeout(function(){ $('#jumpInitVid').fadeIn('1000'); }, 4000);
    } else {

    }
  },

  postInitVid: function() {

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
      console.log('da')
      $('#credits').hide();
      $('#menu').fadeToggle(400);
    
      return false;
    });

    $('.hideMenu').click(function(){
      
      $('#menu').fadeOut(400);

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

      // pinta la página correspondiente (controlador lol)
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
      if(atnls.player.active && !atnls.player.active.paused()) $('#miniplayer').slideDown(400);
    }

    if (target.indexOf('/poetas') != -1) {
      $('#poetas').fadeIn(400);
    } else {
      $('#poetas').hide();
    }

    if (target.indexOf('/presentacion') != -1) {
      $('#presentacion').fadeIn(400);

      $('#presentacion').show().click(function(){ atnls.video.playVideo($(this)); });
      atnls.video.launchYoutube(1, $('#presentacion .vid')[0]);

    } else {
      $('#presentacion').hide();
    }

    if (target.indexOf('/redes') != -1) {
      $('#redes').fadeIn(400);
    } else {
      $('#redes').hide();
      // asumimos home
    }

    $('#loader').fadeOut(400);

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
    $('#openPoemas').click(atnls.player.back2Poems);
    $('#closePoemas').click(atnls.player.keepBrowsing);
    $('.plyr-list').click(function(){
      $('.bl-playlist').slideToggle();

      return false;
    });

    atnls.initShares();
  },

  initShares: function() {

    $('body')
      .delegate('.twIntent, .verso', 'click', atnls.tweetText);
    

    $('.share-poema-twitter').click(function(){

    });

    $('.share-poema-facebook').click(function(){

    });
  },

  player: {
    active: null,
    $activePoemPage: null,
    mute: true,
    miniDisplay: false,
    isVideoPlaying: false,
    audios: {},

    keepBrowsing: function() {
      labTools.url.setUrl(projRoot + 'poetas/');

      $('#miniplayer').slideDown(400);

      atnls.player.miniDisplay = true;

      return false;
    },
    back2Poems: function() {
      
      labTools.url.setUrl(projRoot + 'poemas/' + atnls.player.$activePoemPage.data('poema'));

      atnls.player.$activePoemPage.fadeIn(400);
      $('#miniplayer').slideUp(400);

      atnls.player.miniDisplay = false;

      return false;
    },

    prev: function() {

      if(!atnls.player.$activePoemPage || !atnls.player.$activePoemPage.prev()) return;

      if(!atnls.player.miniDisplay) {
        labTools.url.setUrl(projRoot + 'poemas/' + atnls.player.$activePoemPage.prev().data('poema'));
      } else {
        atnls.player.playPage(atnls.player.$activePoemPage.prev());
      }
      
      return false;

    },
    next: function() {
      if(!atnls.player.$activePoemPage || !atnls.player.$activePoemPage.next()) return;

      if(!atnls.player.miniDisplay) {
        labTools.url.setUrl(projRoot + 'poemas/' + atnls.player.$activePoemPage.next().data('poema'));
      } else {
        atnls.player.playPage(atnls.player.$activePoemPage.next());
      }
      
      return false;
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

      var poema = $page.data('poema');

      var PCaudio = atnls.player.audios[poema] ? atnls.player.audios[poema] : atnls.player.initPage($page);
      atnls.player.audios[poema] = PCaudio;

      if(atnls.player.active == PCaudio) return;

      if(!atnls.player.miniDisplay) PCaudio.currentTime(0);

        // audio reproducido previamente? Toma propiedades
      var prevAudio = atnls.player.active;
      if(prevAudio && prevAudio.muted()) {
        PCaudio.mute();
      } else {
        PCaudio.unmute();
      }

      atnls.player.stopAll();

        // save info
      atnls.player.active = PCaudio;
      atnls.player.$activePoemPage = $page;

        // autoplay
      if(!atnls.player.isVideoPlaying) PCaudio.play();

    },
    initPage: function($page) {

      var id = 'd' + Date.now();
      var $audio = $page.find('audio').attr('id', id);

      var PCaudio = Popcorn('#' + id);

      $audio.on('ended', atnls.player.next);

      var $body = $page.find('.poema-body');
      var times = $body.data('times');
      if(!times) { console.log('No hay minutado!'); return PCaudio; };

      for (var i = 0; i < times.length; i++) {
        if(i === 0) continue;

        (function(){
          
          var pos = i - 1;

          PCaudio.code({
            start: times[i-1]/1000,
            end: times[i]/1000,
            onStart: function(options) {
              var verso = $body
                .find('.act').removeClass('act').end()
                .find('.verso:eq(' + pos + ')').addClass('act');

              $('#miniplayer .bl-player-current-inn').text(verso.text());
            },
            // onEnd: function( options ) {
            //  console.log(pos + ' end');
            // }
          });

        })();

      }

      return PCaudio;

    },
    toggleMute: function() {

      if(!atnls.player.active) return;

      if(atnls.player.active.muted()) {
        atnls.player.active.unmute();
        Cookies.set('muted', 0);
      } else {
        atnls.player.active.mute();
        Cookies.set('muted', 1);
      }
      return false;
    }
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
  video: {
    launchYoutube: function(i, elm, opts) {
      var $wrap = $(elm);

      var videoData = $wrap.data();
      var videoID = videoData.video;
      var videoLoop = videoData.loop;
      var videoAutoplay = videoData.autoplay;
      var videoBackground = videoData.playbackground;
      var videomuted = videoData.muted;
      var controls = videoData.controls;

      var id = 'player-' + parseInt(1000 * Math.random()).toString();

      if(Modernizr.touch) {
        $wrap.html('')
          .unbind('click')
          .prepend('<iframe id="'+id+'" width="560" height="315" src="https://www.youtube.com/embed/'+videoID+'?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>');
        return;
      }

      if(!$wrap.find('iframe').length) {

        $wrap.prepend('<div id="'+id+'"></div>');

        var settings = {
          autoplay: videoAutoplay,
          controls: controls ? controls : 0,
          loop: videoLoop,

          showinfo: 0,
          modestbranding: 0,
          playsinline: 1,
          rel: 0,
        };

        if(videoBackground) $wrap.addClass('background');

        atnls.videoCache[id] = new YT.Player(id, {
          videoId: videoID,
          playerVars: settings,
          events: {
            onReady: function(event){
            },
            onStateChange: function(event){
              switch(event.data){
                case 0: // fin
                  if(opts && opts.end) opts.end();
                case 2: // pause
                  $wrap.removeClass('playing');
                  $wrap.find('.poster').fadeIn(200);
                  atnls.player.isVideoPlaying = false;
                break;
                case 1: // play
                  atnls.video.stopAll(id);
                  $wrap.addClass('playing');
                  $wrap.find('.poster').fadeOut(600);
                  atnls.player.isVideoPlaying = true;
                break;
              }
            },
            onError: function(){
              $wrap.removeClass('playing');
              $wrap.find('.poster').show();
            },
            onApiChange: function(){
              $wrap.removeClass('playing');
              $wrap.find('.poster').show();
            }
          }
        });

      } else {
        if($wrap.hasClass('playing')) return;
        atnls.videoCache[$wrap.find('iframe').attr('id')].playVideo();
      }

    },
    playVideo: function($iframe) {
      var id = $iframe.attr('id');
      if(!id) return;
      if(!atnls.videoCache[id] || !atnls.videoCache[id].playVideo) return;
      atnls.videoCache[id].playVideo();
    },
    stopAll: function(except) {
      for (var key in atnls.videoCache) {
        if(except && key == except) return;
        if (atnls.videoCache.hasOwnProperty(key)) {
          if(atnls.videoCache[key].stopVideo) atnls.videoCache[key].stopVideo();
        }
      }
    },
    stopVideo: function($iframe) {
      var id = $iframe.attr('id');
      if(!id || !atnls.videoCache[id]) { console.log('video no encontrado'); return; }
      atnls.videoCache[id].stopVideo();
    },
    pauseSection: function(wrap) {
      $(wrap).find('.playing iframe').each(function(){ atnls.video.stopVideo($(this)); });
    }
  },

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

  baseUrl: projRoot,

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
