jQuery(document).ready(function($) {
	"use strict";
	var progressLinkCounter = 0; // Just need a unique number, so we'll just keep counting here.
	 
	function thumbnailImageTag(hit) {
		// The image comes from one of these places:
		// There may be keys for 'image' and 'thumbnail' in the hit.
		// There may be a thumbnail associated with the archive.
		// There is definitely a thumbnail associated with the active federation.
		var thumbnail = hit.thumbnail;
		var image = thumbnail ? hit.image : undefined; // If we don't have our own thumbnail, we never want to have a lightbox. (That probably doesn't exist in any RDF, anyway.)
		if (!thumbnail) {
			var archive = window.collex.getArchive(hit.archive);
			if (archive)
				thumbnail = archive.thumbnail;
		}
		if (!thumbnail)
			thumbnail = window.collex.images.federationThumbnail;

		var progressId = "progress_" + progressLinkCounter++;
		var title = hit.title ? hit.title : "Image";
		var imageEl = window.pss.createHtmlTag("img", { 'src': thumbnail, alt: title, 'class': 'result_row_img hidden', onload: "finishedLoadingImage(\"" + progressId + "\", this, 100, 100);" });
		var progressEl = window.pss.createHtmlTag("img",
			{ id: progressId, 'class': 'progress_timeout result_row_img_progress', src: window.collex.images.spinner, alt: 'loading...',
				'data-noimage': window.collex.images.spinnerTimeout });
		if (image) {
			// Wrap the image in an anchor that will pull up the lightbox.
			if (title.length > 60)
				title = title.substr(0,59) + "...";
			var lightboxCall = 'showInLightbox({ title: "' + title + '", img: "' + image + '", spinner: "' + window.collex.images.spinner + '", size: 500 }); return false;';
			imageEl = window.pss.createHtmlTag("a", { 'class': 'nines_pic_link', onclick: lightboxCall, href: '#' }, imageEl);
		}
		return progressEl + imageEl;
	}
	function createImageBlock(index, hit) {
		var check = "";
		var isLoggedIn = window.collex.currentUserId && window.collex.currentUserId > 0;
		if (isLoggedIn)
			check = window.pss.createHtmlTag("input", { 'type': 'checkbox', 'id': "bulk_collect_"+index, 'name': hit.title, 'value': hit.uri });
		var image = thumbnailImageTag(hit);
		var icons = "";
		if (hit.freeculture === 'true')
			icons += window.pss.createHtmlTag("span", { 'class': 'tooltip free_culture' }, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
			window.pss.createHtmlTag("span", { 'class': 'result_row_tooltip' }, "Free Culture resource"));
		if (hit.has_full_text === 'true')
			icons += window.pss.createHtmlTag("span", { 'class': 'tooltip full_text' }, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
			window.pss.createHtmlTag("span", { 'class': 'result_row_tooltip' }, "Full text provided for this document"));
		if (hit.source_xml === 'true')
			icons += window.pss.createHtmlTag("span", { 'class': 'tooltip has_xml_source' }, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
			window.pss.createHtmlTag("span", { 'class': 'result_row_tooltip' }, "XML source available for this document"));

		var resultRowIcons = window.pss.createHtmlTag("div", { 'class': 'result_row_icons' }, icons);
		var thumbnail = window.pss.createHtmlTag("div", { 'class': 'search_result_image' }, image+resultRowIcons);
		return window.pss.createHtmlTag("div", { 'class': 'search_result_left' }, check+thumbnail);
	}

	function createActionButtons(hit, isCollected, hasPredicate) {
		var matchsession = sessionStorage.getItem('match');
		var buttonInfo= window.gon.searchresultbutton;
		
	    var collectbutton, uncollectbutton, discussbutton, exhibitbutton, matchbutton, annotatebutton;

		var annotatematchbuttoninfo = window.gon.annotatematchbutton;
		if (buttonInfo != undefined){
			for(var i=0; i< buttonInfo.length; i++){
				if (new RegExp(buttonInfo[i].key).test("enable_searchresults_collect"))
				   collectbutton = buttonInfo[i].value;
				else if (new RegExp(buttonInfo[i].key).test("enable_searchresults_uncollect"))
				   uncollectbutton = buttonInfo[i].value;
				else if (new RegExp(buttonInfo[i].key).test("enable_searchresults_discuss"))
				   discussbutton = buttonInfo[i].value;
				else if (new RegExp(buttonInfo[i].key).test("enable_searchresults_exhibits"))
				   exhibitbutton = buttonInfo[i].value;		 
		    }  
		}

		if (annotatematchbuttoninfo !=undefined){
		    for(var i=0; i< annotatematchbuttoninfo.length; i++){
				if (new RegExp(annotatematchbuttoninfo[i].key).test("enable_match_button"))
				    matchbutton = annotatematchbuttoninfo[i].value;
				else if (new RegExp(annotatematchbuttoninfo[i].key).test("enable_annotate_button"))
					annotatebutton = annotatematchbuttoninfo[i].value;
			} 
		}

		var displaybuttons = "";

		if (matchsession == "true")
		{ 
			var $j = jQuery.noConflict();
			$j('#chooseobjects').show();  
				var predicatesInfo = window.gon.predicatesInfo;
				//var selectTypeOptions = window.pss.createHtmlTag("option", {value: '' }, 'Select Relationship');
				var selectTypeOptions = "";
				for (var i = 0; i < predicatesInfo.length; i++){
					selectTypeOptions += window.pss.createHtmlTag("option", {value: predicatesInfo[i].id }, predicatesInfo[i].display_name);				
				}
				var predicateInfo = window.pss.createHtmlTag("select", {'class': 'annotation_predicateinfo', 'id': 'annotation_predicateinfo'}, selectTypeOptions);
				displaybuttons = window.pss.createHtmlTag("div", { 'class': 'search_result_buttons' }, predicateInfo);
		}
		else{
			var $j = jQuery.noConflict();

			$j('#chooseobjects').hide();
			//var checkAnnotation = !isCollected? collectbutton == "on" ? window.pss.createHtmlTag("a", { 'class': 'checkAnnotation'}, "Check Annotation") : '';
			    //var checkAnnotation = window.pss.createHtmlTag("a", { 'class': 'checkAnnotation' }, "CheckAnnotation");
			    var collect = !isCollected? collectbutton == "on" ? window.pss.createHtmlTag("button", { 'class': 'collect' }, "Collect") : '': '';
				var uncollect = isCollected? uncollectbutton == "on" ? window.pss.createHtmlTag("button", { 'class': 'uncollect' }, "Uncollect") : '': '';
				var discuss = discussbutton == "on" ? window.pss.createHtmlTag("button", { 'class': 'discuss' }, "Discuss") : '';
				var exhibit = isCollected && exhibitbutton ? window.pss.createHtmlTag("button", { 'class': 'exhibit' }, "Exhibit") : '';
				var typewright = window.collex.hasTypewright && hit.typewright ? window.pss.createHtmlTag("button", { 'class': 'edit log-in-first-link', 'data-login-prompt': "Please log in to begin editing" }, "Edit") : '';
				var pages = "";
				if ( window.collex.hasPageSearch ) {
		           if ( hit.has_pages ) {
		              pages = window.pss.createHtmlTag("button", { 'class': 'page-search' }, "All Pages");
		           }
				}
				if(collect == '' || uncollect == '' || discuss == '' || exhibit == '')
				{
					$j('#bulkcollect').hide();
				}				

				var match = "";
				var annotate = "";

				if (window.collex.isBibliographer || window.collex.isAdmin || window.collex.isScholar) {
					match = matchbutton == "on" ? window.pss.createHtmlTag("a", { 'class': 'match'}, "Match") : '';
					annotate = annotatebutton == "on" ? window.pss.createHtmlTag("a", { 'class': 'annotate'}, "Contribute") : '';
				}

			    displaybuttons = window.pss.createHtmlTag("div", { 'class': 'search_result_buttons' }, collect+uncollect+discuss+exhibit+typewright+pages+match+annotate);
		}
		return displaybuttons;
	}


	function createZoteraTitle(obj) {
		var eUrl = encodeURIComponent(obj.url);
		var eTitle = obj.title ? encodeURIComponent(obj.title) : '';
		var eAut = obj.role_AUT ? encodeURIComponent(obj.role_AUT) : '';
		var eDat = obj.date_label ? encodeURIComponent(obj.date_label) : '';
		var ePub = obj.role_PBL ? encodeURIComponent(obj.role_PBL) : '';

		var arr = [ "ctx_ver=Z39.88-2004",
			"rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Abook",
			"rft_id=" + eUrl,
			"rfr_id=info%3Asid%2Focoins.info%3Agenerator",
			"rft.genre=book",
			"rft.btitle=" + eTitle,
			"rft.title=" + eTitle,
			"rft.aulast=" + eAut,
			"rft.aufirst=",
			"rft.au=" + eAut,
			"rft.date=" + eDat,
			"rft.pub=" + ePub ];
		return arr.join("&amp;");
	}

	var titleLinkCounter = 0; // Just need a unique number, so we'll just keep counting here.
	function createTitleLink(title, url) {
		if (!title)
			title = "No title";
		if (title.length < 200)
			return window.pss.createHtmlTag("a", { 'class': 'nines_link doc-title', 'href': url,  title: ' ' }, title);
		else {
			titleLinkCounter++;
			var title1 = title.substr(0, 199);
			var title2 = title.substr(199);
			var id = "title_more_" + titleLinkCounter;
			var initial_title = title1 + window.pss.createHtmlTag("span", { id: id, style: 'display:none;' }, title2);
			return window.pss.createHtmlTag("a", { class: 'nines_link doc-title', title: title,  href: url }, initial_title) +
			window.pss.createHtmlTag("a", { href: '#', onclick: 'return false;', class: 'nav_link more_link', 'data-div': id, 'data-less': '[show less]', title: ' ' }, '...[show full title]');
		}
	}

	function createResultHeader(obj) {
		var uriLink = '';
		if (window.collex.isAdmin)
			uriLink = window.pss.createHtmlTag("a",
				{ 'class': 'uri_link', 'href': '#' }, 'uri') +
			window.pss.createHtmlTag("span", { 'style': 'display:none;' }, obj.uri+ "&nbsp;");
//console.log(obj.uri);
		var a = createTitleLink(obj.title, "/fullrecord?action=fullrecord&uri="+obj.uri+"");

		var titleEl = window.pss.createHtmlTag("div", { 'class': 'search_result_header' }, uriLink+a);
		return window.pss.createHtmlTag("span", { 'class': 'Z3988', title: createZoteraTitle(obj) }, titleEl);
	}

	var needShowMoreLink = false;

	function createBlankResultContentItem(klass) {
		return window.pss.createHtmlTag("div", { 'class': klass, style: 'display:none;' },
			window.pss.createHtmlTag("span", { 'class': 'label' }, '') +
			window.pss.createHtmlTag("span", { 'class': 'value' }, ''));
	}

	function fillInRow(row, label, value) {
		row.find('.label').html(label);
		row.find('.value').html(value);
	}
	
	
	function httpGetAsync(theUrl, callback) {
    	var xmlHttp = new XMLHttpRequest();
    	xmlHttp.onreadystatechange = function() { 
        	if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            	callback(xmlHttp.responseText);
    		}
    	xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    	xmlHttp.send(null);
	}

	function createResultContentItem(type, label, value, startHidden, rowClass) {
		if (!value)
			return "";

		var klass = "row";
		if (startHidden) {
			klass += ' hidden';
			needShowMoreLink = true;
		}
		if (rowClass)
			klass += " " + rowClass;

		switch (type) {
			case "separate_lines":
				var html = window.pss.createHtmlTag("div", { 'class': klass },
					window.pss.createHtmlTag("td", { 'class': 'label' }, label) +
					window.pss.createHtmlTag("td", { 'class': 'value' }, value[0]));
				for (var i = 1; i < value.length; i++) {
					html += window.pss.createHtmlTag("div", { 'class': klass },
						window.pss.createHtmlTag("td", { 'class': 'label' }, '') +
						window.pss.createHtmlTag("td", { 'class': 'value' }, value[i]));
				}
				return html;
			case "single_item":
				return window.pss.createHtmlTag("div", { 'class': klass },
					window.pss.createHtmlTag("td", { 'class': 'label' }, label) +
					window.pss.createHtmlTag("td", { 'class': 'value' }, value));
			case "multiple_item":
 				var html = window.pss.createHtmlTag("span ", { 'class': 'value' }, value[0]);
				for (var i = 1; i < value.length; i++) {
					html += "<br>" + window.pss.createHtmlTag("span", { 'class': 'value' }, value[i]);
				}
				return window.pss.createHtmlTag("div", { 'class': klass }, window.pss.createHtmlTag("td", { 'class': 'label' }, label) + window.pss.createHtmlTag("td", { 'class': 'label' }, html));
				//return window.pss.createHtmlTag("div", { 'class': klass },
				//	window.pss.createHtmlTag("td", { 'class': 'label' }, label) +
				//	window.pss.createHtmlTag("td", { 'class': 'value' }, value));//window.pss.createHtmlTag("span", { 'class': 'value' }, value.join("; ")));
			
						
			// working here to inject the actual holding information
			case "hasInstanceItem":
				var html = "";
				for (var i = 0; i < value.length; i++) {
					// html += "<br>" + window.pss.createHtmlTag("span", { 'class': 'value' }, value[i]);
					var plainTextURL = value[i];
					var baseURL = value[i].replace(/\//g, "%2F");
					var formattedURL = baseURL.replace(/\:/g, "%3A");
					var curlURL = "http://estc21.ucr.edu/details/holdings?uri=" + formattedURL;
					
					var xmlHttp = new XMLHttpRequest();
    				xmlHttp.open( "GET", curlURL, false ); // false for synchronous request
    				xmlHttp.send( null );
    				var jsonBack = xmlHttp.responseText;
    				if (i > 0) {
    				 html += "<br>";
    				}
					//html += "<a href=\"http://estc21.ucr.edu/fullrecord?action=fullrecord&uri=" + value[i] + "\">" + window.pss.createHtmlTag("span", { 'class': 'value' }, jsonBack) + "</a>";
					html += "<a href=\"http://estc21.ucr.edu/fullrecord?action=fullrecord&uri=" + plainTextURL + "\">" + window.pss.createHtmlTag("span", { 'class': 'value' }, jsonBack) + "</a>";
				}
				return window.pss.createHtmlTag("div", { 'class': klass }, window.pss.createHtmlTag("td", { 'class': 'label' }, label) + window.pss.createHtmlTag("td", { 'class': 'label' }, html));
				
			
			
			
			
			
			
			
			
			
// 				var html = "Item: " + window.pss.createHtmlTag("span ", { 'class': 'value' }, value[0]);
//				for (var i = 0; i < value.length; i++) {
//					var str = value[i];
//					var repSlash = str.replace(/\//g, "%2F");
//					var strLink = repSlash.replace(/\:/g, "%3A");
//					var getHolding = "http://estc21.ucr.edu/details/holdings?uri=" + strLink;
//					$.get(getHolding, function(responseText) {
//						html += "<br>Item: " + window.pss.createHtmlTag("span", { 'class': 'value' }, responseText);
//					});
//					// html += "<br>Item: " + window.pss.createHtmlTag("span", { 'class': 'value' }, value[i])
//				}

				return window.pss.createHtmlTag("div", { 'class': klass }, window.pss.createHtmlTag("td", { 'class': 'label' }, label) + window.pss.createHtmlTag("td", { 'class': 'label' }, html));
				
			case "one_col":
				return window.pss.createHtmlTag("div", { 'class': klass },
					window.pss.createHtmlTag("td", { 'class': 'one-col' }, value));
			case "digital_surrogats":
     			var html = window.pss.createHtmlTag("a", { 'class': 'value', 'href': value[0], target: '_blank' }, value[0]);
				for (var i = 1; i < value.length; i++) {
					html += "<br>" + window.pss.createHtmlTag("a", { 'class': 'value', 'href': value[i], target: '_blank' }, value[i]);
				}
				return window.pss.createHtmlTag("div", { 'class': klass }, window.pss.createHtmlTag("td", { 'class': 'label' }, label) + window.pss.createHtmlTag("td", { 'class': 'label' }, html));				
		}
	}

	function createFullTextExcerpt(text) {
		if (!text || text.length === 0) return "";
		return window.pss.createHtmlTag("div", { 'class': 'search_result_full_text_label' }, 'Excerpt from Full Text:') +
		window.pss.createHtmlTag("span", { 'class': 'snippet' }, text);
	}

	function formatTags(uri, index, tags, otherTags) {
		var html = "";
		var i;
		if (tags) {
			for (i = 0; i < tags.length; i++) {
				if (i !== 0)
					html += " | ";
				html += window.pss.createHtmlTag("a", { 'class': 'tag_link my_tag', title: "view all objects tagged &quot;" + tags[i] + "&quot;", href: '/tags/results?tag=' + tags[i] + '&amp;view=tag' }, tags[i]);
				var remove = "doRemoveTag('" + uri + "', 'search_result_" + index + "', '" + tags[i] + "'); return false;";
				html += window.pss.createHtmlTag("a", { 'class': 'modify_link remove_tag', title: "delete tag &quot;" + tags[i] + "&quot;", onclick: remove, href: '#' }, 'X');
			}
		}
		if (otherTags && otherTags.length > 0) {
			if (tags && tags.length > 0)
				html += " | ";
			for (i = 0; i < otherTags.length; i++) {
				html += window.pss.createHtmlTag("a", { 'class': 'tag_link other_tag', title: "view all objects tagged &quot;" + otherTags[i] + "&quot;", href: '/tags/results?tag=' + otherTags[i] + '&amp;view=tag' }, otherTags[i]);
			}
		}
		return html;
	}

	function createTagLine(uri, index, tags, otherTags) {
		var click = "doAddTag('/tag/tag_name_autocomplete', '" + uri + "', " + index + ", 'search_result_" + index + "', event); return false;";
		var isLoggedIn = window.collex.currentUserId && window.collex.currentUserId > 0;
		var addLink;
		if (isLoggedIn)
			addLink = window.pss.createHtmlTag("button", { 'class': 'modify_link', id: "add_tag_"+index, onclick: click }, "[add&nbsp;tag]");
		else
			addLink = window.pss.createHtmlTag("span", { 'class': 'tags_instructions' }, "[" +
				window.pss.createHtmlTag("a", { 'class': 'nav_link', href: '#', onclick: "var dlg = new SignInDlg(); dlg.show('sign_in'); return false;"}, "LOG IN") + " to add tags]" );
		return formatTags(uri, index, tags, otherTags) + addLink;
	}

	function createAnnotationBody(index, uri, text) {
		var doAnnotation = "doAnnotation('" + uri + "', " + index + ", 'search_result_" + index + "', 'annotation_" + index + "', '/forum/get_nines_obj_list', '" +
			window.collex.images.spinner + "'); return false;";
		var linkLabel;
		var currentAnnotation = "<br>" + window.pss.createHtmlTag("span", { id: 'annotation_' + index, 'class': 'annotation' }, text);
		if (text && text.length > 0) {
			linkLabel = "Edit Private Annotation";
		} else
			linkLabel = "Add Private Annotation";

		return window.pss.createHtmlTag("button", { 'class': 'modify_link', onclick: doAnnotation }, linkLabel)+currentAnnotation;
	}

	function formatDate(date) {
		var months = ["January", "February", "March",
			"April", "May", "June", "July", "August", "September",
			"October", "November", "December"];

		var arr = date.split('T');
		arr = arr[0].split('-');
		var day = parseInt(arr[2], 10);
		var month = parseInt(arr[1], 10) - 1;
		var year = arr[0];
		return months[month] + " " + day + ", " + year;
	}

	function formatExhibit(exhibit) {
		var html = exhibit.title + "&nbsp;" + window.pss.createHtmlTag("a", { 'class': 'nav_link', href: exhibit.view_path }, "[view]");
		if (exhibit.edit_path && exhibit.edit_path.length > 0)
			html += "&nbsp;" + window.pss.createHtmlTag("a", { 'class': 'nav_link', href: exhibit.edit_path }, "[edit]");
		return html;
	}

	function createSubMedia(obj) {
		if (!obj)
			return null;
		try {
			obj = JSON.parse(obj);
		} catch (ex) {
			window.console.error(ex.message);
			return null;
		}
		var subMedia = [];
		for (var i = 0; i < obj.length; i++) {
			subMedia.push(createSubMediaBlock(obj[i]));
		}
		return subMedia;
	}

	function createResultContents(obj, index, collectedDate) {
		console.log(obj);
		needShowMoreLink = false;
		var html = "";
		html += createResultContentItem('one_col', '', obj.alternative, false);
		html += createResultContentItem('single_item', 'ESTC ID: ', obj.uri.substring(obj.uri.lastIndexOf('/') + 1), false);
		html += createResultContentItem('single_item', 'Date:', obj.date_label, false);
		html += createResultContentItem('multiple_item', 'Author:', obj.role_AUT, false);
		html += createResultContentItem('separate_lines', 'Source:', obj.source, false);
		
		if (collectedDate)
			html += createResultContentItem('single_item', 'Collected&nbsp;on:', formatDate(collectedDate), false, 'collected-on');
		else
			html += createBlankResultContentItem('row collected-on');

		var enable_site = (window.gon.enable_site)[0].value;

		if (enable_site == 'on'){
			var site = window.collex.getSite(obj.archive);
			html += createResultContentItem('single_item', 'Site:', site, false);
		}

		var table = "";	
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Artist:', obj.role_ART, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Genre:', obj.genre, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Discipline:', obj.discipline, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Exhibit&nbsp;type:', obj.exhibit_type, false));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'License:', obj.license, false));

		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Editor:', obj.role_EDT, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Publisher:', obj.role_PBL, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Owner:', obj.role_OWN, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Translator:', obj.role_TRL, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Provenance:', obj.provenance, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Architect:', obj.role_ARC, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Binder:', obj.role_BND, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Book Designer:', obj.role_BKD, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Book Producer:', obj.role_BKP, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Broadcaster:', obj.role_BRD, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Calligrapher:', obj.role_CLL, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Cartographer:', obj.role_CTG, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Collector:', obj.role_COL, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Colorist:', obj.role_CLR, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Commentator:', obj.role_CWT, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Compiler:', obj.role_COM, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Compositor:', obj.role_CMT, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Cinematographer:', obj.role_CNG, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Conductor:', obj.role_CND, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Creator:', obj.role_CRE, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Director:', obj.role_DRT, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Dubious Author:', obj.role_DUB, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Facsimilist:', obj.role_FAC, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Former Owner:', obj.role_FMO, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Illuminator:', obj.role_ILU, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Illustrator:', obj.role_ILL, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Interviewer:', obj.role_IVR, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Interviewee:', obj.role_IVE, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Lithographer:', obj.role_LTG, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Performer:', obj.role_PRF, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Printer:', obj.role_PRT, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Printer of plates:', obj.role_POP, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Printmaker:', obj.role_PRM, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Producer:', obj.role_PRO, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Production Company:', obj.role_PRN, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Repository:', obj.role_RPS, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Rubricator:', obj.role_RBR, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Scribe:', obj.role_SCR, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Sculptor:', obj.role_SCL, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Translator:', obj.role_TRL, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Type Designer:', obj.role_TYD, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Typographer:', obj.role_TYG, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Wood Engraver:', obj.role_WDE, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Wood Cutter:', obj.role_WDC, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Subject:', obj.subject, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Digital Surrogats:', obj.digital_surrogats, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Coverage:', obj.coverage, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Sub Location:', obj.subLocation, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Is Referenced By:', obj.isReferencedBy, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Shelf Mark:', obj.shelfMark, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Contributor:', obj.contributor, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Instance of:', obj.instanceof, true));
		
	
		
		// here's where I need to break in and call to a different function that will go out and grab the
		// holding information for each of these and display that instead of the ID
		// table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Has Instance Z:', obj.hasInstance, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('hasInstanceItem', 'Holdings:', obj.hasInstance, true));
	
		
		
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Description:', obj.description, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'URL:', obj.url, true));
		
		if (index !== null) {
			var tags = createTagLine(obj.uri, index, obj.my_tags, obj.tags);
			table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Tags:', tags, true, 'tag-list'));
		}

		html += createResultContentItem('separate_lines', 'Has Part:', createSubMedia(obj.hasPart), true);
		html += createResultContentItem('separate_lines', 'Is Part Of:', createSubMedia(obj.partOf), true);
		var exhibits;
		if (obj.exhibits) {
			exhibits = [];
			for (var i = 0; i < obj.exhibits.length; i++) {
				exhibits.push(formatExhibit(obj.exhibits[i]));
			}
		}
		if (exhibits)
			html += createResultContentItem('multiple_item', 'Exhibits:', exhibits, true, 'exhibits-row');
		else
			html += createBlankResultContentItem('row exhibits-row');

		if (needShowMoreLink && index !== null) {
			html += window.pss.createHtmlTag("button", { id: "more-search_result_"+index,  'class': 'nav_link more', onclick: 'removeHidden("more-search_result_' + index + '", "search_result_' + index + '");return false;'}, '[more...]');
		}

		var annotation = createAnnotationBody(index, obj.uri, obj.annotation);
		var annotationOptions = { 'class': 'row annotation-row' };
		if (!collectedDate)
			annotationOptions.style = "display:none;";

		html += window.pss.createHtmlTag("div", annotationOptions, annotation);

		html += createFullTextExcerpt(obj.text);

		var hiddenlist = window.pss.createHtmlTag("table", {'class': "hiddeninfo"}, table);
		html += window.pss.createHtmlTag("div", { 'class': "row hidden" }, hiddenlist);

		return window.pss.createHtmlTag("div", { 'class': 'search_result_data_container', 'data-uri': obj.uri, 'data-url': obj.url }, html);
	}

	function createSubMediaBlock(obj) {
		var resultHeader = createResultHeader(obj);
		var resultContents = createResultContents(obj, null);
		return window.pss.createHtmlTag("div", { 'class': 'search-result-sub' }, resultHeader+resultContents);
	}

	window.collex.createMediaBlock = function(obj, index, isCollected, collectedDate, hasPredicate, hidden) {
		var imageBlock = createImageBlock(index, obj);

		var actionButtons = createActionButtons(obj, isCollected, hasPredicate);
		var resultHeader = createResultHeader(obj);
		var resultContents = createResultContents(obj, index, collectedDate);
		
		var objectinfo = window.pss.createHtmlTag("div", { 'class': 'object_infos' }); 
		var activeannotations = window.pss.createHtmlTag("div", { 'class': 'activeannotations' }); 
		var viewannotation = "<br>" + window.pss.createHtmlTag("a", { 'class': 'viewAnnotation', href: '' }, "View Annotation Info");

		var viewannotationdiv = window.pss.createHtmlTag("div", { 'class': 'viewannotationdiv' }, viewannotation); 
		
		var results = window.pss.createHtmlTag("div", { 'class': 'search_result_right' }, resultHeader+resultContents+viewannotationdiv+objectinfo+activeannotations);
		var html = window.pss.createHtmlTag("div", { 'class': 'clear_both' }, "") +
			window.pss.createHtmlTag("hr", { 'class': 'search_results_hr' });
		
		var hiddenRecord = "";
		var showRecord = "";

		var klass = "search-result";
		
		if (isCollected)
			klass += " result_row_collected";

		html += window.pss.createHtmlTag("div", { 'id': 'search_result_'+ index, 'class': klass, 'data-index': index, 'data-uri': obj.uri, 'data-url': obj.url, 'data-title': obj.title }, imageBlock+actionButtons+results);

		/*if (hidden){
			klass += " hidden";
			hiddenRecord += window.pss.createHtmlTag("div", { 'id': 'search_result_'+ index, 'class': klass, 'data-index': index, 'data-uri': obj.uri, 'data-url': obj.url, 'data-title': obj.title }, imageBlock+actionButtons+results);
		}
		else{
			showRecord += window.pss.createHtmlTag("div", { 'id': 'search_result_'+ index, 'class': klass, 'data-index': index, 'data-uri': obj.uri, 'data-url': obj.url, 'data-title': obj.title }, imageBlock+actionButtons+results);
		}

		if(hiddenRecord != ""){
			html += window.pss.createHtmlTag("button", { id: "instance_of_records",  'class': 'nav_link more', onclick: 'removeHidden("more-instance-of-record", "instance-of-records");return false;'}, '[more instanceof records...]');
			showRecord += html;	
		}
		
		var records = window.pss.createHtmlTag("div", { 'id': 'records', 'class': 'records', 
			'data-index': index, 'data-uri': obj.uri, 'data-url': obj.url, 'data-title': obj.title }, showRecord+hiddenRecord);
	*/
		return html;
	};

	window.collex.setCollected = function(index, collectedDate, hasEdit) {
		var el = $("#search_result_"+index);
		if (el.length) {
			el.addClass('result_row_collected');
			var opt = {};
			if (hasEdit)
				opt.typewright = true;
			var actionButtons = createActionButtons(opt, true, false);
			el.find(".search_result_buttons").html(actionButtons);
			var collectedOn = el.find('.collected-on');
			fillInRow(collectedOn, 'Collected&nbsp;on:', formatDate(collectedDate));
			el.find('.collected-on').show();
			el.find(".annotation-row").show();
		}
	};

	window.collex.setUncollected = function(index, hasEdit) {
		var el = $("#search_result_"+index);
		if (el.length) {
			el.removeClass('result_row_collected');
			var opt = {};
			if (hasEdit)
				opt.typewright = true;
			var actionButtons = createActionButtons(opt, false, false);
			el.find(".search_result_buttons").html(actionButtons);
			el.find('.collected-on').hide();
			var annotation = el.find(".annotation-row");
			annotation.find("button").text("Add Private Annotation");
			annotation.find(".annotation").text('');
			annotation.hide();
		}
	};

	window.collex.redrawTags = function(index, myTags, otherTags) {
		var el = $("#search_result_"+index);
		if (el.length) {
			var value = el.find('.tag-list .value');
			var uri = el.attr("data-uri");
			var tags = createTagLine(uri, index, myTags, otherTags);
			value.html(tags);
		}
	};

	window.collex.redrawAnnotation = function(index, text) {
		var el = $("#search_result_"+index);
		if (el.length) {
			var value = el.find('.annotation-row');
			var container = el.closest(".search_result_data_container");
			var uri = container.attr("data-uri");
			var annotation = createAnnotationBody(index, uri, text);
			value.html(annotation);
		}
	};

	window.collex.redrawExhibits = function(index, exhibits) {
		var el = $("#search_result_"+index);
		if (el.length) {
			var row = el.find('.exhibits-row');
			//var container = el.closest(".search_result_data_container");
			//var uri = container.attr("data-uri");
			var output = [];
			if (exhibits) {
				for (var i = 0; i < exhibits.length; i++) {
					output.push(formatExhibit(exhibits[i]));
				}
				row.find(".value").html(output.join("<br>"));
				row.find(".label").html("Exhibits:");
				row.show();
			} else
				row.hide();
		}
	};

   window.collex.createPageResult = function(obj, index) {
      var html = "<div class='page-search-result'>";
      html += "<div class='page-num'>Page " + obj.page_num + "</div>";
      html += "<div class='search_result_full_text_label'>Excerpt:</div>";
      html += "<span class='snippet'>";
      html += obj.text;
      html += "</span>";
      html += "</div>";
      return html;
   };

	window.collex.createPageResultRows = function(obj) {
	   var html = "<div class='page_header'>";
	   html += "<span id='page-count'>Page Search Results (";
	   html += obj.total_pages;
	   html += ")</span>";
	   html += "<p id='search-hint'>Use search box above to find page-level results</p>";
	   if ( obj.total_pages > obj.pages.length ) {
	     html += "<div class='pages pagination'></div>";
	   }
	   html += "</div>";

      if ( obj.pages.length === 0) {
          if (obj.query.q ) {
            html += "<div class='no-page-matches'>No matches found in the pages of this document</div>";
          } else {
            html += "<div class='no-page-matches'>To get Page Search Results, enter search term(s) above</div>";
          }
      } else {
         for (var i = 0; i < obj.pages.length; i++) {
            html += window.collex.createPageResult(obj.pages[i], i);
         }
      }

	   $('.page-results').html(html);
	};

	window.collex.createResultRows = function(obj) {
		window.showProgressDialog('Loading...');
		var html = "";
		var hiddenRecord = "";
		var showRecord = "";
		var count = 0;
		for (var i = 0; i < obj.hits.length; i++) {
			var isCollected = obj.collected[obj.hits[i].uri] !== undefined;
			var hasPredicate = obj.hits[i].hasPart !== undefined;
			if(obj.hits[i].instanceof === undefined) {
				showRecord += window.collex.createMediaBlock(obj.hits[i], i, isCollected, obj.collected[obj.hits[i].uri], hasPredicate, false);
			//else{
				//count += 1;
				//hiddenRecord += window.collex.createMediaBlock(obj.hits[i], i, isCollected, obj.collected[obj.hits[i].uri], hasPredicate, true);
			}
		}
//		if(hiddenRecord != ""){
//			html += window.pss.createHtmlTag("hr", { 'class': 'search_results_hr' });
//			html += window.pss.createHtmlTag("button", { id: "instance_of_records",  'class': 'nav_link instance-of-more more', 
//				onclick: 'removeHiddenRecord("instance_of_records", "hidden-records");return false;'}, '[more instanceof records...('+ count +')]');			
//		}

		
//		var hiddendiv = window.pss.createHtmlTag("div", { 'id': 'hidden-records', 'class': 'hidden'}, hiddenRecord);
		
//		var records = window.pss.createHtmlTag("div", { 'id': 'records', 'class': 'records'}, showRecord + html + hiddendiv);
		
		var records = window.pss.createHtmlTag("div", { 'id': 'records', 'class': 'records'}, showRecord + html);
		
		$('.search-results').html(records);
		window.cancelProgressDialog();
	};
});
