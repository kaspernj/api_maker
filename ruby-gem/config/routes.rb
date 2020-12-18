ApiMaker::Engine.routes.draw do
  post "commands" => "commands#create"

  resources :session_statuses, only: :create
end
