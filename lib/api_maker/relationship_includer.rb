class ApiMaker::RelationshipIncluder
  def self.parse(include_param)
    if include_param.nil?
      nil
    elsif include_param.is_a?(String)
      ApiMaker::RelationshipIncluder.parse_string(include_param)
    elsif include_param.is_a?(Array)
      ApiMaker::RelationshipIncluder.parse_array(include_param)
    else
      raise "Unexpected parameter given (#{include_param.class.name}): #{include_param}"
    end
  end

  def self.parse_string(include_param)
    splitted = include_param.split(".")
    initial = splitted.shift
    rest = splitted.join(".")
    {initial => rest}
  end

  def self.parse_array(include_param)
    result = {}
    include_param.each do |include_param_i|
      parsed = ApiMaker::RelationshipIncluder.parse(include_param_i)
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
