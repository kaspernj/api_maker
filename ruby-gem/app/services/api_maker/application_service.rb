class ApiMaker::ApplicationService < ServicePattern::Service
  # Replaces magic variables with actual variable names
  def api_maker_json(object)
    json = object.to_json
    json.gsub!(/"\{\{([A-z_]+?)\}\}"/, "\\1")
    json
  end
end
