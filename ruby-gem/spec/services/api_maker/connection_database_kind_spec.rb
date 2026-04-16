require "rails_helper"

describe ApiMaker::ConnectionDatabaseKind do
  before { described_class.reset_cache! }

  def connection_double(adapter_name, pool: nil, mariadb: nil, version: nil)
    connection = double("connection", adapter_name:, pool:) # rubocop:disable RSpec/VerifiedDoubles
    allow(connection).to receive(:respond_to?).with(:mariadb?).and_return(!mariadb.nil?)
    allow(connection).to receive(:mariadb?).and_return(mariadb) unless mariadb.nil?
    allow(connection).to receive(:select_value).with("SELECT VERSION()").and_return(version) if version
    connection
  end

  describe ".for" do
    it "returns :postgres for PostgreSQL adapters" do
      connection = connection_double("PostgreSQL")

      expect(described_class.for(connection)).to eq(:postgres)
    end

    it "returns :mysql when the mysql2 adapter reports not MariaDB" do
      connection = connection_double("Mysql2", mariadb: false)

      expect(described_class.for(connection)).to eq(:mysql)
    end

    it "returns :mariadb when the adapter exposes mariadb? true" do
      connection = connection_double("Mysql2", mariadb: true)

      expect(described_class.for(connection)).to eq(:mariadb)
    end

    it "falls back to SELECT VERSION() when mariadb? is unavailable" do
      connection = connection_double("Mysql2", version: "10.11.5-MariaDB-log")

      expect(described_class.for(connection)).to eq(:mariadb)
    end

    it "returns :mysql when SELECT VERSION() has no MariaDB marker" do
      connection = connection_double("Mysql2", version: "8.0.36")

      expect(described_class.for(connection)).to eq(:mysql)
    end

    it "returns :other for unknown adapters (e.g. SQLite)" do
      connection = connection_double("SQLite")

      expect(described_class.for(connection)).to eq(:other)
    end

    it "caches the result per connection pool" do
      pool = Object.new
      first = connection_double("PostgreSQL", pool:)
      second = connection_double("Mysql2", pool:, mariadb: false)

      expect(described_class.for(first)).to eq(:postgres)
      expect(described_class.for(second)).to eq(:postgres) # cache hit by pool id
    end
  end
end
