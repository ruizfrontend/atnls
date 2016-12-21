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
/* global rawData */
/* global Hammer */


/*global dataCalc */

// Objeto principal
// -----------------------------------------------------------------------------------

var atnls = {
  init: function() {
    
      // check required libraries
    if(!labTools || !labTools.url || !labTools.media) { console.log('ERROR INICIANDO LABTOOLS'); return; }

    $(window).bind('orientationchange resize', throttle(atnls.handleResize, 200)).resize();

    $(window).scrollTop(0);

      // carga y pinta el html real
    $.get(projRoot + rawData.ajaxUrl, function(e){
      var $body = $(e);
      
      if(atnls.cache.responsive) {
        $body.find('#compo').remove();
      } else {
        $body.find('#compoMobile').remove();
      }

      $('#content').replaceWith($body);

      atnls.ready();

    }, 'html');

  },

  ready: function() {

      // redimensionados____________________________________________________________
    $(window).resize();

    atnls.initUrls();
    atnls.initRedes();

    atnls.initPlayer();

    atnls.initNav();
    atnls.initVid();

    atnls.initMedia();

    atnls.initKeys();

    atnls.initShares();

    if(!atnls.cache.responsive) {
      atnls.initIllus();
    }

    setTimeout(function(){ $('body').addClass('pageReady'); }, 1000);

      // calcula tiempos de poemas
    // atnls.timeMeter();

  },

  initMedia: function() {

    labTools.media.init();

    $('body').delegate('.video-lnk', 'click', function(){

      var $this = $(this);
      var data = $this.data();

      if(!data.video) return false;

      labTools.media.videosWipeOut();

      atnls.player.pause();

      $('#menu, #pop').fadeOut(400);

      labTools.media.generaVideo($('#player .vrap'), data.video, {
        title: $this.attr('title') ? $this.attr('title') : null,
        controls: data.controls ? data.controls : true,
        muted: data.muted ? data.muted : false,
        autoplay: data.autoplay ? data.autoplay : true,
        endCallback: function(){
          if(data.postluis) {
            
            $('#player .wk-valign-cont').html('<div class="vrap"><p style="width: 100%; max-width: 300px; display: block; margin: 0 auto;">Rellena el siguiente formulario y recibirás un libro electrónico con una selección de poemas de Luis García Montero y el resto de autores que han participado en este documental.</p><div><label for="mail">Correo:</label><input id="mail" type="text" placeholder/><input id="submit" type="submit" class="btn btn-red" value="enviar" /></div></div>');

          } else if(data.postvideo) {
            
            $('#player .wk-valign-cont').html('<div class="vrap"><h4>¿Te ha gustado el poema?<br>El propio Luis te explica su significado.</h4><h4><div><a href="#" data-video="' + data.postvideo + '" class="btn video-lnk">Ver contenido</a><a href="#" title="Volver" class="btn closePlayer2 btn-red">Volver a la Home</a></div></h4></div>');

          } else {
            $('#player').fadeOut(400, function(){
              labTools.media.videosWipeOut();
            });
          }
        }
      });

      $('#player').fadeIn(400);

      return false;
    });

  },

  initKeys: function() {
    $(document).keydown(function(e) {
      switch(e.which) {
      case 27: // scape

        if($('#jumpInitVid:visible').length) return;

        if($('#menu:visible').length) {
          $('#menu').fadeOut(400);

        } else if($('#credits:visible').length) {
          $('#credits').fadeToggle(400);

        } else if($('#player:visible').length) {
          $('#player').fadeToggle(400);
          labTools.media.videosWipeOut();
        } else if($('#pop:visible').length) {
          $('#pop').fadeOut(400);

        } else {
          labTools.url.setUrl(projRoot);
        }

        atnls.handleResize();

        break;
      case 32: // space
        break;
      case 37: // left
      case 38: // up
      case 39: // right
      case 40: // down
        break;
      default:
        return;
      }
      e.preventDefault();
      return false;
    });
    
  },

  initShares: function() {

    $('body')
      .delegate('.twIntent, .verso, .bl-player-current-inn', 'click', atnls.tweetText);
    

    $('.share-poema-twitter').click(function(){
      var act = $('#poemas .bl-playlist .act');
      if(act.length) {
        atnls.openTweet('La voz de Luis García Montero: ' + act.html());
      } else {
        atnls.openTweet('La voz de Luis García Montero: selección de poemas leídos por el autor');
      }
      
    });

    $('.share-poema-facebook').click(function(){
      var target = $(this).data(target);
      target = target ? target : window.location.href;
      atnls.openFacebook(window.location.href);
    });
  },

  initRedes: function() {

    $.getJSON(projRoot + rawData.ajaxRedes, function(e){

      var $wrap = $('.col-redes-main');
      $wrap.append('<div class="col-redes-col">');
      if(atnls.cache.winWidth > 800) $wrap.append('<div class="col-redes-col">');
      if(atnls.cache.winWidth > 1200) $wrap.append('<div class="col-redes-col">');

      var cols = $('.col-redes-col').length;
      $wrap.addClass('col-redes-' + cols);

      for (var i = e.length - 1; i >= 0; i--) {
        var target = i % cols;
        $('.col-redes-col:eq(' + target + ')').append(atnls.parseRedesElm(e[i]));
      }

    });

  },

  parseRedesElm: function(elm) {
    
    var $elm = $('<div class="socialElm">');

    if(elm.tweetId) {

      var url = 'https://twitter.com/Digiday/status/' + elm.tweetId;

      if(elm.img) $elm.append('<a target="_blank" href="' + url + '"><img src="' + elm.img + '"></a>');

      var usr = '<a href="https://twitter.com/' + elm.usrName + '" title="visita el perfil del usuario" target="_blank">@' + elm.usr + ':</a> ';

      var text = elm.texto.replace(/#(\S*)/g,'<a href="http://twitter.com/#!/search/$1" title="Ver todos los tweets con el hashtag" target="_blank">#$1</a>');

      var $text = $('<div class="socialEBody">').append(usr).append(text);

      $elm.append($text);

      return $elm;
    } else {
      // otros formatos => por ahora nada
    }
  },

  initUrls: function() {

    labTools.url.data.baseUrl = '';

    labTools.url.initiate(null, atnls.updatePage, function(){
      // console.log('url changed!!');
    });

      // internal links
    $('body').delegate('.url-lib', 'click', function(){

        // ignore if link is active
      // if($(this).hasClass('url-current')) return false;

      var target = $(this).attr('href');
      
      labTools.url.setUrl(target);
      
      return false;
    });

  },

  increaseLuis: function() {
    var luis = parseInt($('#luis').data('luis'));
    
    if(luis > 6) return false;

    setTimeout(function(){
      $('#luis').data('luis', luis + 1).addClass('luis' + luis);
    }, 600);
  },

  initIllus: function() {

    $('#escandar').hover(function(){
      
      $('#escandar-text').delay(400).stop(true,false)
        .find('img').css('width', $('#escandar-text').width()).end()
        .find('.wrp').css('width', 0).animate({'width': '100%'}, 1200).end()
        .show();

    }, function(){

      $('#escandar-text').stop(true,false).hide();
      $('#escandar-text img').stop(true,false).css('width', '100%');
      $('#escandar-text .wrp').stop(true,false).css('width', 0);
    
    });
    
    $('#guille').hover(function(){
      
      $('#guille-text').delay(400).stop(true,false)
        .find('img').css('width', $('#guille-text').width()).end()
        .find('.wrp').css('width', 0).animate({'width': '100%'}, 1200).end()
        .show();

      $('#guille-fill2').delay(1000).stop(true,false)
        .find('img').css('width', $('#guille-fill2').width()).css('top', -1 * $('#guille-fill2').height()).delay(1000).animate({'top': 0}, 1200).end()
        .find('.wrp').css('height', 0).delay(1000).animate({'height': $('#guille-fill2').height()}, 1200).end()
        .show();

    }, function(){
      $('#guille-fill2').stop(true,false).hide();
      $('#guille-fill2 .wrp').stop(true,false).css('height', 0);
      $('#guille-fill2 img').stop(true,false).css('top', '-100%');

      $('#guille-text').stop(true,false).hide();
      $('#guille-text img').stop(true,false).css('width', '100%');
      $('#guille-text .wrp').stop(true,false).css('width', 0);
    
    });


    $('#carlos').hover(function(){
      
      $('#carlos-fill2').delay(400).stop(true,false)
        .find('img').css('width', $('#carlos-fill2').width()).css('top', -1 * $('#carlos-fill2').height()).animate({'top': 0}, 1200).end()
        .find('.wrp').css('height', 0).animate({'height': $('#carlos-fill2').height()}, 1200).end()
        .show();

    }, function(){
      $('#carlos-fill2').stop(true,false).hide();
      $('#carlos-fill2 .wrp').stop(true,false).css('height', 0);
      $('#carlos-fill2 img').stop(true,false).css('top', 0);
    });


    $('#marwan').hover(function(){
      
      $('#marwan-text').delay(400).stop(true,false)
        .find('img').css('width', $('#marwan-text').width()).end()
        .find('.wrp').css('width', 0).animate({'width': '100%'}, 1200).end()
        .show();

    }, function(){
      $('#marwan-text').stop(true,false).hide();
      $('#marwan-text img').stop(true,false).css('width', '100%');
      $('#marwan-text .wrp').stop(true,false).css('width', 0);

    });


    $('#elvira').hover(function(){
      
      $('#elvira-text').delay(400).stop(true,false)
        .find('img').css('width', $('#elvira-text').width()).end()
        .find('.wrp').css('width', 0).animate({'width': '100%'}, 1200).end()
        .show();

    }, function(){
      $('#elvira-text').stop(true,false).hide();
      $('#elvira-text img').stop(true,false).css('width', '100%');
      $('#elvira-text .wrp').stop(true,false).css('width', 0);
    
    });
  },

    // video inicial de lgm
  initVid: function() {

    var player = parseInt(Cookies.get('initVid'));

    if(window.location.pathname == projRoot || !player || window.location.hash.indexOf('noJump') != -1) {

      atnls.cache.presentacion = true;

      Cookies.set('initVid', 1);

      $('#initVid').show();

      var $vid = $('#initVid video');
      
      $vid.ready(function(){

        var vidWidth = $vid.width();
        var time = $vid[0].duration;
        var initLeft = 0;
        var wrapLeft = $('#initVidMain').offset().left;
        
        var swipe = false;
        
        var hammertime = new Hammer($('#initVid')[0]);
        hammertime.on('swipe', function(ev) {
          if(swipe) return;

          $vid[0].play();
          swipe = true;
          $('#arrastra, #swipeIcon').addClass('go').fadeOut(400);
        });

        hammertime.on('pan', function(ev) {
          if(swipe) return;
          var avance = (ev.srcEvent.clientX - wrapLeft) / vidWidth; // ev.deltaX / vidWidth;
          if(avance > 0.14) {
            $('#arrastra').fadeOut(400);
          }
          if(avance > 0.5) {
            swipe = true;
            $vid[0].play();
            $('#swipeIcon').addClass('go').fadeOut(400);
            return;
          }
          $vid[0].currentTime = time * avance;
          $('#swipeIcon').css('left', (100 * avance) + '%');
        });

            // termina el video inicial
        $vid.on('ended', function(){

          $('#initvidsub').animate({opacity: 1}, 400, function(){

            $(this).addClass('end');

            setTimeout(function() { $('#initvidLogos').animate({opacity: 1}, 600); }, 1000);
            setTimeout(function() { $('#in').animate({opacity: 1}, 600); }, 1400);

              // click para comenzar
            $('#initVidMain, #in').click(function() {

                  // elimina intro
              $('#initVid').fadeOut(400);

              atnls.cache.presentacion = false; // damos por terminada la presentación

                  // carga video
              $('#player').fadeIn(400);
            
              labTools.media.generaVideo($('#player .vrap'), 'http://video.lab.rtve.es/resources/TE_NGVA/mp4/2013/jfk/intro-Kennedy', {
                title: 'Presentación de Luis García Montero',
                controls: true,
                muted: false,
                autoplay: true,
                endCallback: function(){

                  $('#player').fadeOut(400);

                  labTools.media.videosWipeOut();

                  $('#pop').find('.wk-valign-cont-inn')
                    .html('<h4>Para acceder a la tertulia final desbloquea a los 5 poetas jóvenes accediendo a sus fichas. <br />Al finalizar el webdoc obtendrás una selección de poemas de los autores como obsequio.<h4><div><a href="#" class="btn closePop2 btn-red">Comenzar</a></div>')
                    .end()
                    .fadeIn(400);

                }
              });

            });
          });
        });

      });

    } else {

    }
  },

  initNav: function() {

      // toggle credits page
    $('.toggleCredits').click(function(){
      
      $('#menu').fadeOut(400);
      $('#credits').fadeToggle(400);

      atnls.handleResize();
    
      return false;
    });

    $('.hideCredits').click(function(){
      
      $('#credits').fadeOut(400);

      return false;
    });

    $('body').delegate('#submit', 'click', function(){
      
      console.log($('#mail').val());
      $(this).parent().parent().html('<p>Enhorabuena. Pronto recibirás tu poemario en tu correo.</p>');
      return false;
    });


      // toggle menu
    $('.showMenu').click(function(){

      $('#credits').fadeOut(400);
      $('#menu').fadeToggle(400);
    
      return false;
    });

    $('.hideMenu').click(function(e){

      $('#menu').fadeOut(400);

      return false;
    });

    $('body').delegate('.closePop, .closePop2', 'click', function(){
      $('#pop').fadeOut(400);

      return false;
    });

    $('.closePlayer, .closePlayer2, #player .plyr-list').click(function(e) {
      labTools.media.videosWipeOut();
      $('#player').fadeOut(400);
    });

    $('.showPresentacion').click(function(){

      $('#credits, #menu').fadeOut(400);
      $('#player').fadeIn(400);
    
      labTools.media.generaVideo($('#player .vrap'), 'http://video.lab.rtve.es/resources/TE_NGVA/mp4/2013/jfk/intro-Kennedy', {
        title: 'Presentación de Luis García Montero',
        controls: true,
        muted: false,
        autoplay: true
      });

      return false;
    });

    $('.poeta-col-l a').on('mousemove', atnls.thrtleMove);

  },
  thrtleMoveSemaforo: null,
  thrtleMove: function(e) {
    
    if(atnls.thrtleMoveSemaforo) return;

    atnls.thrtleMoveSemaforo = setTimeout(function(){
      atnls.thrtleMoveSemaforo = false;
    }, 500);

    var $this = $(this);
    var w = $this.width();
    var h = $this.height();
    var pleft = (e.offsetX * 100 / w);
    var ptop = (e.offsetY * 100 / h);
    
    $this.find('.imgTXT').css({
      '-moz-transform-origin': pleft + '% ' + ptop + '% ',
      '-ms-transform-origin': pleft + '% ' + ptop + '% ',
      '-webkit-transform-origin': pleft + '% ' + ptop + '% ',
      'transform-origin': pleft + '% ' + ptop + '% '
    }).end()
    .find('.big-play img').css({left: (-1 * ptop / 20) + '%', top: (-1 * pleft / 20) + '%'});
  },

    // funcion llamada ante cualquier cambio de url
  updatePage: function(target) {
    
    target = target ? target : '';
    console.log('nueva url: ', target);

      // elimina otras cosis
    $('#credits, #menu, #player').fadeOut(400);
    labTools.media.videosWipeOut();

    var foundGlobal = false;

      // pinta la página correspondiente (controlador lol)
    if(target.indexOf('/poemas') != -1) {

      foundGlobal = true;

      $('#poemas').addClass('act');

      var found = false;
      $('#poemas .page-poema').each(function(){
        
        var $this = $(this);

          // checkea la url con la de cada páginas de poemas
        if(target.indexOf($this.data('poema')) != -1) {

          $this.fadeIn(400).addClass('act');

          $('.bl-playlist').find('.act').removeClass('act').end()
            .find('[href*="' + $this.data('poema') + '"]').addClass('act');

          atnls.player.playPage($this);
          found = true;

        } else {
          $this.removeClass('act').hide();
          atnls.player.pausePage($this);
        }

      });

      if(!found) {
        $('.bl-helpPlayer').fadeIn(400);
        atnls.player.stop();
      } else {
        $('.bl-helpPlayer').hide();
      }

      atnls.player.miniDisplay = false;

    } else {
      $('#poemas').removeClass('act');
      atnls.player.miniDisplay = true;
      
    }

    if (target.indexOf('/redes') != -1) {
      
      foundGlobal = true;

      $('#redes').addClass('act');
      atnls.handleResize();
        
    } else {
      $('#redes').removeClass('act');
      // asumimos home
    }


      // como la url es la raiz no podemos buscar la url de poetas
    if (!foundGlobal) {

      var found = false;
      $('#poetas .page-poeta').each(function(){
        
        var $this = $(this);

          // checkea la url con la de cada páginas de poemas
        if(target.indexOf($this.data('poeta')) != -1) {

            // si es la página de Luis
          if(target.indexOf('luis-garcia-montero') != -1) {
            
            if($('#luis').data('luis') < 6) {

                // pero aún está bloqueado
              $('#pop').find('.wk-valign-cont-inn')
                .html('<h4>Aún no has conocido a los poetas que integran la tertulia. Te animamos a seguir conociéndolos.<h4><div><a href="#" class="btn closePop2 btn-red">Seguir conociéndolos</a><a href="#" title="Tertulia de la nueva poesía" data-postluis="1" data-video="http://video.lab.rtve.es/resources/TE_NGVA/mp4/2013/jfk/intro-Kennedy" class="btn video-lnk">Ir a la tertulia</a></div>')
                .end()
                .fadeIn(400);

                // unbloqued
              } else {

                labTools.media.generaVideo($('#player .vrap'), 'http://video.lab.rtve.es/resources/TE_NGVA/mp4/2013/jfk/intro-Kennedy', {
                  title: 'Tertulia de la nueva poesía',
                  controls: true,
                  muted: false,
                  autoplay: true,
                  endCallback: function(){

                    $('#player .wk-valign-cont').html('<div class="vrap"><p style="width: 100%; max-width: 300px; display: block; margin: 0 auto;">Rellena el siguiente formulario y recibirás un libro electrónico con una selección de poemas de Luis García Montero y el resto de autores que han participado en este documental.</p><div><label for="mail">Correo:</label><input id="mail" type="text" placeholder/><input id="submit" type="submit" class="btn btn-red" value="enviar" /></div></div>');

                  }
                });
                
                $('#player').fadeIn(400);

              }

            // resto de casos
          } else {

            var $prefoto = $this.find('.preFoto');
            if($prefoto.length) {
              $prefoto.each(function(){
                var $prefoto = $(this);
                $prefoto.html('<img src="' + $prefoto.data('src') + '">').removeClass('preFoto');
              });
            }

            if(atnls.cache.initialLoad) {
              $this.show().addClass('act');
            } else {
              $this.fadeIn(400).addClass('act');
            }
            
            found = true;

          }

        } else {

            // si tiene clase act es la página anterior => marcomos como visto e incrementamos luis
          if($this.hasClass('act')) {
            
            $this.removeClass('act').fadeOut(500);

            if(!$this.hasClass('viewed')) {
              $this.addClass('viewed');
              setTimeout(function(){
                $('#compo [href*="' + $this.data('poeta') + '"]').addClass('viewed');
              }, 500);

              if($this.data('poeta') != 'luis-garcia-montero') atnls.increaseLuis();

            }
          }

        }
      });

          // no hay poeta => página principal
      if(!found) {
        if(atnls.cache.initialLoad) {
          $('#poetas').show();
          if(atnls.cache.responsive) $('#compoMobile, #webdoc > .wrap > .head').show();
        } else {
          $('#poetas').fadeIn(400);
          if(atnls.cache.responsive) $('#compoMobile, #webdoc > .wrap > .head').fadeIn(400);
        }

          // poeta encontrado => página de poeta
      } else {
        $('#poetas').show();
        if(atnls.cache.responsive) $('#compoMobile, #webdoc > .wrap > .head').fadeOut(400);
      }

    } else {

        // en mobile eliminamos todo el bloque, en dsktop queda de fondo
      if(atnls.cache.responsive) $('#compoMobile, #poetas, #webdoc > .wrap > .head').fadeOut(400);
    }

    $('#loader').fadeOut(400);

    if(atnls.cache.responsive) $(window).add('#webdoc').scrollTop(0);

    atnls.cache.initialLoad = false; // marca la primera carga de la página

  },

  tweetText: function(e) {
    var $text = $(this);
    var text = $text.data('text') ? $text.data('text') : $text.html() ? $text.html() : null;
    if(!text) return false;

    atnls.openTweet(text.replace(/<br>/g, ' '));
  },

  openTweet: function(texto, url) {
    if(!texto) return false;

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
  openFacebook: function(url) {

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

    var target = 'https://www.facebook.com/sharer/sharer.php?app_id=435567026494540&u=' + url
    window.open(target, 'intent', windowOptions + ',width=' + width +
                                       ',height=' + height + ',left=' + left + ',top=' + top);

  },

  initPlayer: function() {
    $('#miniplayer, .col-player')
      .find('.plyr-prev').click(atnls.player.prev).end()
      .find('.plyr-play').click(atnls.player.togglePlay).end()
      .find('.plyr-next').click(atnls.player.next).end()
    // $('.plyr-mute').click(atnls.player.toggleMute);
      .find('.bl-timer').click(atnls.player.timeChange);
    $('.showPoemas').click(atnls.player.showPoemas);
    
    // $('.bl-playlist').mThumbnailScroller({
    //   axis: 'x', //change to "y" for vertical scroller
    //   type: 'click-50',
    //   markup:{
    //     buttonsHTML:{
    //       left: '<span id="playlist-before"></aspan>',
    //       right: '<span id="playlist-after"></span>'
    //     },
    //   },
    // });

  },

  player: {
    active: null,
    $activePoemPage: null,
    miniDisplay: false,
    isVideoPlaying: false,
    audios: {},

    stop: function() {
      if(atnls.player.active) atnls.player.active.pause();
      atnls.player.active = null;
      atnls.player.$activePoemPage = null;
      $('#miniplayer, .col-player').find('.plyr-play').addClass('paused');
      $('#miniplayer, .col-player').find('.bl-timer-time').css('width', 0);
      $('#miniplayer .bl-player').hide();
      $('#miniplayer .player-nav').show();
    },
    play: function() {
      $('#miniplayer .bl-player').show();
      $('#miniplayer .player-nav').hide();
    },

    prev: function() {

      if(!atnls.player.$activePoemPage) {
        labTools.url.setUrl(projRoot + 'poemas/' + $('.page-poema:last').data('poema'));
        return false;
      }

        // stop!
      if(!atnls.player.$activePoemPage.prev().length) {
        
        if(!atnls.player.miniDisplay) {
          labTools.url.setUrl(projRoot + 'poemas/');
        } else {
          atnls.player.stop();
        }

        return false;
      }

      if(!atnls.player.miniDisplay) {
        
        labTools.url.setUrl(projRoot + 'poemas/' + atnls.player.$activePoemPage.prev().data('poema'));
      } else {
        
        atnls.player.stopAll();
        atnls.player.playPage(atnls.player.$activePoemPage.prev());
      }
      
      return false;

    },
    next: function() {
      if(!atnls.player.$activePoemPage) {
        labTools.url.setUrl(projRoot + 'poemas/' + $('.page-poema:eq(0)').data('poema'));
        return false;
      }

        // stop!
      if(!atnls.player.$activePoemPage.next().length) {
        
        if(!atnls.player.miniDisplay) {
          labTools.url.setUrl(projRoot + 'poemas/');
        } else {
          atnls.player.stop();
        }
        return false;
      }

      if(!atnls.player.miniDisplay) {
      
        labTools.url.setUrl(projRoot + 'poemas/' + atnls.player.$activePoemPage.next().data('poema'));
      } else {
        
        atnls.player.stopAll();
        atnls.player.playPage(atnls.player.$activePoemPage.next());
      }
      
      return false;
    },
    showPoemas: function() {
      
      if(atnls.player.$activePoemPage) {
        labTools.url.setUrl(projRoot + 'poemas/' + atnls.player.$activePoemPage.data('poema'));
      } else {
        labTools.url.setUrl(projRoot + 'poemas/');
      }
      return false;
    },
    timeupdate: function() {

      if(atnls.player.active) {
        $('#miniplayer, .col-player').find('.bl-timer-time').css('width', (atnls.player.active.currentTime() * 100 / atnls.player.active.duration()) + '%');
      } else {
        $('#miniplayer, .col-player').find('.bl-timer-time').css('width', 0);
      }
      
    },
    timeChange: function(e) {

      var $bar = $(this);
      var posX = $bar.offset().left;

      var percent = (e.pageX - posX) / $bar.width();

      atnls.player.active.currentTime(atnls.player.active.duration() * percent);
    },
    togglePlay: function() {
      if(!atnls.player.active) return false;

      if(atnls.player.active.paused()) {
        atnls.player.active.play();
        atnls.player.play();
        $('#miniplayer, .col-player').find('.plyr-play').removeClass('paused');
      } else {
        atnls.player.active.pause();
        $('#miniplayer, .col-player').find('.plyr-play').addClass('paused');
      }
      
      return false;
    },

    stopAll: function() {
      $('audio, video').each(function(){ this.pause(); });
      atnls.player.active = null;

      return false;
    },
    pause: function() {

      if(atnls.player.active && !atnls.player.active.paused()) {
        atnls.player.active.pause();
        $('#miniplayer, .col-player').find('.plyr-play').addClass('paused');
      }

    },
    pausePage: function($page) {
      var poema = $page.data('poema');

      var PCaudio = atnls.player.audios[poema];
      if(PCaudio) PCaudio.pause();

    },
    playPage: function($page) {

        // recalcula alto
      setTimeout(function(){
        var height = $page.height();
        var pHeight = $('.col-poemas').height();
        if(height > pHeight) {
          $page.find('.scrool-wrap').slimScroll({ height: pHeight });
        }
      }, 100);

      var poema = $page.data('poema');

      var PCaudio = atnls.player.audios[poema] ? atnls.player.audios[poema] : atnls.player.initPage($page);
      atnls.player.audios[poema] = PCaudio;

      // atnls.player.stopAll();

      if(atnls.cache.presentacion) return false;
      if(!PCaudio.paused()) return false;

      if(!atnls.player.miniDisplay) PCaudio.currentTime(0);

        // audio reproducido previamente? Toma propiedades
      var prevAudio = atnls.player.active;

        // save info
      atnls.player.active = PCaudio;
      atnls.player.$activePoemPage = $page;

        // play
      atnls.player.play()

      if(PCaudio.readyState() === 0 || PCaudio.readyState() == 1) {
        
        PCaudio.audio.addEventListener('canplay', function(){
          // console.log(PCaudio.readyState(), );
          // PCaudio.play();
          setTimeout(function(){ PCaudio.audio.play(); }, 100);
        });

      } else {
        PCaudio.play();
      }


      $('#miniplayer, .col-player').find('.plyr-play').removeClass('paused');

    },
    initPage: function($page) {

      var id = 'd' + Date.now();
      var $audio = $page.find('.audio');
      // var id = guidGenerator();//$audio.attr('id', id);
      $audio.html('<audio src="' + $audio.attr('src') + '" id="' + id + '"></audio>');
      $audio = $audio.find('audio');
      // var $audio = $page.find('.audio').attr('id', id);

      var PCaudio = Popcorn('#' + id);

      $audio.on('ended', atnls.player.next);
      $audio.on('timeupdate', atnls.player.timeupdate);

      var $body = $page.find('.poema-body');
      var times = $body.data('times');

      if(!times) { console.log('No hay minutado!'); return PCaudio; }

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

              $('#miniplayer .bl-player-current-inn').text(verso.html().replace(/<br>/g, ' '));
            },
            // onEnd: function( options ) {
            //  console.log(pos + ' end');
            // }
          });

        })();

      };

      return PCaudio;

    },

  },

          // función control de redimensionados______________________________________________________
  handleResize: function() {

    atnls.cache.winWidth = atnls.cache.$window.width();
    atnls.cache.winHeigth = atnls.cache.$window.height();

    atnls.cache.responsive = atnls.cache.winWidth < 800 ? true : false;
    atnls.cache.mini = atnls.cache.winWidth < 500 ? true : false;

    if(!atnls.cache.responsive) {
      $('#poemas .page-poema.act').each(function(){
        
        var $this = $(this);

        var height = $this.height();
        var pHeight = $('.col-poemas').height();

        if(height > pHeight) {
          $this.find('.scrool-wrap').slimScroll({ height: pHeight });
        } else {
          $this.find('.scrool-wrap').css('height', pHeight).slimScroll({destroy: true});
        }
      });

      $('#credits').each(function(){
        var $this = $(this);

        var height = $this.find('.wk-valign-cont').height();

        if(height > atnls.cache.winHeigth) {
          $this.addClass('of').find('.wk-valign').slimScroll({ height: atnls.cache.winHeigth });
        } else {
          $this.removeClass('of').find('.wk-valign').css('height', atnls.cache.winHeigth).slimScroll({destroy: true});
        }
      });

      $('#redes .col-redes-main').slimScroll({ height: atnls.cache.winHeigth - 150});

      var padd = 10;
      var maxWidth = 1500;
      var proportion = 0.64;// 1500 / 933  // 9 / 16; // 3 / 4; 
      var w, h, top;

      w = (atnls.cache.winWidth > maxWidth) ? maxWidth : atnls.cache.winWidth;

      if(atnls.cache.winHeigth < (w * proportion)) {
        h = atnls.cache.winHeigth;
        w = h / proportion;
      } else {
        h = 'auto';
      }

      atnls.cache.$canvas.css({
        'width': w,
        'height': h
      });

    } else {
      atnls.cache.$canvas.css({
        'width': 'auto',
        'height': 'auto'
      });
    }

  },

};

// Almacenamiento en general
// -----------------------------------------------------------------------------------
atnls.cache = {
  $window: $(window),
  $canvas: $('#webdoc .wrap'),

  winWidth: 0,                            // tamaños de cosas
  winHeigth: 0,

  responsive: true,
  mini: true,

  baseUrl: projRoot,

  initialLoad: true,

  breakpoint: 980, // swithchs from canvas layout to full

  presentacion: false, // está lanzada la página de login?

  hash: 'atnls',
  via: 'atnls_doc',
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