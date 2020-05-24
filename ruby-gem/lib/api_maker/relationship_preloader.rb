class ApiMaker::RelationshipPreloader
  def self.parse(preload_param)
    if preload_param.nil?
      nil
    elsif preload_param.is_a?(String)
      ApiMaker::RelationshipPreloader.parse_string(preload_param)
    elsif preload_param.is_a?(Array)
      ApiMaker::RelationshipPreloader.parse_array(preload_param)
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
      parsed.each do |key, value|
        if result.key?(key)
          if result[key].is_a?(String)
            result[key] = [result[key], value]
          elsif result[key].is_a?(Array)
            result[key] << value
          else
            raise "Unknown object: #{result[key].class.name}"
          end
        else
          result[key] = value
        end
      end
    end

    result
  end
end
