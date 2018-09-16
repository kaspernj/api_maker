ApiMaker::Engine.routes.draw do
  resources :comments, :customers, :orders, :retailers, :retailer_users
  post "devise/do_sign_in" => "devise#do_sign_in"
  post "devise/do_sign_out" => "devise#do_sign_out"

  ApiMaker::Routing.install(self)
end
