class ApiMaker::ModelsFinderService < ApiMaker::ApplicationService
  def execute!
    load_models

    @scanned = {}
    @yielded = {}
    skip = ["ActiveRecord::SchemaMigration", "ApplicationRecord", "DataMigrate::DataSchemaMigration"]
    result = []

    find_subclasses(ActiveRecord::Base) do |sub_class|
      next if !sub_class.name || skip.include?(sub_class.name)
      puts "Subclass: #{sub_class.name}"
      result << sub_class
    end

    ServicePattern::Response.new(result: result)
  end

private

  def engines
    ::Rails::Engine.subclasses.map(&:instance)
  end

  def find_subclasses(clazz, &blk)
    return if @scanned[clazz.name]
    @scanned[clazz.name] = true

    clazz.subclasses.each do |subclass|
      yield subclass
      find_subclasses(subclass, &blk)
    end
  end

  def load_models
    load_models_for(Rails.root)
    engines.each do |engine|
      load_models_for(engine.root)
    end

    true
  end

  def load_models_for(root)
    Dir.glob("#{root}/app/models/**/*.rb") do |model_path|
      begin
        require model_path
      rescue StandardError => e # rubocop:disable Lint/HandleExceptions
        puts e.inspect
      end
    end
  end
end
