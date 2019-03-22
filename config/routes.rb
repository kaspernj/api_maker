ApiMaker::Engine.routes.draw do
  post "commands" => "commands#create"
  post "devise/do_sign_in" => "devise#do_sign_in"
  post "devise/do_sign_out" => "devise#do_sign_out"

  resources :session_statuses, only: :create

  ApiMaker::Routing.install(self)
end
