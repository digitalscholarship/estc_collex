jQuery(document).ready(function($) {
	"use strict";
	var body = $("body");
	function setup(e, self) {
		e.preventDefault(); 
		var el = $(self);
		var parent = el.closest(".reviewrow");
		var annotationinfo = parent.find(".annotationid");
		var annotationid = annotationinfo[0].id;
		return {annotationid: annotationid};
	}

	body.on("click", '.review-results .reviewbtn', function (e) {
		var params = setup(e, this);
		getreviewfeedback(params.annotationid);
	});

	function getreviewfeedback(annotationid){
		var title = "Provide your feedback";
		var existing_note = "";
		var populate_collex_obj_url = '/forum/get_nines_obj_list'; 
		new feedbackDlg('/review/get_review_feedback', annotationid, [{text: 'Approve', value: '1'}, {text: 'Disapprove', value: '2'}]); 
	}
});