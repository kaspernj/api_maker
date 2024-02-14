module ApiMaker::SpecHelper::QueryParams
  def query_params
    uri = URI(current_url)
    Rack::Utils.parse_nested_query(uri.query)
  end
end
