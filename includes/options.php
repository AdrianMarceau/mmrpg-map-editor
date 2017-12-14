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

// Define the different kinds of battles on the map
$battle_options = array();
$battle_options = array_merge($battle_options, array('mecha', 'master', 'boss'));
$map_options['battles'] = $battle_options;

// Define the different field tokens available for battles
$field_options = array();
$field_options = array_merge($field_options, array('intro-field', 'prototype-subspace'));
$field_options = array_merge($field_options, array('light-laboratory', 'wily-castle', 'cossack-citadel'));
$field_options = array_merge($field_options, array('abandoned-warehouse', 'orb-city', 'mountain-mines', 'steel-mill', 'oil-wells', 'arctic-jungle', 'clock-citadel', 'electrical-tower'));
$field_options = array_merge($field_options, array('final-destination', 'final-destination-2', 'final-destination-3'));
$field_options = array_merge($field_options, array('prototype-complete'));
$map_options['fields'] = $field_options;


?>