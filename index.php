<?php

// Require the config file for paths
require('includes/config.php');

// Require the tile, battle, and field data index file
require('includes/options.php');

// Define the arrays for tiles and battles for the map
$map_offset = array(0, 0);
$map_tiles = array();
$map_battles = array();

// Define the max rows and cols
$row_max = 18;
$col_max = 23;

// Include map layout data from the appropriate grid file
$map_num = !empty($_GET['map']) && is_numeric($_GET['map']) ? $_GET['map'] : 0;
if (!file_exists('maps/map'.$map_num.'.php')){ $map_num = 0; }
if ($map_num !== 0){ include('maps/map'.$map_num.'.php'); }

?>
<!DOCTYPE html>
<html>
<head>
    <title>Overworld Test</title>
    <link type="text/css" rel="stylesheet" href="styles/style.css" />
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
            <a class="button tiles" data-view="tiles">Edit Tiles</a>
            <a class="button battles" data-view="battles">Edit Battles</a>
            <a class="button fields" data-view="fields">Edit Fields</a>
        </div>

    </div>

    <div class="map" data-view="all" data-edit="">
        <div class="wrapper">
            <table class="grid" data-cols="23" data-rows="18">
                <tbody>
                    <?
                    for ($row = 1; $row <= $row_max; $row++){
                        $row2 = $row - $map_offset[1];

                        echo '<tr>';
                        for ($col = 1; $col <= $col_max; $col++){
                            $col2 = $col - $map_offset[0];

                            $cell_markup = '';
                            $cell_title = $col2.'-'.$row2;

                            // Generate markup for any tiles that appear in this cell
                            if (isset($map_tiles[$col2][$row2])){
                                $tile_data = $map_tiles[$col2][$row2];
                                $tile_data = strstr($tile_data, '/') ? explode('/', $tile_data) : array($tile_data);

                                $tile_class = $tile_data[0];
                                $tile_token = $tile_data[0];
                                $cell_markup .= '<div class="sprite tile '.$tile_class.'" data-tile="'.$tile_token.'"></div>';

                            }

                            // Generate markup for any battles that appear in this cell
                            if (isset($map_battles[$col2][$row2])){
                                $battle_data = $map_battles[$col2][$row2];
                                $battle_data = strstr($battle_data, '/') ? explode('/', $battle_data) : array($battle_data);

                                $field_class = $battle_data[0];
                                $field_token = isset($battle_data[1]) ? $battle_data[1] : $field_tokens[0];
                                $field_image = 'http://local.rpg.megamanpoweredup.net/images/fields/'.$field_token.'/battle-field_avatar.png';
                                $cell_markup .= '<img class="sprite field '.$field_class.'" data-field="'.$field_token.'" src="'.$field_image.'" />';
                                $cell_title .= ' | '.$field_token;

                                $battle_class = $battle_data[0];
                                $battle_token = $battle_data[0];
                                $cell_markup .= '<div class="sprite battle '.$battle_class.'" data-battle="'.$battle_token.'"></div>';

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
        </div>
    </div>

    <div class="tools">
        <textarea name="export" class="export" cols="60" rows="10"></textarea>
    </div>

<script type="text/javascript" src="http://local.rpg.megamanpoweredup.net/scripts/jquery.js"></script>
<script type="text/javascript" src="scripts/script.js"></script>
<script type="text/javascript">

// Define base hrefs for loading content
baseHref = '<?= MMRPG_BASE_HREF ?>';
baseAssetHref = '<?= MMRPG_BASE_ASSET_HREF ?>';

// Define the map options we can use in the editor
mapOptions = <?= json_encode($map_options) ?>;

</script>

</body>
</html>