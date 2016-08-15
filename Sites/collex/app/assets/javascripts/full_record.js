jQuery(document).ready(function($) {
	"use strict";
	var progressLinkCounter = 0;

	var $j = jQuery.noConflict();
	var query = ""+window.location.search;
	if(query.includes("action=fullrecord")){
		$j("#nav_container").hide();
		$j(".my_collex_link").hide();
		$j("#subnav_container").hide();
	}
	
	var body = $("body");
	body.bind('RedrawFullRecordResults', function(ev, obj) {
		
      if (!obj) {
         window.console.log("error redrawing full records", obj);
         return;
      }

      window.collex.createFullRecord(obj);       
	});

	window.collex.createFullRecord = function(obj) {
		var html = "";
		html += window.pss.createHtmlTag("button", {'class': "home_btn", 'onclick': 'window.history.back();'}, 'Go Back');
		html+= window.pss.createHtmlTag("br");
		html+= window.pss.createHtmlTag("br");
		var j = 0;
		html += window.collex.createFullRecordMediaBlock(obj.hits, j);	
		html += getAnnotationRecords (obj);
		/*if(obj.annotationid)
			html += window.pss.createHtmlTag("a", {'id': "anchorid", 'href': "#"+obj.annotationid});*/
		
		$('.full-record').html(html);		
		/*if(obj.annotationid)
			document.getElementById("anchorid").click();*/
	};

	window.collex.createFullRecordMediaBlock = function(obj, index) {
		var imageBlock = createImageBlock(index, obj);
		var resultHeader = createResultHeader(obj);
		var resultContents = createResultContents(obj, index);
		var results = window.pss.createHtmlTag("div", { 'class': 'review_result_right' }, resultHeader+resultContents);
		var klass = "review-result";
		var html = "";
		html += window.pss.createHtmlTag("div", { 'id': 'review_result_'+ index, 'class': klass, 'data-index': index, 'data-uri': obj.uri, 'data-url': obj.url, 'data-title': obj.title }, imageBlock+results);
		return html;
	};

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

	function createSubMediaBlock(obj) {
		var resultHeader = createResultHeader(obj);
		var resultContents = createResultContents(obj, null);
		return window.pss.createHtmlTag("div", { 'class': 'search-result-sub' }, resultHeader+resultContents);
	}

	function createResultContents(obj, index) {
		needShowMoreLink = false;
		var html = "";
		html += createResultContentItem('one_col', '', obj.alternative, false);
		html += createResultContentItem('single_item', 'ESTC ID: ', obj.uri.substring(obj.uri.lastIndexOf('/') + 1), false);
		html += createResultContentItem('separate_lines', 'Source:', obj.source, false);
		html += createResultContentItem('multiple_item', 'Author:', obj.role_AUT, false);
		html += createResultContentItem('single_item', 'Date:', obj.date_label, false);
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
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Owner:', obj.role_OWN, true));
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
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('digital_surrogats', 'Digital Surrogats:', obj.digital_surrogats, true));
		
		html += createResultContentItem('separate_lines', 'Has Part:', createSubMedia(obj.hasPart), true);
		html += createResultContentItem('separate_lines', 'Is Part Of:', createSubMedia(obj.isPartOf), true);
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


		if (needShowMoreLink) {
			html += window.pss.createHtmlTag("button", { id: "more-review_result_"+index,  'class': 'nav_link more', onclick: 'removeHidden("more-review_result_' + index + '", "review_result_' + index + '");return false;'}, '[more...]');			
		}
		
		html += createFullTextExcerpt(obj.text);
		var hiddenlist = window.pss.createHtmlTag("table", {'class': "hiddeninfo"}, table);
		html += window.pss.createHtmlTag("div", { 'class': "row hidden" }, hiddenlist);

		return window.pss.createHtmlTag("div", { 'class': 'search_result_data_container', 'data-uri': obj.uri, 'data-url': obj.url }, html);
	
	}

	var needShowMoreLink = false;
	function createResultContentItem(type, label, value, startHidden, rowClass) {
		if (!value)
			return "";

		var klass = "row";
		/*if (startHidden) {
			klass += ' hidden';
			needShowMoreLink = true;
		}*/
		if (rowClass)
			klass += " " + rowClass;

		switch (type) {
			case "separate_lines":
			var html = ""
				if (label == 'Has Part:'){
					html += window.pss.createHtmlTag("hr", { 'class': 'review_results_hr' });
					html += window.pss.createHtmlTag("div", { 'class': klass },
					window.pss.createHtmlTag("h3", { 'class': 'holdings', 'style': 'color:red;'}, 'Holdings ('+ value.length +')')+
					window.pss.createHtmlTag("span", { 'class': 'value' }, value[0])); 
				}
				else if (label == 'Is Part Of:'){
					html += window.pss.createHtmlTag("hr", { 'class': 'review_results_hr' });
					html += window.pss.createHtmlTag("div", { 'class': klass },
					window.pss.createHtmlTag("h3", { 'class': 'childof', 'style': 'color:red;'}, 'Child Of ('+ value.length +')')+
					window.pss.createHtmlTag("span", { 'class': 'value' }, value[0])); 
				}
				else{
				    html += window.pss.createHtmlTag("div", { 'class': klass },
					window.pss.createHtmlTag("span", { 'class': 'label' }, label) +
					window.pss.createHtmlTag("span", { 'class': 'value' }, value[0]));
				}

				for (var i = 1; i < value.length; i++) {
					html += window.pss.createHtmlTag("div", { 'class': klass },
						window.pss.createHtmlTag("span", { 'class': 'label' }, '') +
						window.pss.createHtmlTag("span", { 'class': 'value' }, value[i]));
				}
				return html;
			case "single_item":
				return window.pss.createHtmlTag("div", { 'class': klass },
					window.pss.createHtmlTag("span", { 'class': 'label' }, label) +
					window.pss.createHtmlTag("span", { 'class': 'value' }, value));
			case "multiple_item":
				var html = window.pss.createHtmlTag("span ", { 'class': 'value' }, value[0]);
				for (var i = 1; i < value.length; i++) {
					html += "<br>" + window.pss.createHtmlTag("span", { 'class': 'value' }, value[i]);
				}

				return window.pss.createHtmlTag("div", { 'class': klass }, window.pss.createHtmlTag("td", { 'class': 'label' }, label) + window.pss.createHtmlTag("td", { 'class': 'label' }, html));				
			case "one_col":
				return window.pss.createHtmlTag("div", { 'class': klass },
					window.pss.createHtmlTag("span", { 'class': 'one-col' }, value));
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
		return window.pss.createHtmlTag("div", { 'class': 'review_result_full_text_label' }, 'Excerpt from Full Text:') +
		window.pss.createHtmlTag("span", { 'class': 'snippet' }, text);
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
		if (title.length < 80)
			return window.pss.createHtmlTag("a", { 'class': 'nines_link doc-title', 'href': "/fullrecord?action=fullrecord&uri="+url+"", target: '_blank', title: ' ' }, title);
		else {
			titleLinkCounter++;
			var title1 = title.substr(0, 79);
			var title2 = title.substr(79);
			var id = "title_more_" + titleLinkCounter;
			var initial_title = title1 + window.pss.createHtmlTag("span", { id: id, style: 'display:none;' }, title2);
			return window.pss.createHtmlTag("a", { class: 'nines_link doc-title', title: title, target: '_blank', href: "/fullrecord?action=fullrecord&uri="+url+"" }, initial_title) +
			window.pss.createHtmlTag("a", { href: '#', onclick: 'return false;', class: 'nav_link more_link', 'data-div': id, 'data-less': '[show less]', title: ' ' }, '...[show full title]');
		}
	}

	function createBlankResultContentItem(klass) {
		return window.pss.createHtmlTag("div", { 'class': klass, style: 'display:none;' },
			window.pss.createHtmlTag("span", { 'class': 'label' }, '') +
			window.pss.createHtmlTag("span", { 'class': 'value' }, ''));
	}

	function createResultHeader(obj) {
		var uriLink = '';
		if (window.collex.isAdmin)
			uriLink = window.pss.createHtmlTag("a",
				{ 'class': 'uri_link', 'href': '#' }, 'uri') +
			window.pss.createHtmlTag("span", { 'style': 'display:none;' }, obj.uri+ "&nbsp;");

		var a = createTitleLink(obj.title, obj.uri);

		var titleEl = window.pss.createHtmlTag("div", { 'class': 'review_result_header' }, uriLink+a);
		return window.pss.createHtmlTag("span", { 'class': 'Z3988', title: createZoteraTitle(obj) }, titleEl);
	}

	function createImageBlock(index, hit) {
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
		var thumbnail = window.pss.createHtmlTag("div", { 'class': 'review_result_image' }, image+resultRowIcons);
		return window.pss.createHtmlTag("div", { 'class': 'review_result_left' }, thumbnail);
	}

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

	function usersfeedbackinfo(json){
		var html = "";
		if(json.userfeedback.length > 0){
			for (var i = 0; i < json.userfeedback.length; i++) {
				html += window.pss.createHtmlTag("span", { 'class': 'label', 'style': 'font-weight: bold;' }, (json.userfeedback[i])['username']);
			}
		}
		return html;
	}

	function getAnnotationRecords(json){
		var html = "";
		//html += window.pss.createHtmlTag("hr", { 'class': 'review_results_hr' });
		var subject_uri = json.hits.uri;

		if(json.annotations.length > 0)
		{	for (var i = 0; i < json.annotations.length; i++) {
			var reviewinfo = "";
			var objuri = "";
			var annotationid =  ((json.annotations[i])['matchfeedback'])[0]['annotationid'];
				for (var key in json.annotations[i]) {	
					if(key == 'predicate'){									
						reviewinfo += window.pss.createHtmlTag("div", {'id': annotationid});
						reviewinfo += window.pss.createHtmlTag("span", { 'class': 'label', 'style': 'font-weight: bold;' }, (json.annotations[i])[key]);
					}
					else if(key == 'annotationStatus'){
						if((json.annotations[i])[key] == 1 && (window.collex.isBibliographer || window.collex.isAdmin || window.collex.isScholar) )
						{	
							var object_uri = (json.annotations[i])["predicateid"] > 2 ? (json.annotations[i])['object'] : json.annotations[i].object.uri;
							var matchfeedbackinfo = "matchFeedbackinfo('"+ annotationid + "'); return false;";
							reviewinfo+= window.pss.createHtmlTag("button", { 'class': 'reviewAnnotation', 'onclick': matchfeedbackinfo }, "Provide your feedback"); 								
						}
					}
					else if(key == 'object'){
						var obj = (json.annotations[i])[key];
						var resultHeader = (json.annotations[i])["predicateid"] > 2 ? obj : createResultHeader(obj);
						
						var klass = "object_info";
						reviewinfo += window.pss.createHtmlTag("div", { 'id': 'object_info_'+ i, 'class': klass, 'data-index': i, 'data-uri': obj.uri, 'data-url': obj.url, 'data-title': obj.title }, resultHeader);
					}
					else if(key == 'totalAgree'){
						reviewinfo += window.pss.createHtmlTag("span", { 'class': 'label', 'style': 'font-weight: normal;' }, ((json.annotations[i])[key]).toString());
						reviewinfo += window.pss.createHtmlTag("img", { alt: 'Permalink', src: "/assets/thumbs-up.png"});
					}
					else if(key == 'totalDisagree'){ 
						reviewinfo += window.pss.createHtmlTag("span", { 'class': 'label', 'style': 'font-weight: normal;' }, ((json.annotations[i])[key]).toString());
						reviewinfo += window.pss.createHtmlTag("img", { alt: 'Permalink', src: "/assets/thumbs-down.png"});
						reviewinfo += window.pss.createHtmlTag("br");
					}	
					else if(key == 'matchfeedback'){						
						reviewinfo += createFeedbackInfo((json.annotations[i])[key]);						
						reviewinfo+= window.pss.createHtmlTag("br");
					}	
					else if(key == 'reviewfeedback'){
						if((json.annotations[i])[key].length > 0){
							reviewinfo += window.pss.createHtmlTag("hr", { 'class': 'review_results_hr' });
							reviewinfo += window.pss.createHtmlTag("div", { 'class': 'review_result_right' },createFeedbackInfo((json.annotations[i])[key]));							
						}
					}
				}
				var reviewKlass = "odd";
				if (i % 2 == 0)
					reviewKlass = "even";
				html += window.pss.createHtmlTag("div", { 'id': 'reviewinfo_'+ i, 'class': reviewKlass}, reviewinfo);					
				html += window.pss.createHtmlTag("hr", { 'class': 'review_results_hr' });
			}
		}
		else{
			var nomatch = window.pss.createHtmlTag("span", { 'class': 'label', 'style': 'font-weight: bold;' }, "No Match found."); 
			html += window.pss.createHtmlTag("div", { 'id': 'object_info_nomatch', 'class': 'object_info' }, nomatch);			
		}

		var history_results = window.pss.createHtmlTag("div", { 'id': 'annotation_history', 'class': 'hidden' }, html);
		var history_header = window.pss.createHtmlTag("h3", {'class': 'expander', 'data-target': 'annotation_history', 'style': 'color:red;' }, 'Annotation History');
		var hr = window.pss.createHtmlTag("hr", { 'class': 'review_results_hr' });


		

		var results = window.pss.createHtmlTag("div", {'class': 'review_result_right' }, hr + history_header + history_results );
		return results;
	}

	function createFeedbackInfo(obj){
		var html = "";
		for(var i = 0; i < obj.length; i++) {
			if (obj[i]['flag'] == 3){
				html += window.pss.createHtmlTag("img", { alt: 'Permalink', src: "/assets/thumbs-up.png"});
			}
			else if (obj[i]['flag'] == 4){
				html += window.pss.createHtmlTag("img", { alt: 'Permalink', src: "/assets/thumbs-down.png"});
			}
			else if (obj[i]['flag'] == "Approved")
			{
				html += window.pss.createHtmlTag("span", { 'class': 'label', 'style': 'font-weight: bold;' }, "Approved");
				html+= window.pss.createHtmlTag("br");
			}
			else if (obj[i]['flag'] == "Disapproved")
			{
				html += window.pss.createHtmlTag("span", { 'class': 'label', 'style': 'font-weight: bold;' }, "DisApproved");
				html+= window.pss.createHtmlTag("br");
			}

			html += window.pss.createHtmlTag("span", { 'class': 'label'}, obj[i]['username']);
			if (obj[i]['feedback'] != null){				
				html+= window.pss.createHtmlTag("br");			
				html += window.pss.createHtmlTag("span", { 'class': 'label'}, obj[i]['feedback']);
			}
			
			var attachments = obj[i]['attachment'];
			if (attachments.length > 0){
				html+= window.pss.createHtmlTag("br");
				for(var j = 0; j < attachments.length; j++){
					html += window.pss.createHtmlTag("a", {'class': 'label', 'href': "/uploads/"+attachments[j], 'download': "file" + (j+1)}, "file" + (j+1));
					html += window.pss.createHtmlTag("span", { 'class': 'label'}, "&nbsp;&nbsp;");
				}			
			}
			if((i+1) != obj.length)
				html += window.pss.createHtmlTag("hr", { 'class': 'review_results_hr' });
		}
		
		return html;
	}

	function getDetails() {
      	window.showProgressDialog('Searching...');
		var onSuccess = function(resp) {
			var json = JSON.parse(resp.responseText);
			body.trigger('RedrawFullRecordResults', json); 
			window.cancelProgressDialog();
		};
		var onError = function(resp) {
	      	window.cancelProgressDialog();
			window.console.error(resp.responseText);
		};
		serverAction({action:{actions: "/get_fullrecord_info", els: [], onSuccess:onSuccess, onError:onError}});	
	} 

	function initializeFullRecord() {
		// This is called on initial page load.
		if (window.collex.pageName === 'fullrecord') {
			console.log("initializeFullRecord() showing progress");
			getDetails();
		}
	}

	initializeFullRecord();

});