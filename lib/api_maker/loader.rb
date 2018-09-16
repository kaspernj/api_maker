class ApiMaker::Loader
  def self.load_everything
    resources_dir = Rails.root.join("app", "api_maker", "resources")
    files = Dir.glob("#{resources_dir}/**/*.rb")

    puts "Files: #{files}"

    files.each do |file|
      puts "Require file: #{file}"
      require file
      puts "After require file: #{file}"
    end

    puts "Files loaded"
  end
end
