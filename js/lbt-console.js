/*  @eldiarioes
Desarrollo: David Ruiz @2015__________________________ */

/**
*
* labTools - Console tools
* ----------------------------------------------
* Funciones básicas de logeado
*
* Métodos:
*   -log -> pues eso
*   -error -> pues parecido
*/

/*global $ */
/*global Modernizr */
/*global _gaq */
/*global console */

'use strict';

if(!labTools) { var labTools = {}; }

labTools.console = {
  // Funcion que muestra por la consola el log de errores/traza
  log: function(texto){
    if (console && console.log && labTools.console.data.log) console.log.apply(console, arguments);
  },
  error: function(text){
    if (console && console.error && labTools.console.data.log) console.error.apply(console, arguments);
  },
  data: {
    log: false
  }
};
