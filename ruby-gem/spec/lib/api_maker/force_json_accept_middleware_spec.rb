require "rails_helper"

describe ApiMaker::ForceJsonAcceptMiddleware do
  let(:app) { proc { |env| [200, {}, [env["HTTP_ACCEPT"].to_s]] } }
  let(:middleware) { described_class.new(app) }

  it "pins engine requests that arrive asking for HTML to the JSON format" do
    status, _headers, body = middleware.call({"PATH_INFO" => "/api_maker/commands", "HTTP_ACCEPT" => "text/html"})

    expect(status).to eq(200)
    expect(body).to eq(["application/json"])
  end

  it "leaves the Accept header alone for paths outside the engine" do
    _status, _headers, body = middleware.call({"PATH_INFO" => "/users/sign_in", "HTTP_ACCEPT" => "text/html"})

    expect(body).to eq(["text/html"])
  end

  it "negotiates engine requests as JSON, which is what keeps Devise off its navigational branch" do
    env = {
      "HTTP_ACCEPT" => "text/html",
      "PATH_INFO" => "/api_maker/commands",
      "REQUEST_METHOD" => "POST",
      "rack.input" => StringIO.new
    }
    middleware.call(env)

    expect(ActionDispatch::Request.new(env).format).to eq(Mime[:json])
  end
end
