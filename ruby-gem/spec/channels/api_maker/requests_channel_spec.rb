require "rails_helper"

describe ApiMaker::RequestsChannel do
  describe "#legacy_request_uid" do
    it "isolates legacy request UIDs by current session" do
      channel_one = described_class.allocate
      channel_two = described_class.allocate
      payload = {
        "request" => {"pool" => {"service" => {}}},
        "request_id" => 1
      }

      channel_one.define_singleton_method(:current_session_id) { "session-1" }
      channel_one.define_singleton_method(:current_user) { nil }
      channel_two.define_singleton_method(:current_session_id) { "session-2" }
      channel_two.define_singleton_method(:current_user) { nil }

      request_uid_one = channel_one.__send__(
        :legacy_request_uid,
        data: payload,
        request_fingerprint: "fingerprint-1"
      )
      request_uid_two = channel_two.__send__(
        :legacy_request_uid,
        data: payload,
        request_fingerprint: "fingerprint-1"
      )

      expect(request_uid_one).not_to eq(request_uid_two)
    end
  end

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
      channel.define_singleton_method(:current_session_id) { "session-1" }

      request_context = channel.__send__(
        :request_context,
        {
          "global" => {
            "layout" => "user",
            "locale" => "da",
            "time_zone_offset" => -18_000
          }
        },
        request_fingerprint: "fingerprint-1",
        request_uid: "request-1"
      )

      expect(request_context.api_maker_args).to include(
        current_session_id: "session-1",
        layout: "user",
        locale: "da",
        time_zone_offset: -18_000
      )
      expect(request_context.request_fingerprint).to eq("fingerprint-1")
      expect(request_context.request_uid).to eq("request-1")
    end

    it "provides default api maker locals" do
      channel = described_class.allocate

      expect(channel.api_maker_locals).to eq({})
    end
  end
end
