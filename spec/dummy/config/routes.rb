Rails.application.routes.draw do
  devise_for :users

  namespace :api_maker do
    resources :projects, :tasks
  end

  namespace :models do
    get :create
    get :destroy
    get :find
    get :has_many
    get :ransack
    get :update
  end
end
