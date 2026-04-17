require "rails_helper"

describe "ActionCableCleanup" do
  describe "#reset_api_maker_realtime_runtime!" do
    it "returns :missing when the JS hook is not registered" do
      visit root_path

      status = reset_api_maker_realtime_runtime!

      expect(status).to eq(:missing)
    end
  end

  describe "#wait_for_action_cable_connections_to_close!" do
    it "returns immediately when there are no connections" do
      expect(ActionCable.server.connections).to be_empty

      start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      wait_for_action_cable_connections_to_close!(timeout: 1)
      elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - start_time

      expect(elapsed).to be < 0.5
    end

    it "waits until connections drain" do
      fake_connection = instance_double(ActionCable::Connection::Base)
      connections = ActionCable.server.connections

      connections << fake_connection

      Thread.new do
        sleep 0.2
        connections.delete(fake_connection)
      end

      start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      wait_for_action_cable_connections_to_close!(timeout: 5)
      elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - start_time

      expect(elapsed).to be >= 0.15
      expect(connections).to be_empty
    end

    it "respects the timeout when connections do not drain" do
      fake_connection = instance_double(ActionCable::Connection::Base)
      connections = ActionCable.server.connections

      connections << fake_connection

      start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      wait_for_action_cable_connections_to_close!(timeout: 0.3)
      elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - start_time

      expect(elapsed).to be >= 0.25
      expect(elapsed).to be < 1.0
    ensure
      connections.delete(fake_connection)
    end
  end
end
