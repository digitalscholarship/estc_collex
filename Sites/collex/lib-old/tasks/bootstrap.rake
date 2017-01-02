##########################################################################
# Copyright 2013 Applied Research in Patacriticism and the University of Virginia
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

namespace :bootstrap do
	desc "Set up the database with the minimum required (arg: URL of catalog)"
	task :globals => :environment do
		# This can be called with a completely blank database, or it can be called after the initial seeding was done.
		# We have some tests to be sure that entries aren't created twice.

		# add roles
		roles = Role.all
		if roles.length == 0
			Role.create :name => "admin", :id => 1
			Role.create :name => "biblographer", :id => 2
			Role.create :name => "scholar", :id => 3
			Role.create :name => "user", :id => 4
		end

		# now, create one user as an administrator, so they can bootstrap the system.
		admin = User.find_by_username('admin')
		if admin.blank?
			User.create_user('admin', 'password', '')
			admin = User.find_by_username('admin')
			puts admin.roles
			ar = Role.find_by_name("admin")
			roles = []
			roles << ar
			admin.roles = roles
			admin.save!
		end

		# set the catalog url
		url = ENV['url']
		rec = Setup.find_by_key('site_solr_url')
		if rec.present?
			rec.value = url
			rec.save!
		else
			Setup.create!({key: 'site_solr_url', value: url})
		end
	end
end
