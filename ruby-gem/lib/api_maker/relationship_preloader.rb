class ApiMaker::RelationshipPreloader
  def self.parse(preload_param)
    if preload_param.nil?
      nil
    elsif preload_param.is_a?(String)
      ApiMaker::RelationshipPreloader.parse_string(preload_param)
    elsif preload_param.is_a?(Array)
      ApiMaker::RelationshipPreloader.parse_array(preload_param)
    elsif preload_param.is_a?(Hash)
      ApiMaker::RelationshipPreloader.parse_hash(preload_param)
    else
      raise "Unexpected parameter given (#{preload_param.class.name}): #{preload_param}"
    end
  end

  def self.parse_string(preload_param)
    splitted = preload_param.split(".")
    initial = splitted.shift
    rest = splitted.join(".")
    {initial => rest}
  end

  def self.parse_array(preload_param)
    result = {}
    preload_param.each do |preload_param_i|
      parsed = ApiMaker::RelationshipPreloader.parse(preload_param_i)
      ApiMaker::RelationshipPreloader.merge_parsed!(result, parsed)
    end

    result
  end

  def self.parse_hash(preload_param)
    result = {}

    preload_param.each do |key, value|
      result[key.to_s] = ApiMaker::RelationshipPreloader.parse(value)
    end

    result
  end

  def self.merge_parsed!(result, parsed)
    parsed.each do |key, value|
      if result.key?(key)
        result[key] = ApiMaker::RelationshipPreloader.merge_values(result[key], value)
      else
        result[key] = value
      end
    end
  end

  def self.merge_values(existing_value, new_value)
    if existing_value.is_a?(Hash) && new_value.is_a?(Hash)
      existing_value.merge(new_value) do |_merge_key, existing_nested_value, new_nested_value|
        ApiMaker::RelationshipPreloader.merge_values(existing_nested_value, new_nested_value)
      end
    elsif existing_value.is_a?(Array)
      existing_value + [new_value]
    else
      [existing_value, new_value]
    end
  end
end
