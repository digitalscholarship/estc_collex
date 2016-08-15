namespace :predicates do
  require 'csv'

  desc "Add Predicates to DB (file=path_to_file)"
  task :add => :environment do
    path = ENV['file']
    if path.blank?
      puts "Usage: rake predicates:add file= #{path}"
      return
    end

    CSV.foreach(path, :headers => true) do |row|
      uri = row[0]
      display_name = row[1]

      predicate = Predicate.find_by_uri(uri)
      predicate = Predicate.find_by_display_name(display_name) if predicate.blank?

      predicate.blank? ? Predicate.create({:uri => row[0], :display_name => row[1]}) : (puts "duplicate uri: #{uri} exists in the csv file!")      
      
    end
  end

end
