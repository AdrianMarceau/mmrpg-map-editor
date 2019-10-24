<?php

// Define an array to hold all the map options
$map_options = array();

// Define the different kinds of paths on the map
$path_options = array();
$path_options = array_merge($path_options, array('cross'));
$path_options = array_merge($path_options, array('v-line', 'h-line'));
$path_options = array_merge($path_options, array('t-stub', 'b-stub', 'r-stub', 'l-stub'));
$path_options = array_merge($path_options, array('tl-joint', 'tr-joint', 'bl-joint', 'br-joint'));
$path_options = array_merge($path_options, array('b-tee', 'r-tee', 'l-tee', 't-tee'));
$map_options['paths'] = $path_options;

// Define the different kinds of events on the map
$event_options = array();
$event_options = array_merge($event_options, array('start', 'battle_mecha', 'battle_master', 'battle_boss'));
$map_options['battles'] = $event_options;

// Define the different type tokens available for battles
$api_type_index = get_json_api_data_field(MMRPG_BASE_ASSET_HREF.'api/v2/types/index', 'types');
//die('<pre>$api_type_index = '.print_r($api_type_index, true).'</pre>');
$api_type_tokens = array_keys($api_type_index);
//$api_type_tokens = get_json_api_type(MMRPG_BASE_ASSET_HREF.'api/database/get_types.php', 'type_tokens');
if (!empty($api_type_tokens)){ $type_options = $api_type_tokens; }
else { $type_options = array('intro-type'); }
$map_options['types'] = $type_options;

// Define the different field tokens available for battles
$api_field_index = get_json_api_data_field(MMRPG_BASE_ASSET_HREF.'api/v2/fields/index', 'fields');
//die('<pre>$api_field_index = '.print_r($api_field_index, true).'</pre>');
$api_field_tokens = array_keys($api_field_index);
//$api_field_tokens = get_json_api_field(MMRPG_BASE_ASSET_HREF.'api/database/get_fields.php', 'field_tokens');
if (!empty($api_field_tokens)){ $field_options = $api_field_tokens; }
else { $field_options = array('intro-field'); }
$map_options['fields'] = $field_options;

// Generate CSS for the various paths, battles, fields, and types
$grid_object_styles = array();
foreach ($map_options['paths'] AS $path_option){
    $grid_object_styles[] = '.map .wrapper .cell .path.'.$path_option.' { background-image: url(images/path_'.$path_option.'.png); }';
}
foreach ($map_options['battles'] AS $battle_option){
    $grid_object_styles[] = '.map .wrapper .cell .battle.'.$battle_option.' { background-image: url(images/event_battle-'.$battle_option.'.png); }';
}
foreach ($map_options['types'] AS $type_option){
    $grid_object_styles[] = '.map .wrapper .cell .battle[data-type="'.$type_option.'"]:after { background-image: url(images/type_'.$type_option.'.png); }';
}
$grid_object_styles = PHP_EOL.implode(PHP_EOL, $grid_object_styles).PHP_EOL;

?>