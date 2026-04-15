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

  describe "#last_command_event_sequence_for_request_id" do
    it "tracks replayed command event sequences per request id" do
      channel = described_class.allocate
      channel.define_singleton_method(:transmit) { |_payload| nil }

      channel.__send__(
        :transmit_command_event_for_request,
        command_event: {
          command_event_sequence: 3,
          command_id: "1",
          payload: {progress: 0.75},
          type: "api_maker_command_progress"
        },
        request_id: 11
      )

      expect(channel.last_command_event_sequence_for_request_id(11)).to eq(3)
    end
  end

  describe "#with_watchdog" do
    let(:channel) { described_class.allocate }

    it "returns the block result when completion beats the timeout" do
      result = channel.__send__(:with_watchdog, 5) { 42 }

      expect(result).to eq(42)
    end

    it "is a no-op when timeout is nil or non-positive" do
      expect(channel.__send__(:with_watchdog, nil) { :ok }).to eq(:ok)
      expect(channel.__send__(:with_watchdog, 0) { :ok }).to eq(:ok)
    end

    it "raises ApiMaker::CommandTimeoutError when the block exceeds the timeout" do
      expect do
        channel.__send__(:with_watchdog, 0.05) { sleep 2 }
      end.to raise_error(ApiMaker::CommandTimeoutError, /exceeded timeout/)
    end
  end

  describe "#with_statement_timeout" do
    let(:channel) { described_class.allocate }

    it "is a no-op on non-postgres adapters" do
      allow(ApiMaker::DatabaseType).to receive(:postgres?).and_return(false)

      expect do |probe|
        channel.__send__(:with_statement_timeout, 10, &probe)
      end.to yield_with_no_args
    end

    it "is a no-op when timeout is nil or non-positive" do
      expect(channel.__send__(:with_statement_timeout, nil) { :ok }).to eq(:ok)
      expect(channel.__send__(:with_statement_timeout, 0) { :ok }).to eq(:ok)
    end

    it "sets and resets statement_timeout around the block on postgres" do
      allow(ApiMaker::DatabaseType).to receive(:postgres?).and_return(true)

      fake_connection = instance_double(ActiveRecord::ConnectionAdapters::AbstractAdapter)
      allow(ActiveRecord::Base).to receive(:connection).and_return(fake_connection)
      expect(fake_connection).to receive(:execute).with("SET statement_timeout = 10000").ordered
      expect(fake_connection).to receive(:execute).with("RESET statement_timeout").ordered

      channel.__send__(:with_statement_timeout, 10) { :ok }
    end

    it "still resets statement_timeout if the block raises" do
      allow(ApiMaker::DatabaseType).to receive(:postgres?).and_return(true)

      fake_connection = instance_double(ActiveRecord::ConnectionAdapters::AbstractAdapter)
      allow(ActiveRecord::Base).to receive(:connection).and_return(fake_connection)
      expect(fake_connection).to receive(:execute).with("SET statement_timeout = 5000").ordered
      expect(fake_connection).to receive(:execute).with("RESET statement_timeout").ordered

      expect do
        channel.__send__(:with_statement_timeout, 5) { raise "boom" }
      end.to raise_error("boom")
    end
  end

  describe "command timeout configuration" do
    it "defaults ApiMaker::Configuration#command_timeout to 60 seconds" do
      expect(ApiMaker::Configuration.new.command_timeout).to eq(60)
    end
  end
end
