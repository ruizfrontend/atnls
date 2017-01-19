<?php


// Importaciones de ficheros
// -------------------------------

require_once('./TwitterAPIExchange/TwitterAPIExchange.php');




/** 
* Funciones de consulta de datos
* ---------------------------------------------
* @method getTwitterSettings -> obtenemos los parametros para la configuracion de la cuenta de Twitter
*
* @method getTwitter -> hace consulta a api de twitter para un tweet
*   @prop queryid -> id del tweet
* @method getTwitter -> hace consulta a api de twitter basado en una query simple
*   @prop query objeto
* @method getTwitterList -> hace consulta a api de twitter basado en una lista
*   @prop query
* @method getTwitterTimeline -> hace consulta a api de twitter para obtener los tweets del time line del usuario
*   @prop query
* @method getTwitterLikes -> hace consulta a api de twitter para los likes de un usuario
*   @prop query
* @method getTwitterSettings -> obtenemos los parametros para la configuracion de la cuenta de Twitter
*/






// Configuracion de la cuenta
// -------------------------------

function getTwitterSettings() {

  /** Set access tokens here - see: https://dev.twitter.com/apps/ **/
  $settings = array(
      'oauth_access_token' => "259677053-JRnDxjnnfP3avjB3eZMXfsI4cSxjyUdbIvsOeUvZ",
      'oauth_access_token_secret' => "SW2kQTqj2r6KWLX0XiIIEnFiXbch350O9TZbjsoWoFpM7",
      'consumer_key' => "kUSI7Rb5l4lh3vWaEI9VXQ",
      'consumer_secret' => "9VBjdDgW7xBiqreDgSJOmTBKL6oob7P7gAUbWUn8HI",
      'bearer'          => '3909221-oMATUFEK9FjYT4frFHFBBwvmaPrHB9LRWufa3omrs',
  );

  return $settings;
}








function getTweet($queryid){

  $settings = getTwitterSettings();

  /** URL for REST request, see: https://dev.twitter.com/docs/api/1.1/ **/
  $url = 'https://api.twitter.com/1.1/statuses/show.json';
  $requestMethod = 'GET';

  /** POST fields required by the URL above. See relevant docs as above **/
  $getfield =  '?id='.$queryid;

  /** Perform a POST request and echo the response **/
  $twitter = new TwitterAPIExchange($settings);

  $outp = $twitter->setGetfield($getfield)
      ->buildOauth($url, $requestMethod)
      ->performRequest();

  $data = json_decode($outp);

  return $outp;
}


/*  getTwitter($query)   Búsqueda genérica
/*  $query = array('query' => 'love', 'max_id' => null);
---------------------- */

function getTwitter($query){

  $settings = getTwitterSettings();

  /** URL for REST request, see: https://dev.twitter.com/docs/api/1.1/ **/
  $url = 'https://api.twitter.com/1.1/search/tweets.json';
  $requestMethod = 'GET';

  /** POST fields required by the URL above. See relevant docs as above .php on line 126**/
  $getfield =  '?q='.urlencode($query['query']).'&count=100&include_entities=1';

  if ( isset($query['max_id']) ) {
    $getfield .= '&since_id=' . ($query['max_id']+1);
  }

  if ( isset($query['popular']) ) {
    $getfield .= '&result_type=popular';
  } else {
    $getfield .= '&result_type=recent';
  }

  /** Perform a POST request and echo the response **/
  $twitter = new TwitterAPIExchange($settings);

  $outp = $twitter->setGetfield($getfield)
      ->buildOauth($url, $requestMethod)
      ->performRequest();

  $data = json_decode($outp);

  return $data;
}

function getTwitterList($query){

  $settings = getTwitterSettings();

  /** URL for REST request, see: https://dev.twitter.com/docs/api/1.1/ **/
  $url = 'https://api.twitter.com/1.1/lists/statuses.json';
  $requestMethod = 'GET';

  /** POST fields required by the URL above. See relevant docs as above **/
  $getfield =  '?list_id='.urlencode($query['query']).'&count=100';

  if(isset($query['max_id'])) {
    $getfield .= '&since_id='.$query['max_id'];
  }

  /** Perform a POST request and echo the response **/
  $twitter = new TwitterAPIExchange($settings);

  $outp = $twitter->setGetfield($getfield)
      ->buildOauth($url, $requestMethod)
      ->performRequest();
     
  $data = json_decode($outp);

  return $data;
}

function getTwitterLikes($query) {

  $settings = getTwitterSettings();

  /** URL for REST request, see: https://dev.twitter.com/docs/api/1.1/ **/
  $url = 'https://api.twitter.com/1.1/favorites/list.json';
  $requestMethod = 'GET';

  /** POST fields required by the URL above. See relevant docs as above **/
  $getfield =  '?screen_name='.urlencode($query['query']).'&count=200';
  if(isset($query['max_id'])) {
    $getfield .= '&since_id='.$query['max_id'];
  }

  /** Perform a POST request and echo the response **/
  $twitter = new TwitterAPIExchange($settings);
  $outp = $twitter->setGetfield($getfield)
      ->buildOauth($url, $requestMethod)
      ->performRequest();
     
  $data = json_decode($outp);

  return $data;
}


function getTwitterTimeline($query) {

  $settings = getTwitterSettings();

  /** URL for REST request, see: https://dev.twitter.com/docs/api/1.1/ **/
  $url = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
  $requestMethod = 'GET';

  /** POST fields required by the URL above. See relevant docs as above **/
  $getfield =  '?screen_name=partilab&count=200';
  if(isset($query['max_id'])) {
    $getfield .= '&since_id='.$query['max_id'];
  }

  /** Perform a POST request and echo the response **/
  $twitter = new TwitterAPIExchange($settings);
  $outp = $twitter->setGetfield($getfield)
      ->buildOauth($url, $requestMethod)
      ->performRequest();
     
  $data = json_decode($outp);

  return $data;
}




/** 
* funciones de proceso de datos
* ---------------------------------------------
* @method processTwResponse -> procesa un response con múltiples twitter y lo devuelve con el formato dato
*   @prop response -> la respuesta de una query a twitter
*   @prop format -> opcional - string -> 'full' para devolver más información 
* @method processTwUser -> formatea un usuario de twitter
*   @prop user -> objecto
*   @prop format -> opcional - string -> 'full' para devolver más información 
* @method processTweet -> formatea un tweet
*   @prop tweet -> objecto
*   @prop format -> opcional - string -> 'mini' para solo lo mínimo, 'full' para devolver más información y undefined para lo normal (hoy)
*/

function processTwResponse($response, $format = '') {
  $tweets = array();
  
  foreach ($response->statuses as $key => $tweet) {
    array_push($tweets, processTweet($tweet , $format));
  }

  return $tweets;
}

function processTwUser($user, $format = '') {

  if(isset($format) && $format == 'full') {

    return array (
      'name' => $user->name,
      'screen_name' => $user->screen_name,
      'location' => $user->location,
      'followers_count' => $user->followers_count,
      'profile_image_url' => $user->profile_image_url,
      'created_at' => $user->created_at,
      'id_str' => $user->id_str,
      'id_str' => $user->id_str,
      'net' => 'tw'
    );
  } else {

    return array (
      'name' => $user->name,
      'screen_name' => $user->screen_name,
      'location' => $user->location,
      'followers_count' => $user->followers_count,
      'profile_image_url' => $user->profile_image_url,
      'net' => 'tw'
    );
  }
}

function processTweet($tweet, $format = '') {

  if(!isset($tweet->text)) return false; // sin texto no es un tweet

  if(isset($format) && $format == 'full') {

    return array (
      'user' => $tweet->user->id_str,
      'screen_name' => $tweet->user->screen_name,
      'text' => $tweet->text,
      'retweet_count' => $tweet->retweet_count,
      'link' => 'http://twitter.com/'.$tweet->user->screen_name.'/status/'.$tweet->id_str,
      'in_reply' => $tweet->in_reply_to_status_id_str,
      'favourites' => $tweet->favourites_count,
      'created_at' => $tweet->created_at,
      'id' => $tweet->id_str,
      'favorited' => $tweet->favorited,
      'net' => 'tw'
    );
  } else if(isset($format) && $format == 'mini'){

    return array (
      'user' => $tweet->user->id_str,
      'screen_name' => $tweet->user->screen_name,
      'text' => $tweet->text,
      'created_at' => $tweet->created_at,
      'id' => $tweet->id_str,
      'link' => 'http://twitter.com/'.$tweet->user->screen_name.'/status/'.$tweet->id_str,
      'net' => 'tw'
    );
  } else {
    $outp = array (
      'user' => $tweet->user->id_str,
      'screen_name' => $tweet->user->screen_name,
      'text' => $tweet->text,
      'id' => $tweet->id_str,
      'created_at' => $tweet->created_at,
      'link' => 'http://twitter.com/'.$tweet->user->screen_name.'/status/'.$tweet->id_str,
      'net' => 'tw'
    );

    if(isset($tweet->entities->media)){
      $media = array();
      for ($i=0; $i < count($tweet->entities->media); $i++) { 
        array_push($media, $tweet->entities->media[$i]->media_url);
      }
      $outp['media'] = $media;
    }

    return $outp;

  }
}


?>