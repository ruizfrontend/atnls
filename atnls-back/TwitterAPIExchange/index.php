<?php
setlocale(LC_ALL,"es_ES");
header('Content-Type: text/html; charset=utf-8');

ini_set('display_errors', 1);
require_once('TwitterAPIExchange.php');

/** Set access tokens here - see: https://dev.twitter.com/apps/ **/
$settings = array(
    'oauth_access_token' => "259677053-cvS8qULAQSWunpkg4Tyhn0DNwz8HkzfUeKfZ3sIl",
    'oauth_access_token_secret' => "CX7NYOBKiqDjr3S6CgJoLrKO2dnDEjaprBdJKsWcmog",
    'consumer_key' => "7HjGMKVJHbdrmpkyIMQxQ",
    'consumer_secret' => "xRXroO5ant6DIYYKFR92m9qfDZZgrLO9Lc10BWPHM"
);

/** URL for REST request, see: https://dev.twitter.com/docs/api/1.1/ **/
$url = 'https://api.twitter.com/1.1/search/tweets.json';
$requestMethod = 'GET';

/** POST fields required by the URL above. See relevant docs as above **/
$getfield =  '?q=lab%20rtve&count=100';

/** Perform a POST request and echo the response **/
$twitter = new TwitterAPIExchange($settings);
$outp = $twitter->setGetfield($getfield)
    ->buildOauth($url, $requestMethod)
    ->performRequest();

$data = json_decode($outp);
?>
<!doctype html>
<html xmlns:fb="http://www.facebook.com/2008/fbml">
  <head>
    <title>php-sdk</title>
  </head>
  <body>

    <?php 
      foreach ($data->statuses as $key => $value) {
        print '<hr>';
        //print_r($value);
        print_r($value->created_at);
        $date = date_parse($value->created_at);
        //print_r($date);
        print $date['day'].' de '.$date['month'].' del '.$date['year'];
        print '<br/>';
        print($value->user->name.' (@'.$value->user->screen_name.') -> ');
        if(isset($value->text)) {
          print($value->text);
        }
        print '<br/>';
      };

        print '<br/>';
        print '<br/>';
    ?>

  </body>
</html>