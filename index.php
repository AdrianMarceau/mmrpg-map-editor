<?php

// Require the global top file
require('top.php');

// Require the path, event, and field sprite options
require('includes/options.php');

// Collect request data from the headers
$this_map_id = !empty($_GET['map']) && is_numeric($_GET['map']) ? $_GET['map'] : 0;

// Define properties for the pallet
$map_pallet_cols = 23;
$map_pallet_rows = 2;

// Define the max rows and cols
$map_canvas_cols = 23;
$map_canvas_rows = 16;

// Start fresh with empty index arrays for paths, events, etc.
$map_canvas_info = array();
$map_canvas_paths = array();
$map_canvas_events = array();

// Include map layout data from the appropriate grid file
if (!empty($this_map_id)){
    if (file_exists('maps/map'.$this_map_id.'.json')){
        $canvas_data_file = 'maps/map'.$this_map_id.'.json';
        load_map_data_from_json($canvas_data_file, $map_canvas_info, $map_canvas_paths, $map_canvas_events);
    } else {
        header('Location: '.MMRPG_BASE_HREF);
        exit();
    }
    //echo('<pre>$map_canvas_paths = '.print_r($map_canvas_paths, true).'</pre>'.PHP_EOL);
    //echo('<pre>$map_canvas_events = '.print_r($map_canvas_events, true).'</pre>'.PHP_EOL);
    //exit();
}

?>
<!DOCTYPE html>
<html>
<head>
    <title><?= !empty($map_canvas_info['name']) ? ucfirst($map_canvas_info['name']).' | ' : '' ?>Overworld Test</title>
    <link type="text/css" rel="stylesheet" href="styles/style.css?<?= MMRPG_CACHE_DATE ?>" />
    <style type="text/css"><?= $grid_object_styles ?></style>
</head>
<body>

    <div class="controls">

        <div class="views">
            <a class="button all active" data-view="all">View All</a>
            <a class="button paths" data-view="paths">Edit Paths</a>
            <a class="button events" data-view="events">Edit Events</a>
            <a class="button fields" data-view="fields">Edit Fields</a>
            <a class="button test" data-view="test">Test</a>
        </div>

        <div class="shift">
            <span class="label">Shift</span>
            <a class="button left" data-dir="left">Left</a>
            <a class="button right" data-dir="right">Right</a>
            <a class="button up" data-dir="up">Up</a>
            <a class="button down" data-dir="down">Down</a>
        </div>

    </div>

    <div class="map" data-view="all" data-edit="" data-name="<?= 'map'.$this_map_id ?>">
        <div class="wrapper">
            <?

            // Print out an empty pallet as a view-all placeholder
            $grid_class = 'pallet none';
            echo generate_map_grid($map_pallet_cols, $map_pallet_rows, $grid_class);

            // Loop through the different option types to create pallets
            foreach ($map_options AS $option_kind => $option_list){

                // Define the objects that should appear on the map
                $key = 0;
                $pallet_sprites = array();
                for ($row = 1; $row <= $map_pallet_rows; $row++){
                    for ($col = 1; $col <= $map_pallet_cols; $col++){
                        $col_row = $col.'-'.$row;
                        if (!isset($option_list[$key])){ break 2; }
                        $path = $option_list[$key];
                        $pallet_sprites[$col_row] = $path;
                        $key++;
                    }
                }

                // Print out the sprite pallet for this option kind
                $grid_class = 'pallet '.$option_kind;
                echo generate_map_grid($map_pallet_cols, $map_pallet_rows, $grid_class, array(
                    $option_kind => $pallet_sprites
                    ), $option_kind);

            }

            // Print out an empty pallet as a test-area placeholder
            $grid_class = 'pallet test';
            echo generate_map_grid($map_pallet_cols, $map_pallet_rows, $grid_class);

            // Print out the canvas with the actual map grid's sprites, if any
            $grid_class = 'canvas';
            echo generate_map_grid($map_canvas_cols, $map_canvas_rows, $grid_class, array(
                'paths' => $map_canvas_paths,
                'events' => $map_canvas_events
                ));

            ?>
        </div>
    </div>

    <div class="tools">
        <textarea id="export-map-json" name="export" class="export" cols="60" rows="10" readonly="readonly"></textarea>
        <button type="button" class="export" onclick="downloadExportMapAsFile()">Export Map as JSON</button>
    </div>

    <div class="version">
        Last Updated <?= preg_replace('/^([0-9]{4})([0-9]{2})([0-9]{2})\-[0-9]+$/', '$1-$2-$3', MMRPG_CACHE_DATE) ?>
    </div>

<script type="text/javascript" src="<?= MMRPG_BASE_ASSET_HREF ?>scripts/jquery.js"></script>
<script type="text/javascript" src="scripts/script.js?<?= MMRPG_CACHE_DATE ?>"></script>
<script type="text/javascript">

// Define base hrefs for loading content
baseHref = '<?= MMRPG_BASE_HREF ?>';
baseAssetHref = '<?= MMRPG_BASE_ASSET_HREF ?>';

// Define the map options we can use in the editor
mapOptions = <?= json_encode($map_options) ?>;

// Provide the MMRPG type, field, etc. index for use in the editor
mmrpgTypeIndex = <?= json_encode($api_type_index) ?>;
mmrpgFieldIndex = <?= json_encode($api_field_index) ?>;

</script>

</body>
</html>