class ApiMaker::ModelsFinderService < ApiMaker::ApplicationService
  def execute!
    load_models

    @scanned = {}
    @yielded = {}
    skip = ["ActiveRecord::SchemaMigration", "ApplicationRecord", "DataMigrate::DataSchemaMigration"]
    result = []

    find_subclasses(ActiveRecord::Base) do |sub_class|
      next if !sub_class.name || skip.include?(sub_class.name)
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
    Rails.application.eager_load!

    load_models_for(Rails.root)
    engines.each do |engine|
      load_models_for(engine.root)
    end

    true
  end

  def load_models_for(root)
    Dir.glob("#{root}/app/models/**/*.rb") do |model_path|
      next unless model_path.start_with?(Rails.root.to_s)
      path_name = model_path.gsub(/\A#{Regexp.escape(Rails.root.to_s)}\/app\/models\//, "").gsub(/\.rb\Z/, "")
      model_class = path_name.classify.constantize
      next if model_class.abstract_class?
      model_class.attribute_names # This should load the model in ActiveRecord
    end
  end
end
