require "rails_helper"

describe ApiMaker::RequestsRegistry do
  include ActiveSupport::Testing::TimeHelpers

  before do
    described_class.clear!
  end

  it "only starts execution once for the same request UID" do
    channel_one = instance_double(ApiMaker::RequestsChannel)
    channel_two = instance_double(ApiMaker::RequestsChannel)

    first_registration = described_class.register_request(
      channel: channel_one,
      request_fingerprint: "fingerprint-1",
      request_id: 1,
      request_uid: "request-1"
    )
    second_registration = described_class.register_request(
      channel: channel_two,
      request_fingerprint: "fingerprint-1",
      request_id: 2,
      request_uid: "request-1"
    )

    expect(first_registration).to eq(
      response_payload: nil,
      start_execution: true
    )
    expect(second_registration).to eq(
      response_payload: nil,
      start_execution: false
    )
    expect(described_class.request_subscriptions(request_uid: "request-1")).to eq(
      [
        {
          channel: channel_one,
          request_ids: [1]
        },
        {
          channel: channel_two,
          request_ids: [2]
        }
      ]
    )
  end

  it "returns cached response payloads for completed requests" do
    channel = instance_double(ApiMaker::RequestsChannel)
    response_payload = {
      response: {success: true},
      type: "api_maker_request_response"
    }

    described_class.register_request(
      channel:,
      request_fingerprint: "fingerprint-1",
      request_id: 1,
      request_uid: "request-1"
    )
    described_class.complete_request(
      request_uid: "request-1",
      response_payload:,
      status: :completed
    )

    repeated_registration = described_class.register_request(
      channel:,
      request_fingerprint: "fingerprint-1",
      request_id: 2,
      request_uid: "request-1"
    )

    expect(repeated_registration).to eq(
      response_payload:,
      start_execution: false
    )
  end

  it "rejects reused request UIDs with a different fingerprint" do
    channel = instance_double(ApiMaker::RequestsChannel)

    described_class.register_request(
      channel:,
      request_fingerprint: "fingerprint-1",
      request_id: 1,
      request_uid: "request-1"
    )

    expect do
      described_class.register_request(
        channel:,
        request_fingerprint: "fingerprint-2",
        request_id: 2,
        request_uid: "request-1"
      )
    end.to raise_error("Request fingerprint mismatch for request UID: request-1")
  end

  it "refreshes active requests when subscriptions are read" do
    channel = instance_double(ApiMaker::RequestsChannel)

    travel_to(Time.zone.parse("2026-03-23 11:00:00 UTC")) do
      described_class.register_request(
        channel:,
        request_fingerprint: "fingerprint-1",
        request_id: 1,
        request_uid: "request-1"
      )
    end

    travel_to(Time.zone.parse("2026-03-23 11:04:00 UTC")) do
      expect(described_class.request_subscriptions(request_uid: "request-1")).to eq(
        [
          {
            channel:,
            request_ids: [1]
          }
        ]
      )
    end

    travel_to(Time.zone.parse("2026-03-23 11:08:00 UTC")) do
      expect(described_class.request_subscriptions(request_uid: "request-1")).to eq(
        [
          {
            channel:,
            request_ids: [1]
          }
        ]
      )
    end
  end
end
