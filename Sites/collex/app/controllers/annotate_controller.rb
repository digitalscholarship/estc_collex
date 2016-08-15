class AnnotateController < ApplicationController
	before_filter :init_view_options

  def init_view_options
    @site_section = :annotate
    @solr = Catalog.factory_create(session[:use_test_index] == "true")
    return true
  end

  def index
  	@annotation = Annotation.new
	  @predicates = Predicate.where('id NOT IN (?)' , [1,2]).order(:display_name)

  end

  def create
    user_id = get_curr_user_id()
  	flag = (is_bibliographer? or is_admin?) ? "2" : "1" # flag 1 => active, 2=> review done by admin (if biblographer is making any annotations or match then it should be approved directly)
  
puts "========================================================================"
puts params
params[:annotationoption]

#test = @solr.modify_object(uri, action, "title", "111112222223333333111111") # action = append or replace
test = @solr.modify_object(session[:annotateUri], params[:annotationoption], "date_label", "2000") # action = append or replace
puts test
    subject_uri = session[:annotateUri]
    object_uri = params[:annotation][:object_uri]

    matchinfo = Annotation.where(["subject_uri = ? and object_uri = ?", subject_uri, object_uri])
      if(matchinfo.present?)
        @errorMsg = "The following annotation has already been made Please go to the Review page."
      elsif(subject_uri.eql? object_uri)
        @errorMsg = "You can not make annotation with the same subject."
      end

      if @errorMsg.nil?
        lastrecord = Attachment.find(:last)
        lastrecord = if lastrecord.present? then lastrecord.attachment_no else 0 end
        
        begin
          respond_to do |format| 
              annotation = Annotation.new()
              annotation.subject_uri = subject_uri
              annotation.flag = flag
              annotation.user_id = user_id
              annotation.feedback = params[:annotation][:feedback] if ( is_scholar? and !is_bibliographer? or !is_admin?)
              annotation.object_uri = object_uri
              annotation.predicate_id = params[:annotation][:predicate] 
              annotation.attachment_no = (lastrecord + 1) if params[:documents].present? and ( is_scholar? and !is_bibliographer? or !is_admin? )
              annotation.save!
            
            if is_bibliographer? or is_admin?
              annotationid = Annotation.where(["subject_uri = ? and object_uri = ?", subject_uri, object_uri])
              review = Review.new()
              review.annotation_id = annotationid.first.id
              review.user_id = user_id
              review.feedback = params[:annotation][:feedback]
              review.attachment_no = (lastrecord + 1) if params[:documents].present?
              review.status = 1 # This is direct approval. Biblographer's annotation is direct approval.  # 1. approve, 2. disapprove
              review.save!
            end
                              
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

          	format.html { redirect_to '/fullrecord?action=fullrecord&uri='+session[:annotateUri]+'' }        
          end  
        end 
      else
        #redirect_to :back
        #flash[:notice] = "Post can not be saved, please enter information."
#render :new
      end





  end

end
