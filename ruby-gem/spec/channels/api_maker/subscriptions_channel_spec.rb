require "rails_helper"

describe ApiMaker::SubscriptionsChannel do
  describe "#refresh_auth" do
    it "refreshes auth and re-subscribes the existing server-side streams" do
      channel = described_class.allocate
      request_context = instance_double(ApiMaker::ActionCableRequestContext)

      channel.define_singleton_method(:params) do
        {global: {layout: "user"}, subscription_data: {"User" => {"updates" => ["1"]}}}
      end

      expect(channel).to receive(:subscription_request_context).with({"signedIn" => false}).and_return(request_context)
      expect(request_context).to receive(:with_request_context).and_yield
      expect(Services::Devise::PersistSession).to receive(:execute!).with(
        args: {signedIn: false},
        controller: request_context
      )
      expect(channel).to receive(:stop_all_streams)
      expect(channel).to receive(:resubscribe_to_events!)
      expect(channel).to receive(:transmit).with(type: "api_maker_subscription_auth_refreshed")

      channel.refresh_auth("signedIn" => false)
    end
  end
end
