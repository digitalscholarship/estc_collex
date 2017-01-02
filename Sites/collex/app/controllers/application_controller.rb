##########################################################################
# Copyright 2007 Applied Research in Patacriticism and the University of Virginia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
##########################################################################
class ApplicationController < ActionController::Base
  #session_times_out_in 4.hours
  #before_filter :set_charset
  
  before_filter :session_create

  helper_method :user_signed_in?, :current_user, :username, :user, :is_admin?, :is_bibliographer?,  
                 :is_scholar?, :get_curr_user_id, :respond_to_file_upload, :get_curr_user_name,
                 :get_search_results_button_info, :get_annotate_match_button_info, :get_predicate_info, :get_site_info

  protect_from_forgery

  # TODO-PER: This is for the old auto complete plugin. It should be replaced with the jquery one.
  def self.auto_complete_for(object, method, options = {})
	  define_method("auto_complete_for_#{object}_#{method}") do
		  find_options = {
			  :conditions => [ "LOWER(#{method}) LIKE ?", '%' + params[object][method].downcase + '%' ],
			  :order => "#{method} ASC",
			  :limit => 10 }.merge!(options)

		  @items = object.to_s.camelize.constantize.find(:all, find_options)

		  render :inline => "<%= auto_complete_result @items, '#{method}' %>"
	  end
  end

  def test_exception_notifier
		raise "This is only a test of the automatic notification system."
	end

	def test_error_response
		render :text => 'This is a test message from the server.', :status => :bad_request
	end

  private
  	def refill_session_cache()
		session[:num_docs] = nil
		session[:num_sites] = nil
		session[:federations] = nil
		session[:archives] = nil
		session[:carousel] = nil
		session[:resource_tree] = nil
      session[:languages] = nil
      	Catalog.set_cached_data(session[:carousel], session[:resource_tree], session[:archives], session[:languages])
		session_create()
	end

	def session_create
		logger.warn("Session: #{ session && !session['user'].blank? ? session['user'][:username] : "ANONYMOUS" } #{session ? session.keys : "ERROR"}")
		
		begin
			ActionMailer::Base.default_url_options[:host] = request.host_with_port
			if !self.kind_of?(TestJsController)
				solr = Catalog.factory_create(session[:use_test_index] == "true")
				session[:num_docs] ||= solr.num_docs()
				session[:num_sites] ||= solr.num_sites()
				session[:num_docs] ||= 0
				session[:num_sites] ||= 0
			end
			if session[:federations] == nil
				solr ||= Catalog.factory_create(session[:use_test_index] == "true")
				session[:federations] = {}
				all_feds = solr.get_federations()
				default = Setup.find_by_key("site_default_federation")
				cfg = Setup.where('`key` like ? and value=?', 'federation_%', "true")
				cfg.each do |fed_rec|
				  fed = fed_rec.key.gsub(/federation_/,'')
				  all_feds.each do |a|
				     if a[0] == fed || default.value == a[0]
				        puts "== ADD"
				        session[:federations][a[0]] = a[1]
				     end
				  end
				end
			end

			if session[:archives] == nil || session[:carousel] == nil || session[:resource_tree] == nil				
				solr ||= Catalog.factory_create(session[:use_test_index] == "true")
				session[:archives] = solr.get_archives()
				session[:carousel] = solr.get_carousel()
				session[:resource_tree] = solr.get_resource_tree()
		        session[:languages] = solr.get_languages()
			else
				Catalog.set_cached_data(session[:carousel], session[:resource_tree], session[:archives], session[:languages])
			end

		rescue Catalog::Error => e
			logger.error "****\n**** Catalog Error: #{e.to_s} ApplicationController:session_create\n****"
			session[:num_docs] ||= 0
			session[:num_sites] ||= 0
			session[:federations] ||= {}
			session[:archives] ||= []
			session[:carousel] ||= []
			session[:resource_tree] ||= []
		end
    end

#    def set_charset
#      headers['Content-Type'] = 'text/html; charset=utf-8'
#      headers['Pragma'] = 'no-cache'
#      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
#    end

	# HACK-PER: The authentication system in Collex was created way before Devise, but it would be a good
	# idea to migrate towards Devise. Defining these two helpers is a way to centralize all access to the current user in the meantime.

	def user_signed_in?
		session[:user] ? true : false
	end

	def current_user
		if @current_user_cached.blank?
			if user_signed_in?
				@current_user_cached = User.where(username: session[:user][:username]).first
			else
				@current_user_cached = nil
			end
		end
		return @current_user_cached
	end

	def set_current_user(user)
		session[:user] = user
	end

    def is_admin?
      user = session[:user]
      if user and user[:role_names] and user[:role_names].include? 'admin'
        return true
      end
      return false
    end

    def is_bibliographer?
      user = session[:user]
      if user and user[:role_names] and user[:role_names].include? 'bibliographer'
        return true
      end
      return false
    end

    def is_scholar?
      user = session[:user]
      if user and user[:role_names] and user[:role_names].include? 'scholar'
        return true
      end
      return false
    end

	def get_curr_user_id
		return nil if !user_signed_in?
    	
    	cu = current_user
      	return nil if cu.nil?
		
		return cu.id
	end

  def get_curr_user_name
    return nil if !user_signed_in?
    cu = current_user
    return nil if cu.nil?
    return cu.fullname
  end

  def render_404
      respond_to do |type|
        type.html { render :file => "#{Rails.root}/public/static/#{SKIN}/404.html", :status => "404 Not Found", :layout => false }
        type.all  { render :nothing => true, :status => "404 Not Found" }
      end
    end

    def render_422
      respond_to do |type|
        type.html { render :file => "#{Rails.root}/public/static/#{SKIN}/422.html", :status => "422 Error", :layout => false }
        type.all  { render :nothing => true, :status => "422 Error" }
      end
    end
	#
    #def render_500
    #  respond_to do |type|
    #    type.html { render :file => "#{Rails.root}/public/static/#{SKIN}/500.html", :status => "500 Error", :layout => false }
    #    type.all  { render :nothing => true, :status => "500 Error" }
    #  end
    #end
	#
    #def rescue_action_in_public(exception)
    #  case exception
    #    when ::ActiveRecord::RecordNotFound, ::ActionController::UnknownController, ::ActionController::UnknownAction, ::ActionController::RoutingError
    #      render_404
	#
    #    else
    #      render_500
	#
    #      deliverer = self.class.exception_data
    #      data = case deliverer
    #        when nil then {}
    #        when Symbol then send(deliverer)
    #        when Proc then deliverer.call(self)
    #      end
	#
    #      ExceptionNotifier.deliver_exception_notification(exception, self,
    #        request, data)
    #  end
    #end

	def respond_to_file_upload(callback, message)
	  return "<script type='text/javascript'>window.top.window.#{callback}('#{message}');</script>"
	end

	def get_search_results_button_info()
		searchbuttons_keys = ['enable_searchresults_collect', 'enable_searchresults_uncollect', 'enable_searchresults_discuss', 'enable_searchresults_exhibits']
		@searchresult = Setup.where(:key => searchbuttons_keys)
		gon.searchresultbutton=@searchresult
    end

    def get_annotate_match_button_info()
    	annotatematchbuttons_keys = ['enable_annotate_button', 'enable_match_button']
		@annotatematchbuttoninfo = Setup.where(:key => annotatematchbuttons_keys)
		gon.annotatematchbutton=@annotatematchbuttoninfo
    end

    def get_predicate_info()
      	@predicates = Predicate.where('id IN (?)' , [1,2])
      	gon.predicatesInfo = @predicates      	
    end

   	def get_site_info()
   		gon.enable_site = Setup.where(:key => 'enable_site')
   	end


end
