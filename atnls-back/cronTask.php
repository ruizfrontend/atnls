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


$lastFile = './last';
$output = '../dataOK/redes.json';
$hash = 'yosoypoesia';// 'poesiaerestu';
$filter = true;


if($filter) $hash .= '  -filter:retweets -filter:replies';
$hash = urlencode($hash);

try {

	$last = file_exists($lastFile) ? file_get_contents($lastFile) : 0;

		// query
	$results = getTwitter(array('query' => ($hash), 'max_id' => $last, 'count' => 100, 'result_type' => 'recent'));

		// error 
	if(!isset($results->search_metadata)) throw new Exception("Error Getting twits", 1);


	if($results->search_metadata->count != 0) {

			// save last id
		file_put_contents($lastFile, $results->search_metadata->max_id);

		$data = file_exists($output) ? json_decode(file_get_contents($output), true) : array('tweets' => array());
print_R($results);
		foreach ( $results->statuses as $tweet) {
			array_push($data['tweets'], processTweet($tweet));
		}

		file_put_contents($output, json_encode($data));
	}
	
} catch (Exception $e) {
	
	die($e->getMessage());

}