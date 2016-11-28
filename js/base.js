/* Desarrollo: David Ruiz @2016__________________________ */

'use strict';
/*global labTools */
/*global Modernizr */
/*global Waypoint */
/*global $ */
/*global EDI */
/*global YT */


/*global dataCalc */

// Objeto principal
// -----------------------------------------------------------------------------------

var atnls = {
  init: function() {
    
      // check required libraries
    if(!labTools || !labTools.url) { console.log('ERROR INICIANDO LABTOOLS'); return; }

    $(window).scrollTop(0);
      // redimensionados____________________________________________________________
    $(window).bind('orientationchange resize', throttle(atnls.handleResize, 200));

    atnls.preload(atnls.ready);

  },
  ready: function() {

    atnls.initUI();

    atnls.initUrls();

  },
          // función control de redimensionados______________________________________________________
  handleResize: function() {

    atnls.cache.winWidth = atnls.cache.$window.width();
    atnls.cache.winHeigth = atnls.cache.$window.height();

    atnls.cache.responsive = atnls.cache.winWidth < 800 ? true : false;
    atnls.cache.mini = atnls.cache.winWidth < 500 ? true : false;


    var padd = 10;
    var maxWidth = 1500;
    var breakpoint = 960;
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

    } else if(atnls.cache.winWidth > breakpoint){
      
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
    $.get(atnls.cache.baseUrl + atnls.cache.ajaxUrl, function(e){
      $('#content').html(e);
      console.log('loaded');
      ready();
    }, 'html');
  },
  initUrls: function() {

    labTools.url.data.baseUrl = '';

    labTools.url.initiate(false,
      function(target){
        console.log('nueva url: ', target);

          // manage active elements classes
        $('.url-current').removeClass('url-current');
        $('[href="' + target + '"]').addClass('url-current');
        $('.url-poly').each(function(){ var $this = $(this); if(target.indexOf($this.attr('href')) != -1 ) $this.addClass('url-active'); else $this.removeClass('url-active'); });

      },
      function(){ console.log('url changed!!'); }
    );

      // url management
    $('.url-lib').click(function(){
        // ignore if link is active
      if($(this).hasClass('url-current')) return;

      var target = $(this).attr('href');
      
      labTools.url.setUrl(target);
      
      return false;
    });

  },

  initUI: function() {

      // toggle credits page
    $('toggleCredits').click(function(){
      
      $('#credits').fadeIn(400);
      
      return false;

    });
    $('hideCredits').click(function(){
      
      $('#credits').fadeOut(400);

      return false;
    });



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
  },

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

  ajaxUrl: '/ajax/'
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
