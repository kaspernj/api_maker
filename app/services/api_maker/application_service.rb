class ApiMaker::ApplicationService < ServicePattern::Service
  def api_maker_json(object)
    json = object.to_json
    json.gsub!(/"\{\{(.+?)\}\}"/, "\\1")
    json
  end
end
