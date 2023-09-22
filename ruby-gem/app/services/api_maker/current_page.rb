class ApiMaker::CurrentPage < ApiMaker::ApplicationService
  arguments :query

  def perform
    limit = query.values[:limit] || 30
    offset = query.values[:offset]
    current_page = (offset / limit) + 1
    succeed! current_page
  end
end
