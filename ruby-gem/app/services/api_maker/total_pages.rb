class ApiMaker::TotalPages < ApiMaker::ApplicationService
  arguments :query

  def perform
    limit = query.values[:limit] || 30

    count = query.except(:limit, :offset).size
    count = count.size if count.respond_to?(:size) && !count.is_a?(Integer)

    total_pages = (count / limit) + 1

    succeed! total_pages
  end
end
