<?php

/** 
* Funciones de consulta de datos
* ---------------------------------------------
* @method getInstagramSettings -> Devuelve el ID del cliente sobre el que se va a realizar la consulta
* @method getInstagram -> hace consulta a api de Instagram basado en una query simple
*   @prop query string
*/

function getInstagramSettings(){

  /** Set access tokens here - see: https://dev.twitter.com/apps/ **/
  $client_id = "03474393e46343b9a3b49403579f0fe8";

  return $client_id;
}
function getInstagramToken(){

  /** Set access tokens here - see: https://dev.twitter.com/apps/ **/
  $access_token = "249230953.0347439.048580a5faf54b03804140f9161c3996";

  return $access_token;
}

  // querys instagrams for tag from last instagram recived (next_min_id)
function continuousIg($request){

  $query = array('query'=> $request['query']);
  $request['max_queries'] = $request['max_queries'] ? $request['max_queries'] : 20;

    // output structure
  $outp = array(
    'igs' => $request['data']['igs'],
    'igUsers'=>$request['data']['igUsers'],
    'next_min_id' => null
  );

  $i = 0;

    // if we have oldest values, we must have a 'next_min_id' value to limit our queries, otherwise, we set it to query 'max_queries' times
  if(isset($request['data']['next_min_id'])) {

    $query['next_min_id'] = $request['data']['next_min_id'];

    do {

      $i++;

      $response = getInstagram($query);
      
      if(isset($response->pagination->next_max_tag_id)) { $query['max_tag_id'] = $response->pagination->next_max_tag_id; };

      $results = processIgResponse($response, $request['filter'], $outp['igUsers']);
      
      if (count($results['igs'])) $outp['igs'] = array_merge($outp['igs'], $results['igs']);

      $outp['igUsers'] = $results['igUsers'];

        // the first element of the query, we save it to limit posterior queries
      if($i == 1) $outp['next_min_id'] = $response->pagination->min_tag_id;

    } while (isset($response->pagination->next_max_tag_id) && $i <= $request['max_queries']);

  } else {

    do {

      $i++;

      $response = getInstagram($query);
      
      if(isset($response->pagination->next_max_tag_id)) { $query['max_tag_id'] = $response->pagination->next_max_tag_id; };

      $results = processIgResponse($response, $request['filter'], $outp['igUsers']);
      
      if (count($results['igs'])) $outp['igs'] = array_merge($outp['igs'], $results['igs']);

      $outp['igUsers'] = $results['igUsers'];

        // the first element of the query, we save it to limit posterior queries
      if($i == 1) $outp['next_min_id'] = $response->pagination->min_tag_id;

    } while ($i <= $request['max_queries']);
  }

  usort($outp['igs'], "dataSort");

  return $outp;
}

function dataSort($a, $b) {
  return $a['created_time'] < $b['created_time'];
}

function getIgUrl($url){

  $client_id = getInstagramSettings();

  $url = "http://api.instagram.com/oembed?url=".urlencode($url);
  
  $ch = curl_init();
  curl_setopt_array($ch, array(
      CURLOPT_URL => $url,
      CURLOPT_RETURNTRANSFER => true
  ));

  $result = curl_exec($ch);
  curl_close($ch);

  $data = json_decode($result);

  if(isset($data->media_id)){
    $url = "https://api.instagram.com/v1/media/".$data->media_id."?client_id=".$client_id;

    $ch = curl_init();
    curl_setopt_array($ch, array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true
    ));
    $result = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($result);

    if(!isset($data->meta) || $data->meta->code != '200'){
      return false;
    }

    return $data;
  }

  return false;

}

function getInstagramTimeline($query){
  $access_token = getInstagramToken();

  $url = "https://api.instagram.com/v1/users/self/feed/?access_token=".$access_token;
  
  if(isset($query['max_id'])) {
    $url .= '&count=200&min_id='.$query['max_id'];
  }
echo 'executing query '.$url.'<br/>';

  $ch = curl_init();
  curl_setopt_array($ch, array(
      CURLOPT_URL => $url,
      CURLOPT_RETURNTRANSFER => true
  ));

  $result = curl_exec($ch);
  curl_close($ch);

  $data = json_decode($result);

  if(!isset($data->meta) || $data->meta->code != '200'){
    return false;
  }
  
  return $data;
}

function getInstagram($query){

  $client_id = getInstagramSettings();
        // req
    //min_tag_id -> la foto más reciente. Hay que guardarla en la primera consulta, y es la que usamos 
    //max_tag_id -> la última foto que ya tenemos, 
        //res
    // next_min_id -> el que guardamos para usar como min_tag_id en la próxima consulta

  $url = "https://api.instagram.com/v1/tags/".urlencode($query['query'])."/media/recent?client_id=".$client_id;
  
  if(isset($query['max_id'])) {
    $url .= '&max_id='.$query['max_id'];
  }

  if(isset($query['min_id'])) {
    $url .= '&min_id='.$query['min_id'];
  }

  if(isset($query['next_min_id'])) {
    $url .= '&min_tag_id='.$query['next_min_id'];
  }

  if(isset($query['max_tag_id'])) {
    $url .= '&max_tag_id='.$query['max_tag_id'];
  }

  $url .= '&count=200';

  echo 'executing getInstagram query '.$url.'<br/>';
  $ch = curl_init();
  curl_setopt_array($ch, array(
      CURLOPT_URL => $url,
      CURLOPT_RETURNTRANSFER => true
  ));

  $result = curl_exec($ch);
  curl_close($ch);

  $data = json_decode($result);

  if(!isset($data->meta) || $data->meta->code != '200'){
    echo ('Response error<br/>');
    print_R($data);
    return false;
  }

  return $data;
}

function getUserInfo($userId) {

  $client_id = getInstagramSettings();

  $url = "https://api.instagram.com/v1/users/".urlencode($userId)."?client_id=".$client_id;

  echo 'executing getUserInfo query '.$url.'<br/>';
  $ch = curl_init();
  curl_setopt_array($ch, array(
      CURLOPT_URL => $url,
      CURLOPT_RETURNTRANSFER => true
  ));

  $result = curl_exec($ch);
  curl_close($ch);

  $data = json_decode($result);

  if(!isset($data->meta) || $data->meta->code != '200'){
    echo ('Response error<br/>');
    print_R($data);
    return false;
  }

  return processIgUser($data->data);

}


function getLocationInfo($locationId) {

  $client_id = getInstagramSettings();

  $url = "https://api.instagram.com/v1/locations/".urlencode($locationId)."?client_id=".$client_id;

  echo 'executing getInstagramLocation query '.$url.'<br/>';
  $ch = curl_init();
  curl_setopt_array($ch, array(
      CURLOPT_URL => $url,
      CURLOPT_RETURNTRANSFER => true
  ));

  $result = curl_exec($ch);
  curl_close($ch);

  $data = json_decode($result);

  if(!isset($data->meta) || $data->meta->code != '200'){
    echo ('Response error<br/>');
    print_R($data);
    return false;
  }

  return $data->data;

}


/** 
* Funciones de procesado de datos
* ---------------------------------------------
* @method processIgUser -> formatea un usuario de instagram
*   @prop user -> objecto
* @method processIg -> formatea un instagram
*   @prop photo -> objecto
*/

function processIgUser($user) {
  
  return array (
    'user' => $user->username,
    'img' => $user->profile_picture,
    'full_name' => $user->full_name,
    'link' => 'http://instagram.com/'.$user->username,
    'id' => $user->id,
    'net' => 'ig'
  );
}

function processIg($photo) {

  $result = array (
    'id' => $photo->id,
    'created_time' => $photo->created_time,
    'link' => $photo->link,
    'likes' => $photo->likes->count,
    'image' => $photo->images->standard_resolution->url,
    'type' => $photo->type,
    'net' => 'ig',
    'user' => $photo->user->id,
    'user_name' => $photo->user->username,
    'location' => $photo->location
  );

  if(isset($photo->caption)) {
    $result['text'] = $photo->caption->text;
  } else {
    $result['text'] = '';
  }

  if($photo->type == 'video') {
    $result['video'] = $photo->videos->standard_resolution->url;
  }

  return $result;
}

function processIgResponse($response, $filter = null, $users) {
print_R($response); die();
  if($response->meta->code != '200') {
    print_r($response->meta); return;
  };

  $outp = array();
  $usrs = $users;

  foreach ($response->data as $key => $photo) {

      // filter instagrams
    if(isset($filter)) {
      if(!filterIg($photo, $filter)) continue;
    }

    if(isset($photo->location)) {
      if(isset($photo->location->id)) {
        $photo->location = getLocationInfo($photo->location->id);
      } else {
        $photo->location = $photo->location;
      }
    } else { echo 'Foto no válida: No hay geolocalización<br/>';continue; }

    $result = processIg($photo);

      // process the user data
    if(!isset($usrs[$photo->user->id])) {
      $user = getUserInfo($photo->user->id);

      $found = false;

      $usrs[$photo->user->id] = $user;
    }

    echo 'Encontrado ig '.$photo->link. ' <br/>';

    array_push($outp, $result);
  }

  return array('igs' => $outp, 'igUsers' => $usrs);
}


function filterIg($photo, $filter) {

  echo 'Filtrando foto <br/>';
  
  if(!$filter) return true;

  if($photo->caption && stripos($photo->caption->text, $filter)) return true;

  if(in_array($filter, $photo->tags)) return true;

  foreach ($photo->comments->data as $key => $comment) {
    if(strpos($comment->text, $filter)) return true;
  }

  echo 'foto no valida: no encontrado texto<br/>';

  return false;
}

?>