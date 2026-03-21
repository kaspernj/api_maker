require "rails_helper"

describe "api maker - persist session" do
  include Devise::Test::IntegrationHelpers

  let(:user) { create(:user) }

  it "sets the rememberable cookie when asked to persist a signed-in session" do
    host! "127.0.0.1"
    sign_in user

    post "/api_maker/session_statuses"

    csrf_token = response.parsed_body.fetch("csrf_token")

    post "/api_maker/commands", params: {
      pool: {
        service: {
          calls: {
            services: {
              "1" => {
                args: {
                  service_args: {rememberMe: true, scope: "user"},
                  service_name: "Devise::PersistSession"
                },
                id: 1
              }
            }
          }
        }
      }
    }, headers: {
      "X-CSRF-Token" => csrf_token
    }

    expect(response).to have_http_status(:ok)
    expect(response.cookies).to include("remember_user_token")
  end
end
