class ApiMaker::PerPage < ApiMaker::ApplicationService
  arguments :query

  def perform
    limit = query.values[:limit] || 30
    succeed! limit
  end
end
