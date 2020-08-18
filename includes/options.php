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
$path_options = array_merge($path_options, array('stud'));
$map_options['paths'] = $path_options;

// Define the different kinds of events on the map
$event_options = array();
$event_options = array_merge($event_options, array('battle-mecha', 'battle-master', 'battle-boss'));
$event_options = array_merge($event_options, array('battle-special-mecha', 'battle-special-master', 'battle-special-boss'));
$event_options = array_merge($event_options, array('origin', 'destination'));
$event_options = array_merge($event_options, array('progress-gate-10', 'progress-gate-20', 'progress-gate-30', 'progress-gate-40', 'progress-gate-50'));
$event_options = array_merge($event_options, array('progress-gate-60', 'progress-gate-70', 'progress-gate-80', 'progress-gate-90', 'progress-gate-100'));
$map_options['events'] = $event_options;

// Define the different type tokens available for events
$api_type_index = get_json_api_data_field(MMRPG_BASE_ASSET_HREF.'api/v2/types/index', 'types');
//die('<pre>$api_type_index = '.print_r($api_type_index, true).'</pre>');
$api_type_tokens = array_keys($api_type_index);
//$api_type_tokens = get_json_api_type(MMRPG_BASE_ASSET_HREF.'api/database/get_types.php', 'type_tokens');
if (!empty($api_type_tokens)){ $type_options = $api_type_tokens; }
else { $type_options = array('intro-type'); }
$map_options['types'] = $type_options;

// Define the different field tokens available for events
$api_field_index = get_json_api_data_field(MMRPG_BASE_ASSET_HREF.'api/v2/fields/index', 'fields');
//die('<pre>$api_field_index = '.print_r($api_field_index, true).'</pre>');
$api_field_tokens = array_keys($api_field_index);
//$api_field_tokens = get_json_api_field(MMRPG_BASE_ASSET_HREF.'api/database/get_fields.php', 'field_tokens');
if (!empty($api_field_tokens)){ $field_options = $api_field_tokens; }
else { $field_options = array('intro-field'); }
$map_options['fields'] = $field_options;
//exit();

// Generate CSS for the various paths, events, fields, and types
$grid_object_styles = array();
foreach ($map_options['paths'] AS $path_option){
    $grid_object_styles[] = '.map .wrapper .cell .sprite.path.'.$path_option.' { background-image: url(images/path_'.$path_option.'.png); }';
}
foreach ($map_options['events'] AS $event_option){
    $grid_object_styles[] = '.map .wrapper .cell .event.'.$event_option.' { background-image: url(images/event_'.$event_option.'.png); }';
    if ($event_option === 'origin'){
        $grid_object_styles[] = '.map[data-view="test"] .wrapper .cell:not(.completed) .sprite.event.'.$event_option.' { background-image: url(images/event_'.$event_option.'-loading.png); }';
    } elseif ($event_option === 'destination'){
        $grid_object_styles[] = '.map[data-view="test"] .wrapper .cell:not(.allowed) .sprite.event.'.$event_option.' { background-image: url(images/event_'.$event_option.'-waiting.png); }';
    } elseif (strstr($event_option, 'progress-gate-')){
        $grid_object_styles[] = '.map[data-view="test"] .wrapper .cell.completed .sprite.event.'.$event_option.' { background-image: url(images/transparent.png); }';
    }
}
foreach ($map_options['types'] AS $type_option){
    $type_colour = $api_type_index[$type_option]['colour_light'];
    $grid_object_styles[] = '.map .wrapper .grid.pallet.fields .cell .sprite.field[data-type="'.$type_option.'"] { border-color: rgb('.implode(',', $type_colour).'); }';
    $grid_object_styles[] = '.map .wrapper .cell .sprite.event[data-type="'.$type_option.'"]:after { background-image: url(images/type_'.$type_option.'.png); }';
}
foreach ($map_options['fields'] AS $field_option){
    $field_data = $api_field_index[$field_option];
    $field_image_url = MMRPG_BASE_ASSET_HREF.'images/fields/'.$field_option.'/battle-field_avatar.png';
    $grid_object_styles[] = '.map .wrapper .cell .sprite.field[data-field="'.$field_option.'"] { background-image: url('.$field_image_url.'); }';
}
$grid_object_styles = PHP_EOL.implode(PHP_EOL, $grid_object_styles).PHP_EOL;

?>