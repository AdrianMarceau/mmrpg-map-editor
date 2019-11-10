
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
var mapName;
var mapOptions;
var palletCurrent;
var globalCellIndex = {};
var mmrpgTypeIndex = {};
var mmrpgFieldIndex = {};

// Predefine default base paths for map assets
//var baseHref = 'http://mmrpg.map.editor/';
//var baseAssetHref = 'http://rpg.megamanpoweredup.net/';
var baseHref = 'http://local.dev.mmrpg-world.net/mapeditor2k17/';
var baseAssetHref = 'http://local.prototype.mmrpg-world.net/';

// Wait for document ready before delegating events
$(document).ready(function(){

    //console.log('RETURN FALSE');
    //return false;

    // Define references to key dom elements
    $map = $('.map');
    $canvas = $('.grid.canvas', $map);
    $pallet = $('.grid.pallet', $map);
    $shift = $('.shift');
    $views = $('.views');
    $tools = $('.tools');
    $export = $('.export', $tools);

    mapName = $map.is('[data-name]') ? $map.attr('data-name') : 'map1';

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
        if ($button.hasClass('disabled')){ return false; }
        var dir = $button.attr('data-dir');
        shiftSprites(dir);
        });

    // Define the click events for the VIEW BUTTONS
    $('.button[data-view]', $views).bind('click', function(e){
        e.preventDefault();
        var $button = $(this);
        if ($button.hasClass('disabled')){ return false; }
        var oldView = $map.attr('data-view');
        var view = $button.attr('data-view');
        $('.button[data-view]', $views).removeClass('active');
        $button.addClass('active');
        if (oldView === 'test' && view !== 'test'){ exitTestMode(); }
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
        if (view === 'test'){ enterTestMode(); }
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
            // If this is a field change, automatically update anything the event pallet
            if (kind === 'fields'){
                $pallet.filter('[data-kind="events"]').find('.sprite.event').each(function(index){
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
        else if (edit === 'events'){ changeCellEvent($cell); }
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
    var origin = 2;
    var stop = gridSize.cols;
    for (var col = origin; col <= stop; col++){
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
    var origin = gridSize.cols - 1;
    var stop = 1;
    for (var col = origin; col >= stop; col--){
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
    var origin = 2;
    var stop = gridSize.rows;
    for (var row = origin; row <= stop; row++){
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
    var origin = gridSize.rows - 1;
    var stop = 1;
    for (var row = origin; row >= stop; row--){
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

// Define a function for editing cell's event to something else
function changeCellEvent($cell, newEvent, exportMap){
    //console.log('changeCellEvent', newEvent, exportMap || false);

    // Compensate for missing function arguments or break if required
    if (typeof $cell !== 'object'){ return false; }
    if (typeof newEvent !== 'string'){ newEvent = ''; }
    if (typeof exportMap !== 'boolean'){ exportMap = true; }

    // Insert a new event sprite, unless one already exists then remove it
    var $event = $cell.find('.event[data-event]');
    var $field = $cell.find('.field[data-field]');
    var currEvent = $event.length ? $event.attr('data-event') : '';
    var newEvent = newEvent.length ? newEvent : palletCurrent['events'];
    if ($event.length){ $event.remove(); }
    if ($field.length){ $field.remove(); }
    //console.log('currEvent = ', currEvent, 'newEvent = ', newEvent);

    // If this was a 'origin' or 'destination' panel, ALLOW ONLY ONE and automatically remove any existing
    if (newEvent === 'origin'){
        //console.log('newEvent === origin | remove prev sprite');
        $originEvent = $('.cell[data-col][data-row] .sprite[data-event="origin"]', $canvas);
        //console.log('$originEvent =', $originEvent.length, $originEvent);
        if ($originEvent.length){ $originEvent.parent().find('.sprite:not(.path)').remove(); }
    } else if (newEvent === 'destination'){
        //console.log('newEvent === destination | remove prev sprite');
        $destinationEvent = $('.cell[data-col][data-row] .sprite[data-event="destination"]', $canvas);
        //console.log('$destinationEvent =', $destinationEvent.length, $destinationEvent);
        if ($destinationEvent.length){ $destinationEvent.parent().find('.sprite:not(.path)').remove(); }
    }

    // Generate the markup for the next event, with or without field image
    var newFieldType = '';
    if (newEvent !== 'origin'
        && newEvent !== 'destination'
        && newEvent.indexOf('progress-gate-') === -1){
        var newField = palletCurrent['fields'];
        var newFieldData = typeof mmrpgFieldIndex[newField] !== 'undefined' ? mmrpgFieldIndex[newField] : {};
        newFieldType = typeof newFieldData.type !== 'undefined' && newFieldData.type.length > 0 ? newFieldData.type : 'none';
        }
    if (!(currEvent.length && currEvent === newEvent)){
        if (newEvent !== 'origin'
            && newEvent !== 'destination'
        && newEvent.indexOf('progress-gate-') === -1){
            //var fieldImage = baseAssetHref+'images/fields/'+newField+'/battle-field_avatar.png';
            //$field = $('<img class="sprite field '+newEvent+' '+newField+'" data-field="'+newField+'" data-type="'+newFieldType+'" src="'+fieldImage+'" />');
            $field = $('<div class="sprite field '+newEvent+' '+newField+'" data-field="'+newField+'" data-type="'+newFieldType+'"></div>');
            $field.appendTo($cell);
            }
        $event = $('<div class="sprite event '+newEvent+'" data-event="'+newEvent+'" data-type="'+newFieldType+'"></div>');
        $event.appendTo($cell);
        }

    // Queue up an update if any changes have been mode
    if (exportMap){ queueExportMap(); }

}

// Define a function for editing cell's field to something else
function changeCellField($cell, newField, exportMap){
    //console.log('changeCellField', newField, exportMap || false);

    // Compensate for missing function arguments or break if required
    if (typeof $cell !== 'object'){ return false; }
    if (typeof newField !== 'string'){ newField = ''; }
    if (typeof exportMap !== 'boolean'){ exportMap = true; }

    // Replace the previous field sprite if one exists, else do nothing
    var $event = $cell.find('.event[data-event]');
    var $field = $cell.find('.field[data-field]');
    if ($event.length && $field.length){

        // Remove the previous field and prepend a new one
        $field.remove();
        var eventToken = $event.attr('data-event');
        //console.log('eventToken = ', eventToken);
        if (eventToken === 'origin'
            || eventToken === 'destination'
            || eventToken.indexOf('progress-gate-') !== -1){
            $event.attr('data-type', '');
        } else {
            var fieldToken = newField.length ? newField : palletCurrent['fields'];
            var fieldData = typeof mmrpgFieldIndex[fieldToken] !== 'undefined' ? mmrpgFieldIndex[fieldToken] : {};
            var fieldImage = baseAssetHref+'images/fields/'+fieldToken+'/battle-field_avatar.png';
            var fieldType = typeof fieldData.type !== 'undefined' && fieldData.type.length > 0 ? fieldData.type : 'none';
            //console.log('fieldToken = ', fieldToken, 'fieldType = ', fieldType, 'fieldData = ', fieldData);
            $field = $('<img class="sprite field '+eventToken+' '+fieldToken+'" data-field="'+fieldToken+'" data-type="'+fieldType+'" src="'+fieldImage+'" />');
            $field.insertBefore($event);
            $event.attr('data-type', fieldType);
        }

        // Update the tooltip title of the parent cell
        var col = parseInt($cell.attr('data-col'));
        var row = parseInt($cell.attr('data-row'));
        var title = name+' | '+col+'-'+row;
        $cell.attr('title', title);

        }

    // Queue up an update if any changes have been mode
    if (exportMap){ queueExportMap(); }

}

function reindexCellContents(){
    //console.log('reindexCellContents()');

    var cellIndex = {};
    var originCellPosition = '';
    var destinationCellPosition = '';
    var cellsWithContent = [];
    var cellsWithPaths = [];
    var cellsWithEvents = [];
    var cellsWithEventBattles = [];
    var cellsWithEventFields = [];
    var cellsWithProgressGates = [];

    var $gridCells = $('.cell[data-col][data-row]', $canvas);
    $gridCells.each(function(){
        var $cell = $(this);
        var $cellSprites = $('.sprite', $cell);
        var cellPosition = $cell.attr('data-col')+'-'+$cell.attr('data-row');
        if ($cellSprites.length > 0){
            var cellContent = {};
            var $pathSprite = $cellSprites.filter('.path');
            var $eventSprite = $cellSprites.filter('.event');
            var $fieldSprite = $cellSprites.filter('.field');
            cellsWithContent.push(cellPosition);
            if ($pathSprite.length > 0){
                cellContent.path = $pathSprite.attr('data-path');
                cellsWithPaths.push(cellPosition);
                }
            if ($eventSprite.length > 0){
                cellContent.event = $eventSprite.attr('data-event');
                cellsWithEvents.push(cellPosition);
                if (cellContent.event === 'origin'){ originCellPosition = cellPosition; }
                else if (cellContent.event === 'destination'){ destinationCellPosition = cellPosition; }
                else if (cellContent.event.indexOf('battle-') !== -1){ cellsWithEventBattles.push(cellPosition); }
                else if (cellContent.event.indexOf('progress-gate-') !== -1){ cellsWithProgressGates.push(cellPosition); }
                }
            if ($fieldSprite.length > 0){
                cellContent.field = $fieldSprite.attr('data-field');
                cellsWithPaths.push(cellPosition);
                }
            cellIndex[cellPosition] = cellContent;
            }
        });

    globalCellIndex = {
        index: cellIndex,
        origin: originCellPosition,
        destination: destinationCellPosition,
        withContent: cellsWithContent,
        withPaths: cellsWithPaths,
        withEvents: cellsWithEvents,
        withEventBattles: cellsWithEventBattles,
        withProgressGates: cellsWithProgressGates,
        };

    //console.log('globalCellIndex = ', globalCellIndex);

    //console.log('MAP JSON globalCellIndex.index = ', JSON.stringify(globalCellIndex.index));

    //exportCellIndexAsJSON();

}
function exportCellIndex(){

    var exportPaths = {};
    var exportEvents = {};
    var exportFields = {};

    var globalCellKeys = Object.keys(globalCellIndex.index);
    for (var i = 0; i < globalCellKeys.length; i++){
        var cellPosition = globalCellKeys[i];
        var cellData = globalCellIndex.index[cellPosition];
        if (typeof cellData.path !== 'undefined'){ exportPaths[cellPosition] = cellData.path; }
        if (typeof cellData.event !== 'undefined'){ exportEvents[cellPosition] = cellData.event; }
        if (typeof cellData.field !== 'undefined'){ exportFields[cellPosition] = cellData.field; }
        }

    var exportCellIndex = {
        name: mapName,
        paths: exportPaths,
        events: exportEvents,
        fields: exportFields
        };

    //console.log('MAP dataIndex = ', exportCellIndex);

    return exportCellIndex;

}
function exportCellIndexAsJSON(exportedCellIndex){

    var exportedCellIndex = typeof exportedCellIndex !== 'undefined' ? exportedCellIndex : exportCellIndex();

    var jsonDataIndexString = JSON.stringify(exportedCellIndex);

    //console.log('MAP jsonDataIndexString = ', jsonDataIndexString);

    return jsonDataIndexString;

}
// Define a function for exporting the map to PHP variables
function exportMap(){
    //console.log('exportMap()');

    // Reindex all cells into the global index
    reindexCellContents();
    var exportedCellIndex = exportCellIndex();
    var exportedCellIndexString = exportCellIndexAsJSON(exportedCellIndex);
    $export.val(exportedCellIndexString);

    // If an origin and destination have been defined, allow the user to TEST their creation
    var $testViewButton = $('.button[data-view="test"]', $views);
    var hasOriginEvent = $('.cell[data-col][data-row] .sprite[data-event="origin"]', $canvas).length ? true : false;
    var hasDestinationEvent = $('.cell[data-col][data-row] .sprite[data-event="destination"]', $canvas).length ? true : false;
    //console.log('$testViewButton =', $testViewButton.length, $testViewButton);
    //console.log('hasOriginEvent =', hasOriginEvent);
    //console.log('hasDestinationEvent =', hasDestinationEvent);
    //console.log('exportedCellIndex.events =', Object.keys(exportedCellIndex.events).length, exportedCellIndex.events);
    if (hasOriginEvent && hasDestinationEvent && Object.keys(exportedCellIndex.events).length > 2){ $testViewButton.removeClass('disabled'); }
    else { $testViewButton.addClass('disabled'); }

}

// Define a function for queueing up a map export when ready
var exportMapTimeout;
function queueExportMap(){
    if (typeof exportMapTimeout !== 'undefined'){ clearTimeout(exportMapTimeout); }
    exportMapTimeout = setTimeout(function(){ exportMap(); }, 300);
}

// Define a function for downloading the exported file
function downloadExportMapAsFile(){
    if (typeof $export === 'undefined' || !$export.length){ return false; }
    var text = document.getElementById("export-map-json").value;
    text = text.replace(/\n/g, "\r\n"); // To retain the Line breaks.
    var blob = new Blob([text], { type: "text/plain"});
    var anchor = document.createElement("a");
    anchor.download = mapName+'.json';
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target ="_blank";
    anchor.style.display = "none"; // just to be safe!
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
 }



// -- TEST MODE PROGRAMMING -- //

var completedEventCells = [];
var allowedEventCells = [];
var $testMap = false;
var $testCanvas = false;
var $testPallets = false;
var $testCanvasCells = false;
var $originCell = false;
var orginClickTimeout = false;
var originCellPosition = false;
var $destinationCell = false;
var destinationCellPosition = false;
var completedEventCellsCount = 0;
var totalEventCellsCount = 0;
var percentComplete = 0;
var currentTestProgress = {};
function enterTestMode(){
    //console.log('enterTestMode()');
    resetTestModeVariables();
    reindexCellContents();
    recalculateAllowedEventCells();
    recalculateTestProgress();
    updateCellsWithTestModeProgress();
    generateTestModeEvents();
    updateTestModePallet();

    /*
    // Auto click the origin cell
    if (orginClickTimeout !== false){ clearTimeout(orginClickTimeout); }
    orginClickTimeout = setTimeout(function(){
        $testCanvasCells.find('.sprite.event.origin').parent().trigger('click');
        }, 2000);
    */

    //console.log('completedEventCells =', completedEventCells);
    //console.log('allowedEventCells =', allowedEventCells);
}
function exitTestMode(){
    //console.log('exitTestMode()');
    resetTestModeVariables();
}
function resetTestModeVariables(){
    //console.log('resetTestModeVariables()');
    globalCellIndex = {};
    completedEventCells = [];
    allowedEventCells = [];
    completedEventCellsCount = 0;
    totalEventCellsCount = 0;
    percentComplete = 0;
    $testMap = $('.map[data-view="test"]');
    $testCanvas = $('.grid.canvas', $testMap);
    $testPallets = $('.grid.pallet', $testMap);
    $testCanvasCells = $('.cell[data-col][data-row]', $testCanvas);
    $originCell = $testCanvasCells.find('.sprite.origin').parent();
    $destinationCell = $testCanvasCells.find('.sprite.destination').parent();
    originCellPosition = $originCell.attr('data-col')+'-'+$originCell.attr('data-row');
    destinationCellPosition = $destinationCell.attr('data-col')+'-'+$destinationCell.attr('data-row');
    $('.cell[data-col][data-row]', $testCanvas)
        .removeClass('locked')
        .removeClass('allowed')
        .removeClass('completed')
        ;
    //console.log('cells = ', $testCanvasCells.length);
}
function preloadAllowedEventCells(){
    //console.log('preloadAllowedEventCells()');
    $originEvent = $('.cell[data-col][data-row] .sprite[data-event="origin"]', $testCanvas);
    if ($originEvent.length){ $cell = $originEvent.parent(); allowedEventCells.push($cell.attr('data-col')+'-'+$cell.attr('data-row')); }
}
function preloadCompletedEventCells(){
    //console.log('preloadCompletedEventCells()');
}
function recalculateAllowedEventCells(){
    //console.log('calculateCompletedEventCells()');
    allowedEventCells = [];
    preloadAllowedEventCells();
    preloadCompletedEventCells();
    allowedEventCells.push.apply(allowedEventCells, completedEventCells);
    for (var i = 0; i < completedEventCells.length; i++){
        var completedCell = completedEventCells[i].split('-');
        var completedCellCol = parseInt(completedCell[0]);
        var completedCellRow = parseInt(completedCell[1]);
        // Allow the non-empty cells on all four sides of this one
        var abovePosition = completedCellCol+'-'+(completedCellRow - 1); // above (-1 row)
        var belowPosition = completedCellCol+'-'+(completedCellRow + 1); // below (+1 row)
        var leftPosition = (completedCellCol - 1)+'-'+completedCellRow; // left (-1 col)
        var rightPosition = (completedCellCol + 1)+'-'+completedCellRow; // right (+1 col)
        if (globalCellIndex.withContent.indexOf(abovePosition) !== -1){ allowedEventCells.push(abovePosition); }
        if (globalCellIndex.withContent.indexOf(belowPosition) !== -1){ allowedEventCells.push(belowPosition); }
        if (globalCellIndex.withContent.indexOf(leftPosition) !== -1){ allowedEventCells.push(leftPosition); }
        if (globalCellIndex.withContent.indexOf(rightPosition) !== -1){ allowedEventCells.push(rightPosition); }
        }
}
var autoClickInProgress = false;
var autoClickTimeout = false;
var $queuedCellsToBeClicked = [];
function autoClickQueuedCells(){
    //console.log('autoClickQueuedCells()', $queuedCellsToBeClicked.length);
    if ($queuedCellsToBeClicked.length > 0){
        if (autoClickTimeout !== false){ clearTimeout(autoClickTimeout); }
        autoClickTimeout = setTimeout(function(){
            var $clickCell = $queuedCellsToBeClicked.shift();
            //console.log('$clickCell =', $clickCell.attr('data-col-row'));
            testCellClickFunction($clickCell);
            autoClickQueuedCells();
            }, 500);
        autoClickInProgress = true;
        } else {
        //console.log('no more click cells');
        autoClickInProgress = false;
        }
}
function autoCompleteAdjacentPathOnlyCells(completedCellToken){
    //console.log('autoCompleteAdjacentPathOnlyCells()', completedCellToken);

    var completedCell = completedCellToken.split('-');
    var completedCellCol = parseInt(completedCell[0]);
    var completedCellRow = parseInt(completedCell[1]);

    var abovePosition = completedCellCol+'-'+(completedCellRow - 1); // above (-1 row)
    var $aboveCell = $testCanvasCells.filter('[data-col-row="'+abovePosition+'"]'); // above (-1 row)
    if ($aboveCell.length
        && completedEventCells.indexOf(abovePosition) === -1
        && !$aboveCell.find('.sprite.event').length
        && !$aboveCell.is(':empty')){
        $queuedCellsToBeClicked.push($aboveCell);
        }

    var belowPosition = completedCellCol+'-'+(completedCellRow + 1); // below (+1 row)
    var $belowCell = $testCanvasCells.filter('[data-col-row="'+belowPosition+'"]'); // below (+1 row)
    if ($belowCell.length
        && completedEventCells.indexOf(belowPosition) === -1
        && !$belowCell.find('.sprite.event').length
        && !$belowCell.is(':empty')){
        $queuedCellsToBeClicked.push($belowCell);
        }

    var leftPosition = (completedCellCol - 1)+'-'+completedCellRow; // left (-1 col)
    var $leftCell = $testCanvasCells.filter('[data-col-row="'+leftPosition+'"]'); // left (-1 col)
    if ($leftCell.length
        && completedEventCells.indexOf(leftPosition) === -1
        && !$leftCell.find('.sprite.event').length
        && !$leftCell.is(':empty')){
        $queuedCellsToBeClicked.push($leftCell);
        }

    var rightPosition = (completedCellCol + 1)+'-'+completedCellRow; // right (+1 col)
    var $rightCell = $testCanvasCells.filter('[data-col-row="'+rightPosition+'"]'); // right (+1 col)
    if ($rightCell.length
        && completedEventCells.indexOf(rightPosition) === -1
        && !$rightCell.find('.sprite.event').length
        && !$rightCell.is(':empty')){
        $queuedCellsToBeClicked.push($rightCell);
        }

    /*
    //console.log({
        trigger: completedCellToken,
        above: [abovePosition, $aboveCell.length, $aboveCell.find('.sprite.event').length, $aboveCell.find('.sprite.path').length],
        below: [belowPosition, $belowCell.length, $belowCell.find('.sprite.event').length, $belowCell.find('.sprite.path').length],
        left: [leftPosition, $leftCell.length, $leftCell.find('.sprite.event').length, $leftCell.find('.sprite.path').length],
        right: [rightPosition, $rightCell.length, $rightCell.find('.sprite.event').length, $rightCell.find('.sprite.path').length],
        queuedCells: [$queuedCellsToBeClicked.length, $queuedCellsToBeClicked.map(function(a){ return a.attr('data-col-row'); })]
        });
    */

    autoClickQueuedCells();
}
function updateCellsWithTestModeProgress(){
    //console.log('updateCellsWithTestModeProgress()');
    $testCanvasCells
        .addClass('locked')
        .removeClass('allowed');
    for (var i = 0; i < completedEventCells.length; i++){
        var completedCell = completedEventCells[i].split('-');
        var completedCellCol = parseInt(completedCell[0]);
        var completedCellRow = parseInt(completedCell[1]);
        $testCanvasCells
            .filter('[data-col="'+completedCellCol+'"][data-row="'+completedCellRow+'"]')
            .addClass('completed')
            ;
    }
    for (var i = 0; i < allowedEventCells.length; i++){
        var allowedCell = allowedEventCells[i].split('-');
        var allowedCellCol = parseInt(allowedCell[0]);
        var allowedCellRow = parseInt(allowedCell[1]);
        $testCanvasCells
            .filter('[data-col="'+allowedCellCol+'"][data-row="'+allowedCellRow+'"]')
            .removeClass('locked')
            .addClass('allowed')
            ;
    }
}
var generateTestModeEventsFlag = false;
function generateTestModeEvents(){
    //console.log('generateTestModeEvents()');
    if (generateTestModeEventsFlag === true){ return; }
    else { generateTestModeEventsFlag = true; }
    $testCanvasCells.bind('click', function(e){
        e.preventDefault();
        var $testCell = $(this);
        if (!autoClickInProgress){
            testCellClickFunction($testCell, true);
            } else {
            $queuedCellsToBeClicked.push($testCell);
            //console.log('preventing an auto-click of ', $testCell.attr('data-col-row'));
            }
        });
}
function testCellClickFunction($testCell, triggeredByUser){
    if (typeof triggeredByUser !== 'boolean'){ triggeredByUser = false; }
    if ($testMap.attr('data-view') === 'test'){
        var cellToken = $testCell.attr('data-col')+'-'+$testCell.attr('data-row');
        if (!$testCell.hasClass('locked')){
            //console.log('click an allowed cell to complete it!');
            if (globalCellIndex.withContent.indexOf(cellToken) !== -1
                && completedEventCells.indexOf(cellToken) === -1){
                var allowComplete = true;
                var $pathSprite = $testCell.find('.sprite.path');
                var $eventSprite = $testCell.find('.sprite.event');
                var eventKind = $eventSprite.length > 0 ? $eventSprite.attr('data-event') : '';
                //console.log('eventKind = ', eventKind);
                if (eventKind.indexOf('progress-gate-') !== -1){
                    var progressGateLevel = parseInt(eventKind.split('-')[2]);
                    //console.log('currentTestProgress.overallPercent = ', currentTestProgress.overallPercent);
                    //console.log('progressGateLevel = ', progressGateLevel);
                    if (currentTestProgress.overallPercent < progressGateLevel){ allowComplete = false; }
                    } else if (!$pathSprite.length){
                    allowComplete = false;
                    }
                if (allowComplete){
                    completedEventCells.push(cellToken);
                    recalculateAllowedEventCells();
                    recalculateTestProgress();
                    updateCellsWithTestModeProgress();
                    updateTestModePallet();
                    autoCompleteAdjacentPathOnlyCells(cellToken);
                    return true;
                    }
                }
            }
        }
    return false;
}
function recalculateTestProgress(){
    var battlesComplete = 0;
    var gatesOpened = 0;
    for (var i = 0; i < completedEventCells.length; i++){
        var completedCell = completedEventCells[i];
        if (globalCellIndex.withEventBattles.indexOf(completedCell) !== -1){ battlesComplete++; }
        else if (globalCellIndex.withProgressGates.indexOf(completedCell) !== -1){ gatesOpened++; }
        }
    var applicableEventCellTotal = globalCellIndex.withEventBattles.length + globalCellIndex.withProgressGates.length;
    var overallPercent = ((battlesComplete + gatesOpened) / applicableEventCellTotal) * 100;
    var overallPercentRounded = parseFloat(Math.round(overallPercent * 100) / 100).toFixed(2);
    currentTestProgress = {
        battlesComplete: battlesComplete,
        gatesOpened: gatesOpened,
        overallPercent: overallPercent,
        overallPercentRounded: overallPercentRounded
        };
    return currentTestProgress;
}
function updateTestModePallet(){
    //console.log('updateTestModePallet()');
    var $testPalletBody = $testPallets.filter('.test').find('tbody');
    $testPalletBody.empty();

    $testPalletBody.append('<tr class="cell-stats">'
        + '<td class="stat label"><strong>Cell Stats</strong></td>'
        + '<td class="stat total"><label>Total:</label> <strong>'+globalCellIndex.withContent.length+'</strong></td>'
        + '<td class="stat paths"><label>w/ Paths</label> <strong>'+globalCellIndex.withPaths.length+'</strong></td>'
        + '<td class="stat battles"><label>w/ Battles</label> <strong>'+globalCellIndex.withEventBattles.length+'</strong></td>'
        + '<td class="stat gates"><label>w/ Gates</label> <strong>'+globalCellIndex.withProgressGates.length+'</strong></td>'
        + '</tr>');

    $testPalletBody.append('<tr class="test-progress">'
        + '<td class="stat label"><strong>Progress</strong></td>'
        + '<td class="stat total"><label>Battles:</label> <strong>'+currentTestProgress.battlesComplete+' / '+globalCellIndex.withEventBattles.length+'</strong></td>'
        + '<td class="stat complete"><label>Gates:</label> <strong>'+currentTestProgress.gatesOpened+' / '+globalCellIndex.withProgressGates.length+'</strong></td>'
        + '<td class="stat percent" colspan="2"><label>Overall Percent:</label> <strong>'+currentTestProgress.overallPercentRounded+'%</strong></td>'
        + '</tr>');

    /*
    $testPalletBody.append('<tr>'
        + '<td class="stat completed"><label>Battles Complete:</label> <strong>'+completedEventCellsCount+'</strong></td>'
        + '<td class="stat total"><label>Battles Total:</label> <strong>'+totalEventCellsCount+'</strong></td>'
        + '<td class="stat progress"><label>Battle Progress:</label> <strong>'+Math.ceil(percentComplete)+'%</strong></td>'
        //+ '<td class="stat allowed"><label>Allowed</label> <strong>'+allowedEventCells.length+'</strong></td>'
        + '<td class="stat progress"><label>Battle Progress:</label> <strong>'+Math.ceil(percentComplete)+'%</strong></td>'
        + '<td class="stat total"><label>Cells w/ Events:</label> <strong>'+totalEventCellsCount+'</strong></td>'
        + '</tr>');

    $testPalletBody.append('<tr>'
        + '<td class="stat completed"><label>Complete:</label> <strong>'+completedEventCellsCount+'</strong></td>'
        + '<td class="stat total"><label>Total:</label> <strong>'+totalEventCellsCount+'</strong></td>'
        //+ '<td class="stat allowed"><label>Allowed</label> <strong>'+allowedEventCells.length+'</strong></td>'
        + '<td class="stat progress"><label>Progress:</label> <strong>'+Math.ceil(percentComplete)+'%</strong></td>'
        + '<td class="stat total"><label>Total:</label> <strong>'+totalEventCellsCount+'</strong></td>'
        + '</tr>');
    */
}