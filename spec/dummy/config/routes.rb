Rails.application.routes.draw do
  mount ApiMaker::Engine => "/api_maker"
end
