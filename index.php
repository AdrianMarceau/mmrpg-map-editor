<?php

// Require the config file for paths
require('includes/config.php');

// Require the path, battle, and field data index file
require('includes/options.php');
require('includes/functions.php');

// Define the arrays for paths and battles for the map
$map_offset = array(0, 0);
$map_paths = array();
$map_battles = array();

// Define the max rows and cols
$canvas_cols = 22;
$canvas_rows = 16;

// Define properties for the pallet
$pallet_rows = 2;

// Include map layout data from the appropriate grid file
$map_num = !empty($_GET['map']) && is_numeric($_GET['map']) ? $_GET['map'] : 0;
if (!file_exists('maps/map'.$map_num.'.php')){ $map_num = 0; }
if ($map_num !== 0){ include('maps/map'.$map_num.'.php'); }

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
            <?= generate_map_grid($canvas_cols, $pallet_rows, 'pallet') ?>
            <?= generate_map_grid($canvas_cols, $canvas_rows, 'canvas', array('paths' => $map_paths, 'battles' => $map_battles)) ?>
        </div>
    </div>

    <div class="tools">
        <textarea name="export" class="export" cols="60" rows="10" readonly="readonly"></textarea>
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