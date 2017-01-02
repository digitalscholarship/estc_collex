class ContributeController < ApplicationController
	before_filter :init_view_options

  def init_view_options
    @site_section = :contribute
    @solr = Catalog.factory_create(session[:use_test_index] == "true")
    return true
  end

  def index

  end
  
end
