class FullRecordController < ApplicationController
	before_filter :init_view_options

  def index
  	get_search_results_button_info()
		get_annotate_match_button_info()
		get_predicate_info()
		get_site_info()
		
   	session[:fullrecorduri] = params[:uri] 
   	
   	if params[:'chunk.id'].present?
   		session[:fullrecorduri] = params[:uri] + ';chunk.id=' + params[:'chunk.id']
   	end
  	session[:objecturi] = params[:object] 
  	
  end

  def get_fullrecord_info
  	user_id = get_curr_user_id()
  	uri = session[:fullrecorduri]
  	fullrecord = @solr.get_object(uri)
  	
  	annotations = Annotation.joins(:predicate, :user).select('annotations.id, annotations.subject_uri, annotations.flag, annotations.object_uri, annotations.feedback, annotations.attachment_no, predicates.id as predicateId, predicates.display_name, users.fullname')
    .where(annotations: {subject_uri: uri}).order('annotations.created_at desc')

    path = Namespace.where('tablename = ? ', 'annotations').first.path
    
    if session[:objecturi].present?
    	annotationid = Annotation.where('subject_uri = ? AND object_uri = ?', uri, session[:objecturi]).first.id
    end

    results = []
    annotations.each do |annotation| 
      annotationPath = path + '/' + annotation.id.to_s
      totalagree_disagree = Annotation.select("SUM(case when flag = 3 then 1 else 0 end) as TotalAgree, SUM(case when flag = 4 then 1 else 0 end) as TotalDisagree")
      .where(annotations: {object_uri: annotationPath})
      #  Select SUM(case when predicate_id = 3 then 1 else 0 end) as TotalAgree,
      #  SUM(case when predicate_id = 4 then 1 else 0 end) as TotalDisagree
      #  from annotations 
      #  where object_uri = 'https://estc21.lib.ucdavis.edu/annotations/1';

      feedback_info = Annotation.joins(:user).select("annotations.id, annotations.feedback, annotations.predicate_id, annotations.attachment_no, annotations.flag, users.fullname")
      .where(annotations: {object_uri: annotationPath})

		matchattachments = []
		if (annotation.attachment_no).present?
			Dir["#{Rails.root}/public/uploads/"+(annotation.attachment_no).to_s+"_*.*"].each do |attachment|
	  			matchattachments.push(File.basename(attachment)) 
			end
		end

		match_feedback = []
		review_feedback = []

		match_feedback.push(:annotationid => annotation.id, :username => annotation.fullname, :feedback => annotation.feedback, :flag => annotation.flag, :attachment => matchattachments)
		
		if annotation.flag == 2 
			reviewinfo = Review.joins(:user).select("reviews.feedback, reviews.attachment_no, reviews.status, users.fullname").where(reviews: {annotation_id: annotation.id}).first
			if reviewinfo.present?
				reviewattachments = []
				if (reviewinfo.attachment_no).present?
					Dir["#{Rails.root}/public/uploads/"+(reviewinfo.attachment_no).to_s+"_*.*"].each do |attachment|
			  			reviewattachments.push(File.basename(attachment)) 
					end
				end
				reviewstatus = reviewinfo.status == 1 ? "Approved" : "Disapproved"
				review_feedback.push(:username => reviewinfo.fullname, :feedback => reviewinfo.feedback, :flag => reviewstatus, :attachment => reviewattachments)
			end
		end 

		if feedback_info.present?
			feedback_info.each do |feedback|
      			attachments = []
      			if (feedback.attachment_no).present?
					Dir["#{Rails.root}/public/uploads/"+(feedback.attachment_no).to_s+"_*.*"].each do |attachment|
			  			attachments.push(File.basename(attachment)) 
					end
				end
				review_feedback.push(:username => feedback.fullname, :feedback => feedback.feedback, :flag => feedback.flag, :attachment => attachments)
			end
		end
      
      objectinfo = annotation['predicateId'] > 2 ? annotation.object_uri : @solr.get_object(annotation.object_uri)

      if totalagree_disagree.present?
        results.push({:predicateid => annotation['predicateId'], :predicate => annotation.display_name, :object => objectinfo,  :matchfeedback => match_feedback,
        	:totalAgree => totalagree_disagree.first.TotalAgree, :totalDisagree => totalagree_disagree.first.TotalDisagree, :annotationStatus => annotation.flag, 
        	:reviewfeedback => review_feedback}) 
      else
        results.push({:predicateid => annotation['predicateId'], :predicate => annotation.display_name, :object => objectinfo, :matchfeedback => match_feedback, 
             :totalAgree => 0, :totalDisagree => 0, :annotationStatus => annotation.flag, :reviewfeedback => review_feedback})
      end
    end    
    
  	respond_to do |format|
    format.json {
      render json: { annotations: results, hits: fullrecord, objecturi: session[:objecturi], annotationid: annotationid} 
    }
    end
  end

  def init_view_options
   @site_section = :fullrecord
	 @solr = Catalog.factory_create(session[:use_test_index] == "true")
	 @archives = @solr.get_resource_tree()
	 set_archive_toggle_state(@archives)
	 @other_federations = []
	 logger.error("Federation ERROR: #{session[:federations]}")


	 session[:federations].each { |key,val| @other_federations.push(key) if key != Setup.default_federation() } if session[:federations]
	 
	 @searchable_roles = [
			 ["r_art", "Artist"],
			 ["aut", "Author"],
			 ["role_BND", "Binder"],
			 ["role_COL", "Collector"],
			 ["role_COM", "Compiler"],
			 ["role_CRE", "Creator"],
			 ["role_CTG", "Cartographer"],
			 ["ed", "Editor"],
			 ["role_ILU", "Illuminator"],
			 ["role_LTG", "Lithographer"],
			 ["r_own", "Owner"],
			 ["pub", "Publisher"],
			 ["role_POP", "Printer of plates"],
			 ["role_PRT", "Printer"],
			 ["role_RPS", "Repository"],
			 ["role_SCR", "Scribe"],
			 ["role_TRL", "Translator"],
			 ["role_WDE", "Wood Engraver"]
		 ]
	 return true
   end

  def set_archive_toggle_state(archives)
	   archives.each { |archive|
		   if archive['children'].present?
			   if session[:resource_toggle].present? && session[:resource_toggle]["#{archive['id']}"].present? && session[:resource_toggle]["#{archive['id']}"] == 'open'
				   archive['toggle'] = 'open'
			   else
				   archive['toggle'] = 'close'
			   end
			   set_archive_toggle_state(archive['children'])
		   end
	   }
   end   
end
