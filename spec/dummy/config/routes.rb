Rails.application.routes.draw do
  mount ApiMaker::Engine => "/api_maker"

  devise_for :users

  namespace :devise_specs do
    get :current_user_spec
    get :sign_in
    get :sign_out
  end

  namespace :models do
    get :belongs_to
    get :create
    get :destroy
    get :find
    get :has_many
    get :has_one
    get :preload
    get :ransack
    get :update
  end
end
