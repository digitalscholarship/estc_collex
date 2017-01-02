jQuery(document).ready(function($) {
	"use strict";

	var $j = jQuery.noConflict();
	var query = ""+window.location.search;
	if(query.search("action=annotate") > -1){
		$j("#nav_container").hide();
		$j(".my_collex_link").hide();
		$j("#subnav_container").hide();
	}
});