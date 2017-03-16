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

$output = '../dataOK/redes.json';
$output2 = './last';


file_put_contents($output, json_encode(array('tweets' => array())));
file_put_contents($output2, 0);