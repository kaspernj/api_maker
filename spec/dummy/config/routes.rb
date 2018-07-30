Rails.application.routes.draw do
  devise_for :users

  namespace :api_maker do
    resources :projects, :tasks, :users
  end

  namespace :devise_specs do
    get :current_user_spec
  end

  namespace :models do
    get :belongs_to
    get :create
    get :destroy
    get :find
    get :has_many
    get :has_one
    get :ransack
    get :update
  end
end
