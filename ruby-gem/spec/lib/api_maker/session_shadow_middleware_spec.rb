require "rails_helper"

describe ApiMaker::SessionShadowMiddleware do
  let(:app) { proc { |_env| [200, {}, ["ok"]] } }
  let(:middleware) { described_class.new(app) }
  let(:session) do
    {
      "session_id" => "session-id-1",
      "locale" => "en"
    }
  end
  let(:request) { instance_double(ActionDispatch::Request, session:) }

  it "loads and persists the request session around the app call" do
    expect(ActionDispatch::Request).to receive(:new).with({}).and_return(request)
    expect(ApiMaker::SessionShadowStore).to receive(:load!).with(request:)
    expect(ApiMaker::SessionShadowStore).to receive(:persist!).with(request:)

    expect(middleware.call({})).to eq([200, {}, ["ok"]])
  end
end
