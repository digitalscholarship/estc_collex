class MatchController < ApplicationController
before_filter :init_view_options

  def init_view_options
    @site_section = :match
    return true
  end

  def index
    @annotation = Annotation.new
    @objs = session[:objectparams]
    subjectUri = session[:uri]
    @matchinfo = []
    @objs.each do |obj|
      objectUri =  obj[1][:objectUri]
      objectTitle = obj[1][:objectTitle]
      predicateDisplayname = obj[1][:predicateDisplayname]
      predicateId = obj[1][:predicateId]
      annotation = Annotation.where(["subject_uri = ? and object_uri = ?", subjectUri, objectUri])
      if(annotation.present?)
        @matchinfo.push({objectTitle: objectTitle, objectUri: objectUri, predicateDisplayname: predicateDisplayname, errorMsg: "The following match has already been made. Please go to the Review page."})
      elsif(subjectUri.eql? objectUri)
        @matchinfo.push({objectTitle: objectTitle, objectUri: objectUri, predicateDisplayname: predicateDisplayname, errorMsg: "You can not make assertion with the same subject."})
      else
        @matchinfo.push({objectTitle: objectTitle, objectUri: objectUri, predicateId: predicateId, predicateDisplayname: predicateDisplayname, errorMsg: ""})
      end
    end
    session[:matchinfo] = @matchinfo

  end

  def get_match_info
    if params[:objs]
      session[:objectparams] = params[:objs]
    end

    respond_to do |format|
    format.json {
      render json: { objects: "testttt" }
    }
    end

  end

  def create
    session[:paramsinfo] = params 
    matchinfo = session[:matchinfo]    
    @user_id = params[:annotation][:user_id] = get_curr_user_id()
    flag = ( is_bibliographer? or is_admin? ) ? "2" : "1" # flag 1 => active, 2=> review done by admin (if biblographer is making any annotations or match then it should be approved directly)
    
    subjectUri = session[:uri]
    
    lastrecord = Attachment.find(:last)
    lastrecord = if lastrecord.present? then lastrecord.attachment_no else 0 end
    annotationsave = false
    begin
      respond_to do |format|       
        matchinfo.each do |obj|
          if(obj[:errorMsg].blank?)            
            annotation = Annotation.new()
            annotation.subject_uri = subjectUri
            annotation.flag = flag
            annotation.user_id = @user_id
            annotation.feedback = params[:annotation][:feedback] if ( is_scholar? and !is_bibliographer? or !is_admin?)
            annotation.object_uri = obj[:objectUri]
            annotation.predicate_id = obj[:predicateId]
            annotation.attachment_no = (lastrecord + 1) if params[:documents].present? and ( is_scholar? and !is_bibliographer? or !is_admin? )
            annotation.save!
            annotationsave = true

            if is_bibliographer? or is_admin?
              annotationid = Annotation.where(["subject_uri = ? and object_uri = ?", subjectUri, obj[:objectUri]])
              review = Review.new()
              review.annotation_id = annotationid.first.id
              review.user_id = @user_id
              review.feedback = params[:annotation][:feedback]
              review.attachment_no = (lastrecord + 1) if params[:documents].present?
              review.status = 1 # This is direct approval. Biblographer's annotation is direct approval.  # 1. approve, 2. disapprove
              review.save!
            end

          end
        end

        if annotationsave == true  
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
            params[:documents] = nil rescue nil
          end 
        end
       format.html { redirect_to '/fullrecord?action=fullrecord&uri='+subjectUri+'' } 
      end

    end       
  end
end





