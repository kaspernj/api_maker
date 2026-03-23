require "rails_helper"

describe ApiMaker::ActionCableRequestContext do
  let(:user) { create(:user) }
  let(:warden) { instance_double(Warden::Proxy) }
  let(:connection) do
    instance_double(
      ApplicationCable::Connection,
      cookies: {},
      current_user: nil,
      env: {"warden" => warden}
    )
  end
  let(:channel) do
    connection_instance = connection

    Object.new.tap do |object|
      object.define_singleton_method(:api_maker_locals) { {} }
      object.define_singleton_method(:connection) { connection_instance }
      object.define_singleton_method(:current_session_id) { "session-1" }
      object.define_singleton_method(:update_api_maker_current_user!) do |_current_user|
        nil
      end
    end
  end
  let(:request_context) do
    described_class.new(
      api_maker_args: {current_user: nil},
      channel:,
      request_fingerprint: "fingerprint-1"
    )
  end

  it "signs users in through warden and updates the channel connection user" do
    expect(warden).to receive(:set_user).with(user, scope: :user)
    expect(channel).to receive(:update_api_maker_current_user!).with(user)

    request_context.sign_in(user)
  end

  it "signs users out through warden and clears the channel connection user" do
    expect(warden).to receive(:logout).with(:user)
    expect(channel).to receive(:update_api_maker_current_user!).with(nil)

    request_context.sign_out(user)
  end

  it "builds a request from the connection env when the connection request is unavailable" do
    request = request_context.request

    expect(request).to be_a(ActionDispatch::Request)
    expect(request.env.fetch("warden")).to eq(warden)
  end

  it "runs channel sign in hooks after updating the current user" do
    channel.define_singleton_method(:after_sign_in) do |model:, scope:|
      @hook_args = {model:, scope:}
    end

    expect(warden).to receive(:set_user).with(user, scope: :user)
    expect(channel).to receive(:update_api_maker_current_user!).with(user)

    request_context.sign_in(user)

    expect(channel.instance_variable_get(:@hook_args)).to eq({model: user, scope: :user})
    expect(request_context.api_maker_args[:current_user]).to eq(user)
  end

  it "forwards command events through the channel" do
    channel.define_singleton_method(:transmit_command_event) do |**args|
      @transmitted_command_event = args
    end

    request_context.transmit_command_event(
      command_id: "1",
      payload: {progress: 0.5},
      type: "api_maker_command_progress"
    )

    expect(channel.instance_variable_get(:@transmitted_command_event)).to eq(
      command_id: "1",
      payload: {progress: 0.5},
      request_fingerprint: "fingerprint-1",
      type: "api_maker_command_progress"
    )
  end

  it "returns session status for the current websocket state" do
    expect(warden).to receive(:user).with(:user).and_return(user)
    expect(warden).to receive(:authenticated?).with(:user).and_return(true)

    result = request_context.session_status_result

    expect(result).to include(
      devise: {timeout_in: Devise.timeout_in.to_i},
      scopes: {
        "user" => {
          primary_key: user.id,
          signed_in: true
        }
      }
    )
  end

  it "stores itself as the controller in api_maker_args" do
    expect(request_context.api_maker_args[:controller]).to eq(request_context)
  end

  it "stores the current session id in api_maker_args" do
    expect(request_context.api_maker_args[:current_session_id]).to eq("session-1")
    expect(request_context.current_session_id).to eq("session-1")
  end

  it "loads and persists the shared session shadow store around websocket requests" do
    request = instance_double(ActionDispatch::Request)
    allow(request_context).to receive_messages(request:, session: {}, cookies: {})
    allow(warden).to receive(:user).with(:user).and_return(nil)

    channel.define_singleton_method(:load_session_state) do |**args|
      @load_session_state_args = args
    end
    channel.define_singleton_method(:persist_session_state) do |**args|
      @persist_session_state_args = args
    end

    expect(ApiMaker::SessionShadowStore).to receive(:load!).with(request:)
    expect(ApiMaker::SessionShadowStore).to receive(:persist!).with(request:)

    request_context.with_request_context { nil }

    expect(channel.instance_variable_get(:@load_session_state_args)).to be_nil
    expect(channel.instance_variable_get(:@persist_session_state_args)).to be_nil
  end
end
