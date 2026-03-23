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
