require "rails_helper"

describe ApiMaker::CommandResponse do
  describe "#with_thread" do
    it "applies ApiMaker::CommandTimeoutGuard on the sync (test-env) path" do
      response = described_class.new(controller: nil)

      expect(ApiMaker::CommandTimeoutGuard).to receive(:wrap).and_yield

      ran = false
      response.with_thread { ran = true }
      expect(ran).to be(true)
    end

    it "propagates ApiMaker::CommandTimeoutError from spawned threads through join_threads" do
      response = described_class.new(controller: nil)
      allow(response).to receive(:threadding?).and_return(true)
      allow(Rails.env).to receive(:test?).and_return(false)

      response.with_thread { raise ApiMaker::CommandTimeoutError, "boom" }

      expect { response.join_threads }.to raise_error(ApiMaker::CommandTimeoutError, "boom")
    end
  end
end
