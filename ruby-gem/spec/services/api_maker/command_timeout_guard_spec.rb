require "rails_helper"

describe ApiMaker::CommandTimeoutGuard do
  let(:connection) { instance_double(ActiveRecord::ConnectionAdapters::AbstractAdapter) }

  before do
    allow(ActiveRecord::Base).to receive(:connection).and_return(connection)
    allow(ApiMaker::ConnectionDatabaseKind).to receive(:for).with(connection).and_return(:other)
    Thread.current[described_class::THREAD_LOCAL_KEY] = nil
  end

  describe ".wrap" do
    it "returns the block result when completion beats the timeout" do
      allow(ApiMaker::Configuration.current).to receive(:command_timeout).and_return(5)

      expect(described_class.wrap { 42 }).to eq(42)
    end

    it "is a no-op when timeout is nil or non-positive" do
      allow(ApiMaker::Configuration.current).to receive(:command_timeout).and_return(nil)
      expect(described_class.wrap { :ok }).to eq(:ok)

      allow(ApiMaker::Configuration.current).to receive(:command_timeout).and_return(0)
      expect(described_class.wrap { :ok }).to eq(:ok)
    end

    it "raises ApiMaker::CommandTimeoutError when the block exceeds the timeout" do
      allow(ApiMaker::Configuration.current).to receive(:command_timeout).and_return(0.05)

      expect do
        described_class.wrap { sleep 2 }
      end.to raise_error(ApiMaker::CommandTimeoutError, /exceeded timeout/)
    end

    it "skips nested wraps on the same thread so the outer budget is honored" do
      allow(ApiMaker::Configuration.current).to receive(:command_timeout).and_return(5)
      outer_yielded = false

      described_class.wrap do
        outer_yielded = true
        expect(Thread.current[described_class::THREAD_LOCAL_KEY]).to be(true)

        inner_result = described_class.wrap { :inner }
        expect(inner_result).to eq(:inner)
      end

      expect(outer_yielded).to be(true)
      expect(Thread.current[described_class::THREAD_LOCAL_KEY]).to be(false)
    end

    it "sets and resets postgres statement_timeout on the current connection" do
      allow(ApiMaker::Configuration.current).to receive(:command_timeout).and_return(10)
      allow(ApiMaker::ConnectionDatabaseKind).to receive(:for).with(connection).and_return(:postgres)
      allow(connection).to receive(:raw_connection).and_return(nil)
      expect(connection).to receive(:execute).with("SET statement_timeout = 10000").ordered
      expect(connection).to receive(:execute).with("RESET statement_timeout").ordered

      described_class.wrap { :ok }
    end

    it "sets and resets mysql max_execution_time" do
      allow(ApiMaker::Configuration.current).to receive(:command_timeout).and_return(7.5)
      allow(ApiMaker::ConnectionDatabaseKind).to receive(:for).with(connection).and_return(:mysql)
      expect(connection).to receive(:execute).with("SET SESSION max_execution_time = 7500").ordered
      expect(connection).to receive(:execute).with("SET SESSION max_execution_time = 0").ordered

      described_class.wrap { :ok }
    end

    it "sets and resets mariadb max_statement_time" do
      allow(ApiMaker::Configuration.current).to receive(:command_timeout).and_return(7.5)
      allow(ApiMaker::ConnectionDatabaseKind).to receive(:for).with(connection).and_return(:mariadb)
      expect(connection).to receive(:execute).with("SET SESSION max_statement_time = 7.5").ordered
      expect(connection).to receive(:execute).with("SET SESSION max_statement_time = 0").ordered

      described_class.wrap { :ok }
    end

    it "still resets the statement timeout if the block raises" do
      allow(ApiMaker::Configuration.current).to receive(:command_timeout).and_return(5)
      allow(ApiMaker::ConnectionDatabaseKind).to receive(:for).with(connection).and_return(:postgres)
      allow(connection).to receive(:raw_connection).and_return(nil)
      expect(connection).to receive(:execute).with("SET statement_timeout = 5000").ordered
      expect(connection).to receive(:execute).with("RESET statement_timeout").ordered

      expect do
        described_class.wrap { raise "boom" }
      end.to raise_error("boom")
    end
  end
end
