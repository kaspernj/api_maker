require "rails_helper"

describe ApiMaker::Channel do
  describe "#update_api_maker_current_user!" do
    it "resets the memoized ability and updates the connection current user" do
      connection = instance_double(ApplicationCable::Connection)
      channel = described_class.allocate

      channel.define_singleton_method(:connection) { connection }
      channel.define_singleton_method(:params) { {} }
      channel.instance_variable_set(:@current_ability, :cached_ability)

      expect(connection).to receive(:respond_to?).with(:current_user=).and_return(true)
      expect(connection).to receive(:current_user=).with("user-1")

      channel.update_api_maker_current_user!("user-1")

      expect(channel.instance_variable_get(:@current_ability)).to be_nil
      expect(channel.instance_variable_get(:@current_user)).to eq("user-1")
    end
  end

  describe "#sync_api_maker_current_user!" do
    let(:warden) { instance_double(Warden::Proxy) }
    let(:connection) do
      instance_double(ApplicationCable::Connection, env: {"warden" => warden})
    end
    let(:channel) do
      channel_connection = connection
      channel = described_class.allocate
      channel.define_singleton_method(:connection) { channel_connection }
      channel
    end

    before do
      # respond_to? gets called by RSpec internals as well as the implementation
      # under test, so keep this as a stub rather than an expectation.
      allow(connection).to receive(:respond_to?) do |method_name|
        [:current_user, :current_user=].include?(method_name)
      end
    end

    it "prefers connection.current_user when present" do
      expect(connection).to receive(:current_user).twice.and_return("connection-user")
      expect(connection).to receive(:current_user=).with("connection-user")

      expect(channel.sync_api_maker_current_user!).to eq("connection-user")
      expect(channel.instance_variable_get(:@current_user)).to eq("connection-user")
    end

    it "falls back to the in-memory warden proxy user when connection.current_user is nil" do
      expect(connection).to receive(:current_user).and_return(nil)
      expect(warden).to receive(:user).with(:user).and_return("warden-user")
      expect(connection).to receive(:current_user=).with("warden-user")

      expect(channel.sync_api_maker_current_user!).to eq("warden-user")
      expect(channel.instance_variable_get(:@current_user)).to eq("warden-user")
    end

    # Regression: `warden.set_user` on an ActionCable command updates
    # `warden.user(:user)` but cannot write to the cable-upgrade rack
    # session. Reading from the session store (via
    # `warden.session_serializer.fetch(:user)`) would clobber a valid
    # just-signed-in user with nil. This spec keeps the preferred source
    # pinned to warden's in-memory proxy.
    it "does not consult warden.session_serializer" do
      expect(connection).to receive(:current_user).and_return(nil)
      expect(warden).to receive(:user).with(:user).and_return("warden-user")
      expect(connection).to receive(:current_user=).with("warden-user")
      expect(warden).not_to receive(:session_serializer)

      channel.sync_api_maker_current_user!
    end

    it "clears @current_user when neither source reports a user" do
      channel.instance_variable_set(:@current_user, "stale-user")
      expect(connection).to receive(:current_user).and_return(nil)
      expect(warden).to receive(:user).with(:user).and_return(nil)
      expect(connection).to receive(:current_user=).with(nil)

      expect(channel.sync_api_maker_current_user!).to be_nil
      expect(channel.instance_variable_get(:@current_user)).to be_nil
    end
  end

  describe "#current_ability" do
    it "includes the current session id in api_maker args" do
      connection = instance_double(ApplicationCable::Connection, env: {}, current_user: nil)
      channel = described_class.allocate
      captured_api_maker_args = nil

      channel.define_singleton_method(:connection) { connection }
      channel.define_singleton_method(:params) { {global: {layout: "user"}} }
      channel.define_singleton_method(:current_session_id) { "session-1" }

      ability_class = Class.new do
        define_method(:initialize) do |api_maker_args:, locals:|
          captured_api_maker_args = api_maker_args
          @locals = locals
        end
      end
      stub_const("SpecChannelAbility", ability_class)

      expect(ApiMaker::Configuration.current).to receive(:ability_class).and_return(SpecChannelAbility)
      allow(connection).to receive(:respond_to?) do |method_name|
        [:current_user, :current_user=].include?(method_name)
      end
      allow(connection).to receive(:current_user=).with(nil)

      channel.current_ability

      expect(captured_api_maker_args).to include(
        current_session_id: "session-1",
        current_user: nil,
        layout: "user"
      )
    end
  end
end
