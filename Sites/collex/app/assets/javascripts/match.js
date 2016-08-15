jQuery(document).ready(function($) {
	"use strict";

	var $j = jQuery.noConflict();		
	if(sessionStorage.getItem('match') == 'true'){
		$j("#nav_container").hide();		
		$j(".my_collex_link").hide();
		$j("#subnav_container").hide();
	}

  	$j('#list-objects li:nth-child(even)').addClass('even');
  	$j('#list-objects li:nth-child(odd)').addClass('odd');

});