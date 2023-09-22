class ApiMaker::TotalCount < ApiMaker::ApplicationService
  arguments :query

  def perform
    count = query.except(:limit, :offset).count
    count = count.size if count.respond_to?(:size) && !count.is_a?(Integer)

    succeed! count
  end
end
