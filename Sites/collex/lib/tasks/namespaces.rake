namespace :namespaces do
  require 'csv'

  desc "Add tablename and path to namespaces table to DB (file=path_to_file)"
  task :add => :environment do
    path = ENV['file']
    if path.blank?
      puts "Usage: rake namespaces:add file= #{path}"
      return
    end

    CSV.foreach(path, :headers => true) do |row|
      tablename = row[0]
      path = row[1]

      namespace = Namespace.find_by_tablename(tablename)
      namespace = Namespace.find_by_path(path) if namespace.blank?

      namespace.blank? ? Namespace.create({:tablename => row[0], :path => row[1]}) : (puts "duplicate tablename: #{tablename} exists in the csv file!")      
      
    end
  end
end
