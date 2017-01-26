###############################################################################
#    Copyright (c) 2017, Carl Stahmer - www.carlstahmer.com                   #
#                                                                             #
#    This file is part of the ESTC Collex Sui.                                #
###############################################################################
class DetailsController < ApplicationController
  require 'net/http'
  require 'json'

  # get holding information for a uri
  # GET /details/holdings?q=uri:http://uri.org
  def holdings
  	
  	#setup solr request url
  	item_uri = params[:uri]
  	item_uri = item_uri.gsub(/:/, '%3A')
  	item_uri = item_uri.gsub(/\//, '%2F')
  	curl_url = "http://estc21.ucr.edu:8983/solr/archive_estcstar/select?q=uri%3A%22#{item_uri}%22&wt=json&indent=true"
  	
  	uri = URI.parse(curl_url)
	http = Net::HTTP.new(uri.host, uri.port)
	response = http.request(Net::HTTP::Get.new(uri.request_uri))
  	
  	json_ret = JSON.parse(response.body)
  	
  	# ret_val = json_ret["responseHeader"]
  	holdingInst = json_ret["response"]["docs"][0]["role_RPS"]
  	shelfMark = json_ret["response"]["docs"][0]["shelfMark"]
  	
  	ret_val = "#{holdingInst}: #{shelfMark}"
  	ret_val = ret_val.gsub(/\[/, "")
  	ret_val = ret_val.gsub(/\]/, "")
  	ret_val = ret_val.gsub(/"/, "")
  	
  	render :text => ret_val
  	
  end
  
  # get full graph for uri
  # GET /details/graph?q=uri:http://uri.org
  def graph
  	
  	#setup solr request url
  	item_uri = params[:uri]
  	item_uri = item_uri.gsub(/:/, '%3A')
  	item_uri = item_uri.gsub(/\//, '%2F')
  	curl_url = "http://estc21.ucr.edu:8983/solr/archive_estcstar/select?q=uri%3A%22#{item_uri}%22&wt=json&indent=true"
  	
  	uri = URI.parse(curl_url)
	http = Net::HTTP.new(uri.host, uri.port)
	response = http.request(Net::HTTP::Get.new(uri.request_uri))
  	
  	

  	render :text => response.body
  	
  end


end
