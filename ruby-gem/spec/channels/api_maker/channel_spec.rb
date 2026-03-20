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
end
