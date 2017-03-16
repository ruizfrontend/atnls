<?php

  // inicializando
error_reporting(E_ALL ^ E_NOTICE);
setlocale(LC_ALL,"es_ES");

header('Content-Type: text/html; charset=utf-8');

ini_set("display_startup_errors ",1); 
ini_set("error_reporting",E_ALL); 
ini_set('display_errors', 1);

ob_start('ob_gzhandler');

define('SITE_ROOT', dirname(__FILE__));


require './libTwitter.php';

$output = '../dataOK/redes.json';


try {

	if(!file_exists($output)) throw new Exception("No se encontró archivo de tweets", 1);
	if(!isset($_GET['tw'])) throw new Exception("No se encontró tweet para borrar", 1);

	$data = json_decode(file_get_contents($output), true);

	$found = false;

	foreach ($data['tweets'] as $key => $tweet) {
		if($tweet['id'] == $_GET['tw']) {
			array_splice($data['tweets'], $key, 1);
			file_put_contents($output, json_encode($data));
			returnJSONResponse('Tweet eliminado correctamente');
		}
	}

	if(!$found) throw new Exception("No se encontró el tweet", 1);


} catch (Exception $e) {
	
	returnJSONResponse($e->getMessage(), 500);

}

function returnJSONResponse($data, $httpCode = 200) {

	header('Content-Type: text/html; charset=utf-8');

	if(substr($httpCode, 0, 1) == 2) {
	  header('HTTP/1.0 ' . $httpCode . ' Todo benne');
	} else {
	  switch ($httpCode) {
	    case '400':
	      header('HTTP/1.0 ' . $httpCode . ' Bad Request');
	    break;
	    case '403':
	      header('HTTP/1.0 ' . $httpCode . ' Forbidden');
	    break;
	    case '404':
	      header('HTTP/1.0 ' . $httpCode . ' Resource not Found');
	    break;
	    case '500':
	      header('HTTP/1.0 ' . $httpCode . ' Server error');
	    break;
	    default:
	      header('HTTP/1.0 ' . $httpCode . ' Error');
	    break;
	  }
	}

	echo($data);

	  // finisih execution    
	die();
}