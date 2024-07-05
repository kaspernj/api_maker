Rails.application.routes.draw do
  mount ApiMaker::Engine => "/api_maker"

  devise_for :users

  namespace :commands do
    get :collection_command
    get :member_command
  end

  namespace :devise_specs do
    get :current_user_spec
    get :sign_in
    get :sign_out
  end

  namespace :models do
    get :accessible_by
    get :belongs_to
    get :create
    get :destroy
    get :find
    get :has_many
    get :has_one
    get :preload
    get :ransack
    get :validate
  end

  routes = JSON.parse(Rails.root.join("app/javascript/shared/route-definitions.json").read)
  ApiMaker::ResourceRouting.install_resource_routes(self, route_definitions: routes)
end
