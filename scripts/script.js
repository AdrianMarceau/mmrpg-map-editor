

var $map;
var $grid;
var $pallet;
var $shift;
var $views;
var $tools;
var $export;

var gridSize;
var mapOptions;

var baseHref = 'http://mmrpg.map.editor/';
var baseAssetHref = 'http://rpg.megamanpoweredup.net/';

$(document).ready(function(){

    $map = $('.map');

    $grid = $('.grid.canvas', $map);
    $pallet = $('.grid.pallet', $map);

    gridSize = {
        cols: parseInt($grid.attr('data-cols')),
        rows: parseInt($grid.attr('data-rows'))
        };

    if (typeof assetURL !== 'string'){}

    $shift = $('.shift');
    $views = $('.views');
    $tools = $('.tools');
    $export = $('.export', $tools);

    $('.button[data-dir]', $shift).bind('click', function(e){
        e.preventDefault();
        var $button = $(this);
        var dir = $button.attr('data-dir');
        shiftSprites(dir);
        });

    $('.button[data-view]', $views).bind('click', function(e){
        e.preventDefault();
        var $button = $(this);
        var view = $button.attr('data-view');
        $('.button[data-view]', $views).removeClass('active');
        $button.addClass('active');
        $map.attr('data-view', view);
        if (view != 'all'){ $map.attr('data-edit', view); }
        else { $map.attr('data-edit', ''); }
        });


    $('.cell[data-col][data-row]', $grid).bind('click', function(e){
        e.preventDefault();
        var $cell = $(this);
        var edit = $map.attr('data-edit');
        if (edit === 'paths'){ changeCellPath($cell); }
        else if (edit === 'battles'){ changeCellBattle($cell); }
        else if (edit === 'fields'){ changeCellField($cell); }
        else { return false; }
    });

    exportMap();

    //console.log('mapOptions = ', mapOptions);
    //console.log('----------');

});

function shiftSprites(dir){
    console.log('shiftSprites('+dir+')');
    if (dir === 'left'){ return shiftSpritesLeft(); }
    else if (dir === 'right'){ return shiftSpritesRight(); }
    else if (dir === 'up'){ return shiftSpritesUp(); }
    else if (dir === 'down'){ return shiftSpritesDown(); }
}

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
            var $newCell = $('.cell[data-col="'+newCol+'"][data-row="'+row+'"]', $grid);
            $sprite.appendTo($newCell);
            });
    }
    queueExportMap();
    return true;
}
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
            var $newCell = $('.cell[data-col="'+newCol+'"][data-row="'+row+'"]', $grid);
            $sprite.appendTo($newCell);
            });
    }
    queueExportMap();
    return true;
}
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
            var $newCell = $('.cell[data-col="'+col+'"][data-row="'+newRow+'"]', $grid);
            $sprite.appendTo($newCell);
            });
    }
    queueExportMap();
    return true;
}
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
            var $newCell = $('.cell[data-col="'+col+'"][data-row="'+newRow+'"]', $grid);
            $sprite.appendTo($newCell);
            });
    }
    queueExportMap();
    return true;
}

function getCellsByCol(col){
    return $('.cell[data-col="'+col+'"]', $grid);
}
function getCellSpritesByCol(col){
    var $cells = getCellsByCol(col);
    return $cells.find('.sprite');
}
function getCellsByRow(row){
    return $('.cell[data-row="'+row+'"]', $grid);
}
function getCellSpritesByRow(row){
    var $cells = getCellsByRow(row);
    return $cells.find('.sprite');
}

function canShiftMap(dir){
    if (dir === 'left'){ return canShiftMapLeft(); }
    else if (dir === 'right'){ return canShiftMapRight(); }
    else if (dir === 'up'){ return canShiftMapUp(); }
    else if (dir === 'down'){ return canShiftMapDown(); }
    else { return false; }
}
function canShiftMapLeft(){
    var $sprites = getCellSpritesByCol(1);
    return $sprites.length ? false : true;
}
function canShiftMapRight(){
    var $sprites = getCellSpritesByCol(gridSize.cols);
    return $sprites.length ? false : true;
}
function canShiftMapUp(){
    var $sprites = getCellSpritesByRow(1);
    return $sprites.length ? false : true;
}
function canShiftMapDown(){
    var $sprites = getCellSpritesByRow(gridSize.rows);
    return $sprites.length ? false : true;
}

// Define a function for editing cell's path to something else
function changeCellPath($cell, newPath){

    var mapChanged = false;

    var $path = $cell.find('.path[data-path]');

    if ($path.length){

        // Path already exists, scroll through options
        var pathToken = $path.attr('data-path');
        var pathTokenKey = mapOptions['paths'].indexOf(pathToken);
        var pathTokenMaxKey = mapOptions['paths'].length - 1;
        //console.log('clicked a '+pathToken+' path (key '+pathTokenKey+' of max '+pathTokenMaxKey+')');
        if (pathTokenKey + 1 <= pathTokenMaxKey){
            var newPathTokenKey = pathTokenKey + 1;
            var newPathToken = mapOptions['paths'][newPathTokenKey];
            //console.log('should be changed to '+newPathToken+' (key '+newPathTokenKey+')');
            $path.removeClass(pathToken).addClass(newPathToken).attr('data-path', newPathToken);
            mapChanged = true;
            } else {
            $path.remove();
            mapChanged = true;
            }

        } else {

        // Path doesn't exist, let's create one now
        var pathToken = mapOptions['paths'][0];
        $path = $('<div class="sprite path '+pathToken+'" data-path="'+pathToken+'"></div>');
        $path.prependTo($cell);
        mapChanged = true;

        }

    // Queue up an update if any changes have been mode
    if (mapChanged === true){ queueExportMap(); }

}

// Define a function for editing cell's battle to something else
function changeCellBattle($cell, newPath){

    var mapChanged = false;

    var $battle = $cell.find('.battle[data-battle]');
    var $field = $cell.find('.field[data-field]');

    if ($battle.length){

        // Battle already exists, scroll through options
        var battleToken = $battle.attr('data-battle');
        var battleTokenKey = mapOptions['battles'].indexOf(battleToken);
        var battleTokenMaxKey = mapOptions['battles'].length - 1;
        //console.log('clicked a '+battleToken+' battle (key '+battleTokenKey+' of max '+battleTokenMaxKey+')');
        if (battleTokenKey + 1 <= battleTokenMaxKey){
            var newBattleTokenKey = battleTokenKey + 1;
            var newBattleToken = mapOptions['battles'][newBattleTokenKey];
            //console.log('should be changed to '+newBattleToken+' (key '+newBattleTokenKey+')');
            $battle.removeClass(battleToken).addClass(newBattleToken).attr('data-battle', newBattleToken);
            if ($field.length){ $field.removeClass(battleToken).addClass(newBattleToken); }
            mapChanged = true;
            } else {
            $battle.remove();
            if ($field.length){ $field.remove(); }
            mapChanged = true;
            }

        } else {

        // Battle doesn't exist, let's create one now
        var battleToken = mapOptions['battles'][0];
        var fieldToken = mapOptions['fields'][0];
        var fieldImage = baseAssetHref+'images/fields/'+fieldToken+'/battle-field_avatar.png';
        $field = $('<img class="sprite field '+battleToken+' '+fieldToken+'" data-field="'+fieldToken+'" src="'+fieldImage+'" />');
        $field.appendTo($cell);
        $battle = $('<div class="sprite battle '+battleToken+'" data-battle="'+battleToken+'"></div>');
        $battle.appendTo($cell);
        mapChanged = true;

        }

    // Queue up an update if any changes have been mode
    if (mapChanged === true){ queueExportMap(); }

}


// Define a function for editing cell's field to something else
function changeCellField($cell, newPath){

    var mapChanged = false;

    var $battle = $cell.find('.battle[data-battle]');
    var $field = $cell.find('.field[data-field]');

    if ($battle.length && $field.length){

        // Field already exists, scroll through options
        var fieldToken = $field.attr('data-field');
        var fieldTokenKey = mapOptions['fields'].indexOf(fieldToken);
        var fieldTokenMaxKey = mapOptions['fields'].length - 1;
        //console.log('clicked a '+fieldToken+' field (key '+fieldTokenKey+' of max '+fieldTokenMaxKey+')');
        if (fieldTokenKey + 1 <= fieldTokenMaxKey){ var newFieldTokenKey = fieldTokenKey + 1; }
        else { var newFieldTokenKey = 0; }
        var newFieldToken = mapOptions['fields'][newFieldTokenKey];
        var newFieldImage = baseAssetHref+'images/fields/'+newFieldToken+'/battle-field_avatar.png';
        //console.log('should be changed to '+newFieldToken+' (key '+newFieldTokenKey+')');
        $field.removeClass(fieldToken).addClass(newFieldToken).attr('data-field', newFieldToken).attr('src', newFieldImage);

        var col = parseInt($cell.attr('data-col'));
        var row = parseInt($cell.attr('data-row'));
        var name = col+'-'+row;
        var title = name+' | '+newFieldToken;
        $cell.attr('title', title);

        mapChanged = true;

        }

    // Queue up an update if any changes have been mode
    if (mapChanged === true){ queueExportMap(); }

}

// Define a function for exporting the map to PHP variables
function exportMap(){
    //console.log('exportMap()');

    var mapPaths = [];
    var mapBattles = [];
    $('.cell[data-col][data-row]', $grid).each(function(index){

        var $cell = $(this);
        var col = parseInt($cell.attr('data-col'));
        var row = parseInt($cell.attr('data-row'));
        var name = col+'-'+row;

        var $path = $('.path[data-path]', $cell);
        var $battle = $('.battle[data-battle]', $cell);
        var $field = $('.field[data-field]', $cell);

        //console.log('Cell : '+name);

        if ($path.length){
            var pathToken = $path.attr('data-path');
            mapPaths.push('$map_paths['+col+']['+row+'] = \''+pathToken+'\';');
            }

        if ($battle.length && $field.length){
            var battleToken = $battle.attr('data-battle');
            var fieldToken = $field.attr('data-field');
            mapBattles.push('$map_battles['+col+']['+row+'] = \''+battleToken+'/'+fieldToken+'\';');
            }

        });

    //console.log('mapPaths : ', mapPaths);
    //console.log('mapBattles : ', mapBattles);

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