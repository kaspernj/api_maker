require "rails_helper"

describe ApiMaker::RequestsChannel do
  describe "#request_fingerprint" do
    it "includes global data in the fingerprint" do
      channel = described_class.allocate

      fingerprint_one = channel.__send__(
        :request_fingerprint,
        {
          "global" => {"layout" => "user"},
          "request" => {"pool" => {"service" => {}}}
        }
      )
      fingerprint_two = channel.__send__(
        :request_fingerprint,
        {
          "global" => {"layout" => "admin"},
          "request" => {"pool" => {"service" => {}}}
        }
      )

      expect(fingerprint_one).not_to eq(fingerprint_two)
    end
  end

  describe "#request_context" do
    it "passes locale and time zone offset from global request data" do
      channel = described_class.allocate
      channel.define_singleton_method(:current_user) { nil }

      request_context = channel.__send__(
        :request_context,
        {
          "global" => {
            "layout" => "user",
            "locale" => "da",
            "time_zone_offset" => -18_000
          }
        },
        request_fingerprint: "fingerprint-1"
      )

      expect(request_context.api_maker_args).to include(
        layout: "user",
        locale: "da",
        time_zone_offset: -18_000
      )
      expect(request_context.request_fingerprint).to eq("fingerprint-1")
    end

    it "provides default api maker locals" do
      channel = described_class.allocate

      expect(channel.api_maker_locals).to eq({})
    end
  end
end
