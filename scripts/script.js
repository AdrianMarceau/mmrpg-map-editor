
// Predefine var for key dom elements
var $map;
var $canvas;
var $pallet;
var $shift;
var $views;
var $tools;
var $export;

// Predefine object vars for map settings
var gridSize;
var mapOptions;
var palletCurrent;

// Predefine default base paths for map assets
var baseHref = 'http://mmrpg.map.editor/';
var baseAssetHref = 'http://rpg.megamanpoweredup.net/';

// Wait for document ready before delegating events
$(document).ready(function(){

    // Define references to key dom elements
    $map = $('.map');
    $canvas = $('.grid.canvas', $map);
    $pallet = $('.grid.pallet', $map);
    $shift = $('.shift');
    $views = $('.views');
    $tools = $('.tools');
    $export = $('.export', $tools);

    // Collect the grid size from the canvas grid
    gridSize = {
        cols: parseInt($canvas.attr('data-cols')),
        rows: parseInt($canvas.attr('data-rows'))
        };

    // Collect first in each pallet as current option
    palletCurrent = {};
    $pallet.filter('[data-kind]').each(function(){
        var $this = $(this);
        var kind = $this.attr('data-kind');
        var kind2 = kind.replace(/ies$/i, 'y').replace(/s$/i, '');
        var $first = $this.find('[data-'+kind2+']').first();
        var value = $first.attr('data-'+kind2);
        palletCurrent[kind] = value;
        });

    // Define click events for the SHIFT BUTTONS
    $('.button[data-dir]', $shift).bind('click', function(e){
        e.preventDefault();
        var $button = $(this);
        var dir = $button.attr('data-dir');
        shiftSprites(dir);
        });

    // Define the click events for the VIEW BUTTONS
    $('.button[data-view]', $views).bind('click', function(e){
        e.preventDefault();
        var $button = $(this);
        var view = $button.attr('data-view');
        $('.button[data-view]', $views).removeClass('active');
        $button.addClass('active');
        $map.attr('data-view', view);
        if (view != 'all'){
            $map.attr('data-edit', view);
            $targetPallet = $pallet.filter('.'+view);
            if (!$targetPallet.find('.cell.active').length){
                $targetCells = $targetPallet.find('.cell');
                $targetCells.removeClass('active');
                $targetCells.first().addClass('active');
                }
            } else {
            $map.attr('data-edit', '');
            }
        });

    // Define the click events for PALLET CELLS
    $('.cell[data-col][data-row]', $pallet).bind('click', function(e){
        e.preventDefault();
        // Collect refs to the cell and parent then look for sprites
        var $cell = $(this);
        var $parent = $cell.closest('.grid[data-kind]');
        var $sprites = $cell.find('.sprite');
        if ($sprites.length){
            // Collect the singlular and player kind for this cell
            var kind = $parent.attr('data-kind');
            var kind2 = kind.replace(/ies$/i, 'y').replace(/s$/i, '');
            // Remove active class from any sibling cells then add to current
            $('.cell[data-col][data-row]', $parent).removeClass('active');
            $cell.addClass('active');
            // Update the current pallet selection in the global settings array
            var token = $sprites.filter('[data-'+kind2+']').attr('data-'+kind2);
            palletCurrent[kind] = token;
            // If this is a field change, automatically update anything the battle pallet
            if (kind === 'fields'){
                $pallet.filter('[data-kind="battles"]').find('.sprite.battle').each(function(index){
                    var $sprite = $(this);
                    var $cell = $sprite.closest('.cell');
                    changeCellField($cell, token, false);
                    });
                }
            }
        });

    // Define the click events for CANVAS CELLS
    $('.cell[data-col][data-row]', $canvas).bind('click', function(e){
        e.preventDefault();
        var $cell = $(this);
        var edit = $map.attr('data-edit');
        if (edit === 'paths'){ changeCellPath($cell); }
        else if (edit === 'battles'){ changeCellBattle($cell); }
        else if (edit === 'fields'){ changeCellField($cell); }
        else { return false; }
        });

    // Automatically export the map on init
    exportMap();

});

// Define a function for shifting all canvas sprites in a direction
function shiftSprites(dir){
    if (dir === 'left'){ return shiftSpritesLeft(); }
    else if (dir === 'right'){ return shiftSpritesRight(); }
    else if (dir === 'up'){ return shiftSpritesUp(); }
    else if (dir === 'down'){ return shiftSpritesDown(); }
}

// Define a function for shifting all canvas sprites left
function shiftSpritesLeft(){
    if (!canShiftMap('left')){ return false; }
    var start = 2;
    var stop = gridSize.cols;
    for (var col = start; col <= stop; col++){
        var newCol = col - 1;
        $sprites = getCellSpritesByCol(col);
        $sprites.each(function(){
            var $sprite = $(this);
            var row = parseInt($sprite.closest('.cell').attr('data-row'));
            var $newCell = $('.cell[data-col="'+newCol+'"][data-row="'+row+'"]', $canvas);
            $sprite.appendTo($newCell);
            });
    }
    queueExportMap();
    return true;
}

// Define a function for shifting all canvas sprites right
function shiftSpritesRight(){
    if (!canShiftMap('right')){ return false; }
    var start = gridSize.cols - 1;
    var stop = 1;
    for (var col = start; col >= stop; col--){
        var newCol = col + 1;
        $sprites = getCellSpritesByCol(col);
        $sprites.each(function(){
            var $sprite = $(this);
            var row = parseInt($sprite.closest('.cell').attr('data-row'));
            var $newCell = $('.cell[data-col="'+newCol+'"][data-row="'+row+'"]', $canvas);
            $sprite.appendTo($newCell);
            });
    }
    queueExportMap();
    return true;
}

// Define a function for shifting all canvas sprites up
function shiftSpritesUp(){
    if (!canShiftMap('up')){ return false; }
    var start = 2;
    var stop = gridSize.rows;
    for (var row = start; row <= stop; row++){
        var newRow = row - 1;
        $sprites = getCellSpritesByRow(row);
        $sprites.each(function(){
            var $sprite = $(this);
            var col = parseInt($sprite.closest('.cell').attr('data-col'));
            var $newCell = $('.cell[data-col="'+col+'"][data-row="'+newRow+'"]', $canvas);
            $sprite.appendTo($newCell);
            });
    }
    queueExportMap();
    return true;
}

// Define a function for shifting all canvas sprites down
function shiftSpritesDown(){
    if (!canShiftMap('down')){ return false; }
    var start = gridSize.rows - 1;
    var stop = 1;
    for (var row = start; row >= stop; row--){
        var newRow = row + 1;
        $sprites = getCellSpritesByRow(row);
        $sprites.each(function(){
            var $sprite = $(this);
            var col = parseInt($sprite.closest('.cell').attr('data-col'));
            var $newCell = $('.cell[data-col="'+col+'"][data-row="'+newRow+'"]', $canvas);
            $sprite.appendTo($newCell);
            });
    }
    queueExportMap();
    return true;
}

// Define a function for collecting all canvas cells in a column
function getCellsByCol(col){
    return $('.cell[data-col="'+col+'"]', $canvas);
}

// Define a function for collecting all canvas cell sprites in a column
function getCellSpritesByCol(col){
    var $cells = getCellsByCol(col);
    return $cells.find('.sprite');
}

// Define a function for collecting all canvas cells in a row
function getCellsByRow(row){
    return $('.cell[data-row="'+row+'"]', $canvas);
}

// Define a function for collecting all canvas cell sprites in a row
function getCellSpritesByRow(row){
    var $cells = getCellsByRow(row);
    return $cells.find('.sprite');
}

// Define a function for checking if map can shift in a direction
function canShiftMap(dir){
    if (dir === 'left'){ return canShiftMapLeft(); }
    else if (dir === 'right'){ return canShiftMapRight(); }
    else if (dir === 'up'){ return canShiftMapUp(); }
    else if (dir === 'down'){ return canShiftMapDown(); }
    else { return false; }
}

// Define a function for checking if the map can be shifted left
function canShiftMapLeft(){
    var $sprites = getCellSpritesByCol(1);
    return $sprites.length ? false : true;
}

// Define a function for checking if the map can be shifted right
function canShiftMapRight(){
    var $sprites = getCellSpritesByCol(gridSize.cols);
    return $sprites.length ? false : true;
}

// Define a function for checking if the map can be shifted up
function canShiftMapUp(){
    var $sprites = getCellSpritesByRow(1);
    return $sprites.length ? false : true;
}

// Define a function for checking if the map can be shifted down
function canShiftMapDown(){
    var $sprites = getCellSpritesByRow(gridSize.rows);
    return $sprites.length ? false : true;
}

// Define a function for editing cell's path to something else
function changeCellPath($cell, newPath, exportMap){

    // Compensate for missing function arguments or break if required
    if (typeof $cell !== 'object'){ return false; }
    if (typeof newPath !== 'string'){ newPath = ''; }
    if (typeof exportMap !== 'boolean'){ exportMap = true; }

    // Insert a new path sprite, unless one already exists then remove it
    var $path = $cell.find('.path[data-path]');
    var currPath = $path.length ? $path.attr('data-path') : '';
    var newPath = newPath.length ? newPath : palletCurrent['paths'];
    if ($path.length){ $path.remove(); }
    if (!(currPath.length && currPath === newPath)){
        $path = $('<div class="sprite path '+newPath+'" data-path="'+newPath+'"></div>');
        $path.prependTo($cell);
        }

    // Queue up an update if any changes have been mode
    if (exportMap){ queueExportMap(); }

}

// Define a function for editing cell's battle to something else
function changeCellBattle($cell, newBattle, exportMap){

    // Compensate for missing function arguments or break if required
    if (typeof $cell !== 'object'){ return false; }
    if (typeof newBattle !== 'string'){ newBattle = ''; }
    if (typeof exportMap !== 'boolean'){ exportMap = true; }

    // Insert a new battle sprite, unless one already exists then remove it
    var $battle = $cell.find('.battle[data-battle]');
    var $field = $cell.find('.field[data-field]');
    var currBattle = $battle.length ? $battle.attr('data-battle') : '';
    var newField = palletCurrent['fields'];
    var newBattle = newBattle.length ? newBattle : palletCurrent['battles'];
    if ($battle.length){ $battle.remove(); }
    if ($field.length){ $field.remove(); }
    if (!(currBattle.length && currBattle === newBattle)){
        var fieldImage = baseAssetHref+'images/fields/'+newField+'/battle-field_avatar.png';
        $field = $('<img class="sprite field '+newBattle+' '+newField+'" data-field="'+newField+'" src="'+fieldImage+'" />');
        $field.appendTo($cell);
        $battle = $('<div class="sprite battle '+newBattle+'" data-battle="'+newBattle+'"></div>');
        $battle.appendTo($cell);
        }

    // Queue up an update if any changes have been mode
    if (exportMap){ queueExportMap(); }

}

// Define a function for editing cell's field to something else
function changeCellField($cell, newField, exportMap){

    // Compensate for missing function arguments or break if required
    if (typeof $cell !== 'object'){ return false; }
    if (typeof newField !== 'string'){ newField = ''; }
    if (typeof exportMap !== 'boolean'){ exportMap = true; }

    // Replace the previous field sprite if one exists, else do nothing
    var $battle = $cell.find('.battle[data-battle]');
    var $field = $cell.find('.field[data-field]');
    if ($battle.length && $field.length){

        // Remove the previous field and prepend a new one
        $field.remove();
        var battleToken = $battle.attr('data-battle');
        var fieldToken = newField.length ? newField : palletCurrent['fields'];
        var fieldImage = baseAssetHref+'images/fields/'+fieldToken+'/battle-field_avatar.png';
        $field = $('<img class="sprite field '+battleToken+' '+fieldToken+'" data-field="'+fieldToken+'" src="'+fieldImage+'" />');
        $field.insertBefore($battle);

        // Update the tooltip title of the parent cell
        var col = parseInt($cell.attr('data-col'));
        var row = parseInt($cell.attr('data-row'));
        var title = name+' | '+col+'-'+row;
        $cell.attr('title', title);

        }

    // Queue up an update if any changes have been mode
    if (exportMap){ queueExportMap(); }

}

// Define a function for exporting the map to PHP variables
function exportMap(){

    var mapPaths = [];
    var mapBattles = [];
    $('.cell[data-col][data-row]', $canvas).each(function(index){

        var $cell = $(this);
        var col = parseInt($cell.attr('data-col'));
        var row = parseInt($cell.attr('data-row'));
        var name = col+'-'+row;

        var $path = $('.path[data-path]', $cell);
        var $battle = $('.battle[data-battle]', $cell);
        var $field = $('.field[data-field]', $cell);

        if ($path.length){
            var pathToken = $path.attr('data-path');
            mapPaths.push('$map_canvas_paths['+col+']['+row+'] = \''+pathToken+'\';');
            }

        if ($battle.length && $field.length){
            var battleToken = $battle.attr('data-battle');
            var fieldToken = $field.attr('data-field');
            mapBattles.push('$map_canvas_battles['+col+']['+row+'] = \''+battleToken+'/'+fieldToken+'\';');
            }

        });

    var exportString = '';
    exportString += '<\?php \n\n';

    if (mapPaths.length){
        exportString += '// Define the paths that should appear on the map (x'+mapPaths.length+') \n';
        exportString += mapPaths.join('\n');
        exportString += '\n\n';
        }
    if (mapBattles.length){
        exportString += '// Define the battles that should appear on the map (x'+mapBattles.length+') \n';
        exportString += mapBattles.join('\n');
        exportString += '\n\n';
        }

    exportString += '\?>';
    exportString = exportString.replace(/\s+$/, '');

    $export.val(exportString);

    $export.animate({borderColor:'green'},600,'swing', function(){ $(this).css({borderColor:''}); });


}

// Define a function for queueing up a map export when ready
var exportMapTimeout;
function queueExportMap(){
    if (typeof exportMapTimeout !== 'undefined'){ clearTimeout(exportMapTimeout); }
    exportMapTimeout = setTimeout(function(){ exportMap(); }, 300);
}