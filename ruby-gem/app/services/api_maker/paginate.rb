class ApiMaker::Paginate < ApiMaker::ApplicationService
  arguments :page, :per_page, :query

  def perform
    parsed_per_page = (per_page.presence || 30).to_i
    offset = (page - 1) * parsed_per_page

    succeed! query.limit(parsed_per_page).offset(offset)
  end
end
