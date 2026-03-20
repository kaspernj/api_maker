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
    end
  end
  let(:request_context) do
    described_class.new(
      api_maker_args: {current_user: nil},
      channel:
    )
  end

  it "signs users in through warden and updates the channel connection user" do
    expect(warden).to receive(:set_user).with(user, scope: :user)
    expect(connection).to receive(:current_user=).with(user)

    request_context.sign_in(user)
  end

  it "signs users out through warden and clears the channel connection user" do
    expect(warden).to receive(:logout).with(:user)
    expect(connection).to receive(:current_user=).with(nil)

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
    expect(connection).to receive(:current_user=).with(user)

    request_context.sign_in(user)

    expect(channel.instance_variable_get(:@hook_args)).to eq({model: user, scope: :user})
  end
end
