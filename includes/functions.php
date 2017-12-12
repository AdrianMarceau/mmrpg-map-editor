<?php

// Define a function that generates a table-based map grid with sprites if provided
function generate_map_grid($num_cols, $num_rows, $grid_class = '', $grid_sprites = array()){

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
    <table class="grid <?= $grid_class ?>" data-cols="<?= $num_cols ?>" data-rows="<?= $num_rows ?>" style="width: <?= $map_grid_width.'px' ?>;">
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
                        $field_token = isset($battle_data[1]) ? $battle_data[1] : $field_tokens[0];
                        $field_image = MMRPG_BASE_ASSET_HREF.'images/fields/'.$field_token.'/battle-field_avatar.png';
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
    <?
    $map_grid_markup = ob_get_clean();

    // Return generated grid markup
    return $map_grid_markup;

}

?>