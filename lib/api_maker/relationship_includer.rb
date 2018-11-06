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
      result.deep_merge!(ApiMaker::RelationshipIncluder.parse(include_param_i))
    end

    result
  end
end
