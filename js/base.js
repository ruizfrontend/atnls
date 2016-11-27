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
    $(window).scrollTop(0);
      // redimensionados____________________________________________________________
    $(window).bind('orientationchange resize', throttle(atnls.handleResize, 200));

    atnls.initUI();

  },
          // función control de redimensionados______________________________________________________
  handleResize: function() {

    atnls.cache.winWidth = atnls.cache.$window.width();
    atnls.cache.winHeigth = atnls.cache.$window.height();

    atnls.cache.responsive = atnls.cache.winWidth < 800 ? true : false;
    atnls.cache.mini = atnls.cache.winWidth < 500 ? true : false;

    // atnls.drawSlides();

    // if((atnls.cache.winHeigth - 60) / atnls.cache.winWidth < 0.5625) { // muy horizontal
    //   $('#headVideo .video-container').css('padding-bottom', (100 *  (atnls.cache.winHeigth-60) / atnls.cache.winWidth) + '%');
    //   $('#headVideo').css({
    //       'height': (atnls.cache.winHeigth-60),
    //       'padding-bottom': 0
    //   });
    //   $('#headFoto')
    //     .css('height', ((atnls.cache.winHeigth - 60) * 0.8) )
    //     .find('img')
    //       .css({'left': 0, 'width': atnls.cache.winWidth});
    //   if(!atnls.cache.responsive) {
    //     $('#dictio .slide-container')
    //       .css('padding-bottom', (100 *  (atnls.cache.winHeigth-60) / atnls.cache.winWidth) + '%')
    //       .css('height', ((atnls.cache.winHeigth - 60) * 0.8) )
    //       .find('img')
    //         .css({'left': 0, 'width': atnls.cache.winWidth});
    //   }
    // } else {
    //   $('#headVideo .video-container').css('padding-bottom', '56.25%');
    //   $('#headVideo').css({
    //       'height': 'auto',
    //       'padding-bottom': '56.25%'
    //     });

    //   var h = (atnls.cache.winHeigth - 60) * 0.5625;
    //   h = (h < (atnls.cache.winHeigth - 60) * 0.6) ? ((atnls.cache.winHeigth - 60) * 0.6) : h;
    //   var w = h / 0.5625;
    //   w = w < atnls.cache.winWidth ? atnls.cache.winWidth : w ;

    //   $('#headFoto')
    //     .css('height', h)
    //     .find('img')
    //       .css({left: ((atnls.cache.winWidth - w) / 2), width: w});

    //   if(!atnls.cache.responsive) {
    //     $('#dictio .slide-container')
    //       .css('height', h)
    //       .find('img')
    //         .css({left: ((atnls.cache.winWidth - w) / 2), width: w});
    //   }
    // }

    // Waypoint.refreshAll();

  },

  // drawSlides: function() {
  //   var $slides = $('.slide, .slide-section-out.act');
  //
  //   $slides.each(function(){
  //
  //     var $this = $(this);
  //     var elmWidth = $this.data('slidewidth');
  //     var slideWidth = $(window).width() < 1600 ? $(window).width() : 1600;
  //     var elms = $this.find('.slide-elm').length;
  //
  //     if(elms * elmWidth > slideWidth) {
  //
  //       var elmsPage = Math.floor(slideWidth / elmWidth);
  //
  //       $this.css('width', elmsPage * elmWidth).find('.slide-inn').bxSlider({
  //         'pager': false,
  //         'slideWidth': elmsPage * elmWidth,
  //         'minSlides': elmsPage,
  //         'maxSlides': elmsPage,
  //         'infiniteLoop': false,
  //         'displaySlideQty': elmsPage,
  //         'moveSlideQty': elmsPage,
  //         'hideControlOnEnd': true,
  //         'nextText': '<i class="fa fa-angle-right"></i>',
  //         'prevText': '<i class="fa fa-angle-left"></i>'
  //       });
  //     }
  //
  //   });
  // },
  initUI: function() {

    $('toggleCredits').click(function(){
      
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
    $(window).load(function(){


      $(window).trigger('resize');

      // new Waypoint.Sticky({ element: $('#headFix')[0] });

    });
  },

  videoCache: {},

};

// Almacenamiento en general
// -----------------------------------------------------------------------------------
atnls.cache = {
  $window: $(window),

  winWidth: 0,                            // tamaños de cosas
  winHeigth: 0,

  responsive: true,
  mini: true
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
