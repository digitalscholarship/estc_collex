class ReviewController < ApplicationController
  before_filter :init_view_options

  def index  
    get_search_results_button_info()
    get_annotate_match_button_info()
    get_predicate_info()
    get_site_info()

    params[:positivereview] = params[:positivereview].nil? ? 0 : params[:positivereview].to_i
    params[:predicate] = params[:predicate].nil? ? 0 : params[:predicate].to_i
    params[:user] = params[:user].nil? ? 0 : params[:user].to_i

    @predicates = Predicate.all
    @users = User.all
    
    conditions = { }
    conditions[:flag] = 1    
    conditions[:user_id] = params[:user] if params[:user].present? and params[:user] > 0
    conditions[:predicate_id] = params[:predicate] if params[:predicate].present? and params[:predicate] > 0
    

    #if (params[:predicate]).nil? or (params[:predicate]).empty?
	  #@annotations = Annotation.joins(:predicate).select('annotations.id, annotations.subject_uri, annotations.object_uri, predicates.id as predicateId, predicates.display_name')
  	#.where(annotations: {flag: 1, user_id: userid.present?}).order('annotations.created_at desc')
    @annotations = Annotation.joins(:predicate).select('annotations.id, annotations.subject_uri, annotations.object_uri, predicates.id as predicateId, predicates.display_name')
    .where(annotations: conditions).order('annotations.created_at desc')
  	#else
    #  @annotations = Annotation.joins(:predicate).select('annotations.id, annotations.subject_uri, annotations.object_uri, predicates.id as predicateId, predicates.display_name')
    #.where(annotations: {flag: 1, predicate_id: params[:predicate], user_id: userid.present? }).order('annotations.created_at desc')
    #@annotations = Annotation.joins(:predicate).select('annotations.id, annotations.subject_uri, annotations.object_uri, predicates.id as predicateId, predicates.display_name')
    #.where(annotations: h).order('annotations.created_at desc')
    #end


  	path = Namespace.where('tablename = ? ', 'annotations').first.path
    
  	@results = []
  	@annotations.each do |annotation| 
		  annotationPath = path + '/' + annotation.id.to_s
      	
        totalagree_disagree = Annotation.select("SUM(case when flag = 3 then 1 else 0 end) as TotalAgree, SUM(case when flag = 4 then 1 else 0 end) as TotalDisagree")
      	.where(annotations: {object_uri: annotationPath})

        objectinfo = annotation['predicateId'] > 2 ? annotation.object_uri : @solr.get_object(annotation.object_uri)

      	if params[:positivereview] > 0
          if totalagree_disagree.present? and totalagree_disagree.first.TotalAgree >= params[:positivereview]
            @results.push({:annotationid => annotation.id, :predicateid => annotation['predicateId'], :subject => @solr.get_object(annotation.subject_uri), 
              :predicate => annotation.display_name, :object => objectinfo, :totalAgree => totalagree_disagree.first.TotalAgree, 
              :totalDisagree => totalagree_disagree.first.TotalDisagree})             
          end
        else          
          totalagree_disagree.present? ? @results.push({:annotationid => annotation.id, :predicateid => annotation['predicateId'], :subject => @solr.get_object(annotation.subject_uri), 
              :predicate => annotation.display_name, :object => objectinfo, :totalAgree => totalagree_disagree.first.TotalAgree, 
              :totalDisagree => totalagree_disagree.first.TotalDisagree}) : @results.push({:annotationid => annotation.id, :predicateid => annotation['predicateId'], :subject => @solr.get_object(annotation.subject_uri), 
              :predicate => annotation.display_name, :object => objectinfo, :totalAgree => 0, :totalDisagree => 0})          
        end
    end
    
    @results = @results.paginate(:page => params[:page], :per_page => 3)
    session[:results] = @results 
    session[:annotations] = @annotations 
  end

  def get_review_info
  	@annotations = session[:annotations]
  	
  	results = session[:results]
    
	  respond_to do |format|
    format.json {
      render json: { hits: results }
    }
    end
  end

  def get_review_feedback
  	feedback = params[:feedback]
    annotationid = params[:annotationid]

    if feedback.present?
      lastrecord = Attachment.find(:last)
      lastrecord = if lastrecord.present? then lastrecord.attachment_no else 0 end
      
      begin
        review = Review.new()
        review.annotation_id = annotationid.to_i
        review.user_id = get_curr_user_id()
        review.feedback = feedback
        review.attachment_no = (lastrecord + 1) if params[:documents].present?
        review.status = params[:opinion] # 1. approve, 2. disapprove
        review.save!

        if params[:documents].present?
          params[:documents].each { |document|
          	time_footprint = Time.now.to_formatted_s(:number)
              uniq_name = (0...10).map { (65 + rand(26)).chr }.join

              File.open(Rails.root.join('public', 'uploads', document.original_filename), 'wb') do |file|
                file.write(document.read)
                uniq_filename = (lastrecord + 1).to_s + "_" + uniq_name + "_" + time_footprint + File.extname(file)
                uniq_filepath = Rails.root.join('public', 'uploads', uniq_filename)
                File.rename(file, uniq_filepath)

                attachment = Attachment.new
                attachment.attachment_no = (lastrecord + 1)
                attachment.file_name = uniq_filename
                attachment.content_type = document.content_type
                attachment.save!
            end
          }
        end

        Annotation.where('id = ? ' , annotationid).update_all(flag: 2) # made decision on annotation or match as approved or disapproved by updating the flag = 2

        flash = "OK:Review Saved!!"
      rescue Exception => msg
        flash = "**** ERROR: Saving review: " + msg
      end
    else
      flash = "Please provide your feedback!!"
    end
    render :text => respond_to_file_upload("stopReviewInfo", flash)
  end
  
  def init_view_options
     @site_section = :review
	 @solr = Catalog.factory_create(session[:use_test_index] == "true")
	 @archives = @solr.get_resource_tree()
	 set_archive_toggle_state(@archives)
	 @other_federations = []

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
