<?php

// Define a function for loading map data from a JSON file
function load_map_data_from_json($canvas_data_file,
    &$map_canvas_info,
    &$map_canvas_paths,
    &$map_canvas_events
    ){
    // Attempt to load the json data file
    $canvas_data_json = file_get_contents($canvas_data_file);
    //echo('<pre>$canvas_data_json = '.print_r($canvas_data_json, true).'</pre>');
    if (empty($canvas_data_json) || substr($canvas_data_json, 0, 1) !== '{'){ return false; }
    // Attempt to parse the json data file into an object
    $canvas_data_object = json_decode($canvas_data_json, true);
    //echo('<pre>$canvas_data_object = '.print_r($canvas_data_object, true).'</pre>');
    if (empty($canvas_data_object)){ return false; }
    // Load info data if it exists in the data object
    if (!empty($canvas_data_object['name'])){ $map_canvas_info['name'] = $canvas_data_object['name']; }
    // Load path data if it exists in the data object
    if (!empty($canvas_data_object['paths'])){
        foreach ($canvas_data_object['paths'] AS $col_row => $path_token){
            if (!strstr($col_row, '-')){ continue; }
            list($col, $row) = explode('-', $col_row);
            $map_canvas_paths[$col][$row] = $path_token;
        }
    }
    // Load event data if it exists in the data object
    if (!empty($canvas_data_object['events'])){
        foreach ($canvas_data_object['events'] AS $col_row => $event_token){
            if (!strstr($col_row, '-')){ continue; }
            list($col, $row) = explode('-', $col_row);
            $map_canvas_events[$col][$row] = $event_token;
            if (!empty($canvas_data_object['fields'][$col_row])){
                $field_token = $canvas_data_object['fields'][$col_row];
                $map_canvas_events[$col][$row] .= '/'.$field_token;
            }
        }
    }
}

// Define a function that generates a table-based map grid with sprites if provided
function generate_map_grid($num_cols, $num_rows, $grid_class = '', $grid_sprites = array(), $option_kind = ''){

    // Pull in global option indexes
    global $map_options;
    global $api_field_index;
    global $grid_styles_cache;

    // Compensate for missing sprite arrays
    if (!is_array($grid_sprites)){ $grid_sprites = array(); }
    if (!isset($grid_sprites['paths'])){ $grid_sprites['paths'] = array(); }
    if (!isset($grid_sprites['events'])){ $grid_sprites['events'] = array(); }

    // Calculate map width in pixels (with all cells + padding)
    $cell_width = 40;
    $border_width = 1;
    $map_grid_width = ($num_cols * $cell_width) + ($border_width * 2);

    // Generate markup for this map grid with any sprite data
    ob_start();
    ?>
    <table class="grid <?= $grid_class ?>" data-cols="<?= $num_cols ?>" data-rows="<?= $num_rows ?>" <?= !empty($option_kind) ? 'data-kind="'.$option_kind.'"' : '' ?> style="width: <?= $map_grid_width.'px' ?>;">
        <tbody>
            <?
            for ($row = 1; $row <= $num_rows; $row++){
                echo '<tr>';
                for ($col = 1; $col <= $num_cols; $col++){

                    $cell_markup = '';
                    $cell_title = $col.'-'.$row;

                    // Generate markup for any paths that appear in this cell
                    if (isset($grid_sprites['paths'][$col][$row])){

                        $path_data = $grid_sprites['paths'][$col][$row];
                        $path_data = strstr($path_data, '/') ? explode('/', $path_data) : array($path_data);

                        if (strstr($grid_class, 'pallet')){
                            $cell_title = $path_data[0];
                        }

                        $path_class = $path_data[0];
                        $path_token = $path_data[0];
                        $cell_markup .= '<div class="sprite path '.$path_class.'" data-path="'.$path_token.'"></div>';

                    }

                    // Generate markup for any events that appear in this cell
                    if (isset($grid_sprites['events'][$col][$row])){

                        $event_data = $grid_sprites['events'][$col][$row];
                        $event_data = strstr($event_data, '/') ? explode('/', $event_data) : array($event_data);

                        $field_type = '';
                        if ($event_data[0] !== 'origin'
                            && $event_data[0] !== 'destination'
                            && !strstr($event_data[0], 'progress-gate-')){
                            $field_class = $event_data[0];
                            $field_token = isset($event_data[1]) ? $event_data[1] : $map_options['fields'][0];
                            if (!isset($api_field_index[$field_token])){ $field_token = 'intro-field'; }
                            $field_info = !empty($api_field_index[$field_token]) ? $api_field_index[$field_token] : array();
                            if (empty($field_info)){ continue; }
                            $field_type = !empty($field_info['type']) ? $field_info['type'] : 'none';
                            $field_image = MMRPG_BASE_ASSET_HREF.'images/fields/'.$field_token.'/battle-field_avatar.png';
                            //$cell_markup .= '<img class="sprite field '.$field_class.'" data-field="'.$field_token.'" data-type="'.$field_type.'" src="'.$field_image.'" />';
                            $cell_markup .= '<div class="sprite field '.$field_class.'" data-field="'.$field_token.'" data-type="'.$field_type.'"></div>';
                            $cell_title .= ' | '.$field_token;
                        }

                        if (strstr($grid_class, 'pallet')){
                            $cell_title = $event_data[0];
                        }

                        $event_class = $event_data[0];
                        $event_token = $event_data[0];
                        $cell_markup .= '<div class="sprite event '.$event_class.'" data-event="'.$event_token.'" data-type="'.$field_type.'"></div>';

                    }

                    // Generate markup for any field that appear in this cell
                    if (isset($grid_sprites['fields'][$col][$row])){

                        $field_data = $grid_sprites['fields'][$col][$row];
                        $field_data = strstr($field_data, '/') ? explode('/', $field_data) : array($field_data);

                        $field_class = 'battle-boss';
                        $field_token = $field_data[0];
                        if (!isset($api_field_index[$field_token])){ $field_token = 'intro-field'; }
                        $field_info = !empty($api_field_index[$field_token]) ? $api_field_index[$field_token] : array();
                        if (empty($field_info)){ continue; }
                        $field_type = !empty($field_info['type']) ? $field_info['type'] : 'none';
                        $field_image = MMRPG_BASE_ASSET_HREF.'images/fields/'.$field_token.'/battle-field_avatar.png';
                        //$cell_markup .= '<img class="sprite field '.$field_class.'" data-field="'.$field_token.'" data-type="'.$field_type.'" src="'.$field_image.'" />';
                        $cell_markup .= '<div class="sprite field '.$field_class.'" data-field="'.$field_token.'" data-type="'.$field_type.'"></div>';
                        $cell_title .= ' | '.$field_token;

                        if (strstr($grid_class, 'pallet')){
                            $cell_title = $field_data[0];
                        }

                    }

                    echo '<td title="'.$cell_title.'">';
                        echo '<div class="cell" data-col="'.$col.'" data-row="'.$row.'" data-col-row="'.$col.'-'.$row.'">'.$cell_markup.'</div>';
                    echo '</td>';

                }
                echo '</tr>';

            }
            ?>
        </tbody>
    </table>
    <?
    $map_grid_markup = ob_get_clean();

    // Return generated grid markup
    return $map_grid_markup;

}

// Method: POST, PUT, GET etc
// Data: array("param" => "value") ==> index.php?param=value
// via https://stackoverflow.com/a/9802854/1876397
function call_api($url, $data = false, $method = 'post'){
    $curl = curl_init();
    switch ($method){
        case "POST": {
            curl_setopt($curl, CURLOPT_POST, 1);
            if ($data){ curl_setopt($curl, CURLOPT_POSTFIELDS, $data); }
            break;
        }
        case "PUT": {
            curl_setopt($curl, CURLOPT_PUT, 1);
            break;
        }
        default:{
            if ($data){ $url = sprintf("%s?%s", $url, http_build_query($data)); }
            break;
        }
    }
    //curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC); //optional
    //curl_setopt($curl, CURLOPT_USERPWD, "username:password"); //optional
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec($curl);
    curl_close($curl);
    return $result;
}

// Define a function for calling an API and returning JSON data
function call_json_api($url, $data = false, $method = 'post'){
    $api_data = call_api($url, $data, $method);
    if (empty($api_data)){ return false; }
    if (substr($api_data, 0, 1) === '{'){ $json_data = json_decode($api_data, true); }
    else { $json_data = array('response' => $api_data); }
    return $json_data;
}

// Define a function for getting a specific field from a JSON api
function get_json_api_field($url, $field, $data = false, $method = 'post'){
    $json_data = call_json_api($url, $data, $method);
    if (empty($json_data) || !isset($json_data[$field])){ return false; }
    return $json_data[$field];

}

// Define a function for calling an API and returning JSON data
function get_json_api_data($url, $data = false, $method = 'post'){
    $json_data = call_json_api($url, $data, $method);
    if (empty($json_data)){ return false; }
    elseif ($json_data['status'] !== 'success'){ return false; }
    elseif (!isset($json_data['data'])){ return false; }
    return $json_data['data'];
}

// Define a function for calling an API and returning JSON data
function get_json_api_data_field($url, $field, $data = false, $method = 'post'){
    $json_data = get_json_api_data($url, $data, $method);
    if (!isset($json_data[$field])){ return false; }
    return $json_data[$field];
}

?>