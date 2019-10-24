<?php

// Define a function that generates a table-based map grid with sprites if provided
function generate_map_grid($num_cols, $num_rows, $grid_class = '', $grid_sprites = array(), $option_kind = ''){

    // Pull in global option indexes
    global $map_options;
    global $api_field_index;
    global $grid_styles_cache;

    // Compensate for missing sprite arrays
    if (!is_array($grid_sprites)){ $grid_sprites = array(); }
    if (!isset($grid_sprites['paths'])){ $grid_sprites['paths'] = array(); }
    if (!isset($grid_sprites['battles'])){ $grid_sprites['battles'] = array(); }

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

                        $path_class = $path_data[0];
                        $path_token = $path_data[0];
                        $cell_markup .= '<div class="sprite path '.$path_class.'" data-path="'.$path_token.'"></div>';

                    }

                    // Generate markup for any battles that appear in this cell
                    if (isset($grid_sprites['battles'][$col][$row])){

                        $battle_data = $grid_sprites['battles'][$col][$row];
                        $battle_data = strstr($battle_data, '/') ? explode('/', $battle_data) : array($battle_data);

                        $field_class = $battle_data[0];
                        $field_token = isset($battle_data[1]) ? $battle_data[1] : $map_options['fields'][0];
                        if (!isset($api_field_index[$field_token])){ $field_token = 'intro-field'; }
                        $field_data = !empty($api_field_index[$field_token]) ? $api_field_index[$field_token] : array();
                        if (empty($field_data)){ continue; }
                        $field_type = !empty($field_data['type']) ? $field_data['type'] : 'none';
                        $field_image = MMRPG_BASE_ASSET_HREF.'images/fields/'.$field_token.'/battle-field_avatar.png';
                        $cell_markup .= '<img class="sprite field '.$field_class.'" data-field="'.$field_token.'" data-type="'.$field_type.'" src="'.$field_image.'" />';
                        $cell_title .= ' | '.$field_token;

                        $battle_class = $battle_data[0];
                        $battle_token = $battle_data[0];
                        $cell_markup .= '<div class="sprite battle '.$battle_class.'" data-battle="'.$battle_token.'" data-type="'.$field_type.'"></div>';

                    }

                    // Generate markup for any field that appear in this cell
                    if (isset($grid_sprites['fields'][$col][$row])){

                        $field_data = $grid_sprites['fields'][$col][$row];
                        $field_data = strstr($field_data, '/') ? explode('/', $field_data) : array($field_data);

                        $field_class = 'boss';
                        $field_token = $field_data[0];
                        if (!isset($api_field_index[$field_token])){ $field_token = 'intro-field'; }
                        $field_data = !empty($api_field_index[$field_token]) ? $api_field_index[$field_token] : array();
                        if (empty($field_data)){ continue; }
                        $field_type = !empty($field_data['type']) ? $field_data['type'] : 'none';
                        $field_image = MMRPG_BASE_ASSET_HREF.'images/fields/'.$field_token.'/battle-field_avatar.png';
                        $cell_markup .= '<img class="sprite field '.$field_class.'" data-field="'.$field_token.'" data-type="'.$field_type.'" src="'.$field_image.'" />';
                        $cell_title .= ' | '.$field_token;

                    }

                    echo '<td title="'.$cell_title.'">';
                        echo '<div class="cell" data-col="'.$col.'" data-row="'.$row.'">'.$cell_markup.'</div>';
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