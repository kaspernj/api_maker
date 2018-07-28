Rails.application.routes.draw do
  namespace :api_maker do
    resources :projects, :tasks
  end

  namespace :models do
    get :find
  end
end
