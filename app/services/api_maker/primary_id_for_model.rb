class ApiMaker::PrimaryIdForModel
  # Hack to get the primary ID or fail to make up for if the attribute wasn't selected
  def self.get(model)
    model.id || raise("No attribute called '#{model.class.primary_key}' given on #{model.class.name}")
  end
end
