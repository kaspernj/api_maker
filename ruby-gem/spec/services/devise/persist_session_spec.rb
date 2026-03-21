require "rails_helper"

describe Services::Devise::PersistSession do
  let(:controller) { instance_double(ApiMaker::BaseController) }
  let(:request) { instance_double(ActionDispatch::Request, env: {}, session: {}) }
  let(:session_status_result) { {scopes: {"user" => {signed_in: true}}} }
  let(:session_status) { instance_double(ApiMaker::SessionStatusResult, result: session_status_result) }
  let(:user) { create(:user) }

  it "re-signs in the current user and remembers the user when requested" do
    expect(controller).to receive(:request).and_return(request).at_least(:once)
    expect_any_instance_of(described_class).to receive(:remember_me).with(user)
    expect(controller).to receive(:current_user).at_least(:once).and_return(user)
    expect(controller).to receive(:sign_in).with(user, scope: :user)
    expect(ApiMaker::SessionStatusResult).to receive(:new).with(controller:).and_return(session_status)

    response = described_class.execute!(args: {rememberMe: true}, controller:)

    expect(response).to include(session_status: session_status_result, success: true)
  end

  it "signs out the scope when there is no current model" do
    expect(controller).to receive(:request).and_return(request).at_least(:once)
    expect(controller).to receive(:current_user).and_return(nil)
    expect(controller).to receive(:sign_out).with(:user)
    expect(ApiMaker::SessionStatusResult).to receive(:new).with(controller:).and_return(session_status)

    response = described_class.execute!(args: {}, controller:)

    expect(response).to include(session_status: session_status_result, success: true)
  end

  it "signs out the scope when explicitly asked to materialize a signed-out session" do
    expect(controller).to receive(:sign_out).with(:user)
    expect(ApiMaker::SessionStatusResult).to receive(:new).with(controller:).and_return(session_status)

    response = described_class.execute!(args: {signedIn: false}, controller:)

    expect(response).to include(session_status: session_status_result, success: true)
  end

  it "falls back to the stored warden session key when current_user is not hydrated yet" do
    request_session = {"warden.user.user.key" => [[user.id], user.authenticatable_salt]}
    request_with_session = instance_double(ActionDispatch::Request, env: {}, session: request_session)

    expect(controller).to receive(:request).and_return(request_with_session).at_least(:once)
    expect(controller).to receive(:current_user).and_return(nil)
    expect(controller).to receive(:sign_in).with(user, scope: :user)
    expect(ApiMaker::SessionStatusResult).to receive(:new).with(controller:).and_return(session_status)

    response = described_class.execute!(args: {}, controller:)

    expect(response).to include(session_status: session_status_result, success: true)
  end

  it "requires the signed shadow session token to match the current session id" do
    request_session = {"session_id" => "current-session"}
    request_with_session = instance_double(ActionDispatch::Request, env: {}, session: request_session)

    expect(controller).to receive(:request).and_return(request_with_session).at_least(:once)
    expect(controller).to receive(:current_user).and_return(nil)
    expect(ApiMaker::SessionShadowStore).to receive(:read_signed).with(request: request_with_session, token: "signed-token").and_return(nil)
    expect(controller).to receive(:sign_out).with(:user)
    expect(ApiMaker::SessionStatusResult).to receive(:new).with(controller:).and_return(session_status)

    response = described_class.execute!(args: {shadowSessionToken: "signed-token"}, controller:)

    expect(response).to include(session_status: session_status_result, success: true)
  end
end
