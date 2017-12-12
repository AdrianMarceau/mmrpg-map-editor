<?php

// Require the config file for paths
require('includes/config.php');

// Require the path, battle, and field data index file
require('includes/functions.php');
require('includes/options.php');

// Collect request data from the headers
$this_map_id = !empty($_GET['map']) && is_numeric($_GET['map']) ? $_GET['map'] : 0;

// Define properties for the pallet
$map_pallet_cols = 23;
$map_pallet_rows = 2;

// Define the max rows and cols
$map_canvas_cols = 23;
$map_canvas_rows = 16;

// Include map layout data from the appropriate grid file
$map_canvas_paths = array();
$map_canvas_battles = array();
if (file_exists('maps/map'.$this_map_id.'.php')){
    $canvas_data_file = 'maps/map'.$this_map_id.'.php';
    require($canvas_data_file);
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Overworld Test</title>
    <link type="text/css" rel="stylesheet" href="styles/style.css?<?= MMRPG_CACHE_DATE ?>" />
</head>
<body>

    <div class="controls">

        <div class="shift">
            <span class="label">Shift</span>
            <a class="button left" data-dir="left">Left</a>
            <a class="button right" data-dir="right">Right</a>
            <a class="button up" data-dir="up">Up</a>
            <a class="button down" data-dir="down">Down</a>
        </div>

        <div class="views">
            <a class="button all active" data-view="all">View All</a>
            <a class="button paths" data-view="paths">Edit Paths</a>
            <a class="button battles" data-view="battles">Edit Battles</a>
            <a class="button fields" data-view="fields">Edit Fields</a>
        </div>

    </div>

    <div class="map" data-view="all" data-edit="">
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
                        if (!isset($option_list[$key])){ break 2; }
                        $path = $option_list[$key];
                        $pallet_sprites[$col][$row] = $path;
                        $key++;
                    }
                }

                // Print out the sprite pallet for this option kind
                $grid_class = 'pallet '.$option_kind;
                echo generate_map_grid($map_pallet_cols, $map_pallet_rows, $grid_class, array(
                    $option_kind => $pallet_sprites
                    ));

            }

            // Print out the canvas with the actual map grid's sprites, if any
            $grid_class = 'canvas';
            echo generate_map_grid($map_canvas_cols, $map_canvas_rows, $grid_class, array(
                'paths' => $map_canvas_paths,
                'battles' => $map_canvas_battles
                ));

            ?>
        </div>
    </div>

    <div class="tools">
        <textarea name="export" class="export" cols="60" rows="10" readonly="readonly"></textarea>
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

</script>

</body>
</html>