jQuery(document).ready(function($) {
	"use strict";
	var progressLinkCounter = 0; 

	var body = $("body");
	body.bind('RedrawReviewResults', function(ev, obj) {
      if (!obj) {
         window.console.log("error redrawing review results", obj);
         return;
      }
      window.collex.createReviewResultRows(obj); 
	});

	window.collex.createReviewResultRows = function(obj) {
		if(obj.hits.length == 0){
			$(".no_results_msg").show();
		}
		else{
			$(".no_results_msg").hide();
		
			var html = "";
			var reviewrow = "";
			var j = 0;
			
			for (var i = 0; i < obj.hits.length; i++) {
				html = "";
				html += window.pss.createHtmlTag("div", { 'class': 'clear_both' }, "") +
					window.pss.createHtmlTag("hr", { 'class': 'review_results_hr' });
				var totalagreeinfo = "";
				var totaldisagreeinfo = "";

				var subjecturi = "";
				var object = "";
				
				html += window.pss.createHtmlTag("div", {'id': (obj.hits[i])['annotationid'], 'class':'annotationid'});
				for (var key in obj.hits[i]) {
					if(key == 'predicate'){				
						var predicateinfo = window.pss.createHtmlTag("span", { 'class': 'label' }, (obj.hits[i])[key]);	
						html += window.pss.createHtmlTag("div", { 'class': 'review_result_right' }, predicateinfo);
						html+= window.pss.createHtmlTag("br");		
					}
					else if(key == 'totalAgree'){
							totalagreeinfo += window.pss.createHtmlTag("span", { 'class': 'label', 'style': 'font-weight: normal;' }, ((obj.hits[i])[key]).toString());
							totalagreeinfo += window.pss.createHtmlTag("img", { alt: 'Permalink', src: "/assets/thumbs-up.png"});
					}
					else if(key == 'totalDisagree'){ 
							totaldisagreeinfo += window.pss.createHtmlTag("span", { 'class': 'label', 'style': 'font-weight: normal;' }, ((obj.hits[i])[key]).toString());
							totaldisagreeinfo += window.pss.createHtmlTag("img", { alt: 'Permalink', src: "/assets/thumbs-down.png"});
							html += window.pss.createHtmlTag("div", { 'class': 'review_result_right' }, totalagreeinfo + totaldisagreeinfo);
					}	
					else if(key == 'subject' || key == 'object') {
						if (key == 'object'){
							var objinfo = (obj.hits[i])[key];
							html += (obj.hits[i])["predicateid"] > 2 ? window.pss.createHtmlTag("span", { 'class': 'review_result_right' }, objinfo) : window.collex.createReviewMediaBlock(objinfo, j);						
							object = (obj.hits[i])["predicateid"] > 2 ? objinfo : objinfo['uri'];
						}
						else if (key == 'subject'){
							subjecturi = ((obj.hits[i])[key])['uri'];
							html += window.collex.createReviewMediaBlock((obj.hits[i])[key], j);	
						}			
						j += 1;
					}	
				}	
				
				html+= window.pss.createHtmlTag("br");
				var reviewbtn = ""
				if (window.collex.isBibliographer || window.collex.isAdmin) 
					reviewbtn = window.pss.createHtmlTag("button", { 'class': 'reviewbtn' }, "Review");
				
				var historybtn = window.pss.createHtmlTag("a", { 'class': 'see_history', 'href': "/fullrecord?action=fullrecord&uri="+subjecturi+"&object="+object, title: ' '}, "See History");
				var buttons = window.pss.createHtmlTag("div", { 'class': 'review_result_right' }, reviewbtn+"&nbsp;&nbsp;"+historybtn);
				reviewrow += window.pss.createHtmlTag("div", { 'class': 'reviewrow' }, html+buttons);
			}
			$('.review-results').html(reviewrow);	
		}	
	};

	window.collex.createReviewMediaBlock = function(obj, index) {

		var imageBlock = createImageBlock(index, obj);
		var resultHeader = createResultHeader(obj);
		var resultContents = createResultContents(obj, index);
		var results = window.pss.createHtmlTag("div", { 'class': 'review_result_right' }, resultHeader+resultContents);
		var klass = "review-result";
		var html = "";
		html += window.pss.createHtmlTag("div", { 'id': 'review_result_'+ index, 'class': klass, 'data-index': index, 'data-uri': obj.uri, 'data-url': obj.url, 'data-title': obj.title }, imageBlock+results);
		return html;
	};

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
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Digital Surrogats:', obj.digital_surrogats, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Coverage:', obj.coverage, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Sub Location:', obj.subLocation, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Is Referenced By:', obj.isReferencedBy, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Shelf Mark:', obj.shelfMark, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Contributor:', obj.contributor, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('single_item', 'Instance of:', obj.instanceof, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Has Instance:', obj.hasInstance, true));
		table += window.pss.createHtmlTag("tr", {}, createResultContentItem('multiple_item', 'Description:', obj.description, true));
		
		if (needShowMoreLink) {
			html += window.pss.createHtmlTag("button", { id: "more-review_result_"+index,  'class': 'nav_link more', onclick: 'removeHidden("more-review_result_' + index + '", "review_result_' + index + '");return false;'}, '[more...]');
			html+= window.pss.createHtmlTag("br");
			html+= window.pss.createHtmlTag("br");
			html+= window.pss.createHtmlTag("br");
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
		if (startHidden) {
			klass += ' hidden';
			needShowMoreLink = true;
		}
		if (rowClass)
			klass += " " + rowClass;

		switch (type) {
			case "separate_lines":
				var html = window.pss.createHtmlTag("div", { 'class': klass },
					window.pss.createHtmlTag("span", { 'class': 'label' }, label) +
					window.pss.createHtmlTag("span", { 'class': 'value' }, value[0]));
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
			return window.pss.createHtmlTag("a", { 'class': 'nines_link doc-title', 'href': "/fullrecord?action=fullrecord&uri="+url+"", title: ' ' }, title);
		else {
			titleLinkCounter++;
			var title1 = title.substr(0, 79);
			var title2 = title.substr(79);
			var id = "title_more_" + titleLinkCounter;
			var initial_title = title1 + window.pss.createHtmlTag("span", { id: id, style: 'display:none;' }, title2);
			return window.pss.createHtmlTag("a", { class: 'nines_link doc-title', title: title,  href: "/fullrecord?action=fullrecord&uri="+url+"" }, initial_title) +
			window.pss.createHtmlTag("a", { href: '#', onclick: 'return false;', class: 'nav_link more_link', 'data-div': id, 'data-less': '[show less]', title: ' ' }, '...[show full title]');
		}
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

	function getDetails() {
      	window.showProgressDialog('Searching...');
		var onSuccess = function(resp) {
			var json = JSON.parse(resp.responseText);
			body.trigger('RedrawReviewResults', json); 
			window.cancelProgressDialog();
		};
		var onError = function(resp) {
	      	window.cancelProgressDialog();
			window.console.error(resp.responseText);
		};
		serverAction({action:{actions: "/review/get_review_info", els: [], onSuccess:onSuccess, onError:onError}});	
	} 

	function initializeReview() {
		// This is called on initial page load.
		if (window.collex.pageName === 'review') {
			console.log("initializeReview() showing progress");
			getDetails();
		}
	}

	initializeReview();

 });