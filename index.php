<?php
require_once __DIR__.'/vendor/autoload.php';

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\HttpKernel\Debug\ErrorHandler;
use Symfony\Component\HttpKernel\Debug\ExceptionHandler;

use Silex\Application;

use Monolog\Logger;

  // our classes:
use Services\dataLoader;
use Services\fixUrlText;

$sspa = new Silex\Application();

$sspa->register(new DerAlex\Silex\YamlConfigServiceProvider(__DIR__ . '/settings.yml'));


$sspa['debug'] = $sspa['config']['debug'];

  /* -- MONOLOG ----------------------------_-
 initiates logging system */
if($sspa['debug'] && isset($sspa['config']['log']) && $sspa['config']['log'] != false) {

  ini_set('display_errors', 1);
  error_reporting(-1);
  ErrorHandler::register();

  $sspa->register(new Silex\Provider\MonologServiceProvider(), array(
    'monolog.logfile' => __DIR__.$sspa['config']['log'],
    'monolog.level' => Monolog\Logger::ERROR,
  ));

  $sspa['monolog']->addDebug('----BOOTSTRAPING APP----');
}

  /* -- TWIG ----------------------------_-
  // register template processor */
$sspa->register(new Silex\Provider\TwigServiceProvider(), array(
  'twig.path' => __DIR__.'/'
));

$sspa['twig'] = $sspa->share($sspa->extend('twig', function ($twig, $sspa) {
    /* sample Twig filter */
    $twig->addExtension(new Services\textoToUrl($sspa));
    return $twig;
}));

  // basic data required to generate the templates
$dataTwig = array(
  'twigFolder' => $sspa['config']['twigs'],
  'base_url' => $sspa['config']['base_url'],
  'debug' => $sspa['debug'],
  'homeRoute' => $sspa['config']['routing']['initialRoute'],
  'imports' => array(),
  'ajaxPath' => $sspa['config']['ajaxPath'],
);


  /* -- AUTOLOADER ----------------------------_-
  // Loads automatically a folder of templates, and user ther template name
  // to bind routes defined in the routing file */
// if (isset($sspa['config']['autoloader'])) {
//
//   $sspa['sectionsLoader'] = function () { return new sectionsLoader(); };
//   $autoloader = array();
//
//   foreach ($sspa['config']['autoloader'] as $title => $url) {
//
//     $autoloader[$title] = array('url' => $url, 'sections' => null);
//
//     $autoloader[$title]['sections'] = $sspa['sectionsLoader']->getSections($sspa, __DIR__ . $url);
//
//   }
//
//   $dataTwig['sectionsLoader'] = $autoloader;
//
// } else { $dataTwig['sectionsLoader'] = null; }

  /* -- DATALOADER ----------------------------_-
  // Loads external resources (locally or remote), and allows you
  // to configure dynamic routes for them based on the fields you choose.
  // Both 'routing' and 'dataloader' works simillar, but 'routing' is required

  // @defines $sspa['routing'] => array of routes
  */
$imports = array();
$sspa['dataLoader'] = function () { return new dataLoader(); };

    // load routing data (REQUIRED)
if(!isset($sspa['config']['routing']) || !isset($sspa['config']['routing'])) {
  $sspa->abort(404, "No routing file found. Aborting");
}

$column = isset($sspa['config']['routing']['indexColumn']) ? $sspa['config']['routing']['indexColumn'] : null;

$sspa['dataLoader']->getData( // -> nos genera $sspa['dataLoader.seo']
  $sspa['config']['routing']['url'],
  'seo',
  $sspa,
  $sspa['config']['routing']['format'],
  $column
);

if(isset($sspa['config']['routing']['preprocess'])) {
  $sspa['dataLoader.'.$title] = $sspa['config']['routing']['preprocess']($sspa['dataLoader.seo']);
}

foreach ($sspa['dataLoader.seo'] as $key => $value) {
  if(!isset($value['url']) || $value['url'] == ''){
    $value['url'] = '/';
  }
  $routes[$value['url']] = $sspa['config']['twigs'] . '/' . $key . '.html.twig';
  $routes[$value['url']] = $value;
}

array_push($imports, array(
  'title' => 'seoInfo',
  'arrayName' => 'dataLoader.seo',
  'exposeJS' => true, // TODO: check this default values
  'exposeTWIG' => true,
  'routing' => false,
  'path' => false,
  'route' => false,
));

      // load other data import
if(isset($sspa['config']['dataImports'])) {
  foreach ($sspa['config']['dataImports'] as $title => $import) {

      // columna para indexar los datos
    $column = isset($import['indexColumn']) ? $import['indexColumn'] : null;

      // obtiene los datos
    $sspa['dataLoader']->getData($import['url'], $title, $sspa, $import['format'], $column); // -> nos genera $sspa['dataLoader.seo']


      // admite funciones para preprocesar los datos (ojo que esto se hace cada vez que se bootstrapea la app y puede ralentizar la carga)
    if(isset($import['preprocess']) && function_exists($import['preprocess'])) {
      $sspa['dataLoader.'.$title] = $import['preprocess']($sspa['dataLoader.'.$title]);
    }

      // save the reference of the imported files to easily inject it at the controller
    array_push($imports, array(
      'title' => $title,
      'arrayName' => 'dataLoader.'.$title,
      'exposeJS' => isset($import['exposeJS']) ? $import['exposeJS'] : false, // TODO: check this default values
      'exposeTWIG' => isset($import['exposeTWIG']) ? $import['exposeTWIG'] : true,
      'routing' => isset($import['routing']) ? true : false,
      'path' => isset($import['routing']['url']) ? $import['routing']['url'] : false,
      'route' => isset($import['routing']['route']) ? $import['routing']['route'] : false,
    ));

      // adds the routes to the routing array so we can use them
    if(isset($import['routing'])) {

      foreach ($sspa['dataLoader.'.$title] as $row) {

        $url = '/' . $title . '/' . processUrl($row[$import['routing']['url']]);

          // notify repeated urls
        if(isset($routes[$url])) {

          $sspa['monolog']->addDebug('[sspa] Duplicated route found: '.$url);

        } else {

          $routes[$url] = array (
            'routeName' => $title,
            'routeData' => $row,
            'tpl' => $sspa['config']['twigs'] . '/' . $title . '.html.twig',

            'name' => $row[$import['routing']['name']],
            'title' => 'Sección ' . $row[$import['routing']['title']],
            'shortTitle' => $row[$import['routing']['name']],
            'description' => $row[$import['routing']['url']],
            'keywords' => $row[$import['routing']['url']],
            'seoImg' => $row[$import['routing']['url']],
            'ShareText' => $row[$import['routing']['url']],
          );

          if(isset($import['routing']['ajax']) && $import['routing']['ajax'] == true) {

            $urlAjax = $sspa['config']['ajaxPath'] . '/' . $title . '/' . processUrl($row[$import['routing']['url']]);

            $routes[$urlAjax] = $routes[$url];
            $routes[$urlAjax]['ajax'] = true;

          }

        }

      }
    }
  }

  foreach ($imports as $key => $value) {
    if($value['exposeTWIG'] || $value['exposeJS']) {
      $dataTwig['imports'][$value['title']] = $sspa[$value['arrayName']];
    }
  };

  $dataTwig['imports'][$value['title']] = $sspa[$value['arrayName']];
  $dataTwig['importInfo'] = $imports;
} else {
  $dataTwig['importInfo']= null;
}


  // Import 'rawData' from settings.yml
if(isset($sspa['config']['rawData'])) $dataTwig['rawData'] = $sspa['config']['rawData'];


   // what we have so far
// print_R($routes);
// print_R($dataTwig);
// die();


  /* -- Final DATA ----------------------------_- */
$dataTwig['project'] = $sspa['config']['project'];


$sspa['routing'] = $routes;
$sspa['twigData'] = $dataTwig;


  // PROCESS REQUEST AND GENERATE OUTPUT
$sspa->register(new Silex\Provider\UrlGeneratorServiceProvider());


/* - ATNLS código exclusivo - */
  
  $sspa->get($dataTwig['rawData']['poetasUrl'] . '{poeta}',

    function(Request $request, Application $sspa, $poeta) {

      if(!isset($sspa['twigData']['rawData']['poetas'][$poeta])) $sspa->abort(404, "No routing file found. Aborting");

      $twigData = $sspa['twigData'];
      $url = $request->getBasePath() . $request->getPathInfo();
      $twigData['url'] = $url;
      
      $twigData['poeta'] = $sspa['twigData']['rawData']['poetas'][$poeta];
      $twigData['poetaId'] = $poeta;

      $twigData['seoData'] = array(
        'name' => 'poeta',
        'url' => '',
        'title' => 'title',
        'description' => '',
        'keywords' => '',
        'seoImg'=> '',
        'ShareText'=> '',
        'shortTitle'=> '',
      );

      $tpl = $sspa['config']['twigs'] . '/main.html.twig';

      return new Response($sspa['twig']->render($tpl, $twigData), 200, array('Cache-Control' => 's-maxage=3600, public'));
    }
  )->bind('poeta');
  
 
  $sspa->get($dataTwig['rawData']['poemasUrl'] . '{poema}',

    function(Request $request, Application $sspa, $poema) {

      if(!isset($sspa['twigData']['rawData']['poemas'][$poema])) $sspa->abort(404, "No routing file found. Aborting");
      
      $twigData = $sspa['twigData'];
      $url = $request->getBasePath() . $request->getPathInfo();
      $twigData['url'] = $url;
      
      $twigData['poema'] = $sspa['twigData']['rawData']['poemas'][$poema];
      $twigData['poemaId'] = $poema;
      
      $twigData['seoData'] = array(
        'name' => 'poema',
        'url' => '',
        'title' => 'title',
        'description' => '',
        'keywords' => '',
        'seoImg'=> '',
        'ShareText'=> '',
        'shortTitle'=> '',
      );
      
      $tpl = $sspa['config']['twigs'] . '/main.html.twig';

      return new Response($sspa['twig']->render($tpl, $twigData), 200, array('Cache-Control' => 's-maxage=3600, public'));
    }
  )->bind('poema');


  $sspa->get($dataTwig['rawData']['audioPath'] . '{poema}.mp3',
    function(Request $request, Application $sspa, $poema) {
      $sspa->abort(404, "Resource not found");
    }
  )->bind('poemaAudio');
  
 
  $sspa->get($dataTwig['rawData']['ajaxUrl'],

    function(Request $request, Application $sspa) {

      $twigData = $sspa['twigData'];
      $url = $request->getBasePath() . $request->getPathInfo();
      $twigData['url'] = $url;

      $tpl = $sspa['config']['twigs'] . '/ajax.html.twig';

      return new Response($sspa['twig']->render($tpl, $twigData), 200, array('Cache-Control' => 's-maxage=3600, public'));
    }
  )->bind('ajax');
  

/* - ATNLS código exclusivo - END - */


foreach ($sspa['routing'] as $title => $url) {
    // the routeing here!
  $sspa->get(
    $title,
    function(Request $request, Application $sspa) {

        // pass the data from the request to de twig data
      $twigData = $sspa['twigData'];
      $url = $request->getPathInfo();
      $twigData['seoData'] = $sspa['routing'][$url];

      $tpl = $sspa['config']['twigs'] . '/main.html.twig';

      if(isset($sspa['routing'][$url]['routeName'])) {

        $twigData['routeData'] = $sspa['routing'][$url]['routeData'];

      } else {

        $twigData['routeData'] = null;

      }

      $twigData['url'] = $request->getBasePath() . $url;

      if($sspa['debug'] && $request->query->has('dR')) { print_r($sspa['routing']); die(); } // dump the routes
      if($sspa['debug'] && $request->query->has('dD')) { print_r($twigData); die(); } // dump the twig data

      return new Response($sspa['twig']->render($tpl, $twigData), 200, array('Cache-Control' => 's-maxage=3600, public'));
    }
  )->bind($url['name']);
}


  // ERROR PAGE -> not found
$sspa->error(function (\Exception $e, $code) use($sspa) {
  if(!$sspa['debug']) {
    return $sspa->redirect('/');
  }
});

$sspa->run();
