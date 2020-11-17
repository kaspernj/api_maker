require "rails_helper"

describe ApiMaker::DatabaseType do
  before do
    # Reset adapter name cache
    ApiMaker::DatabaseType.instance_variable_set(:@adapter_name, nil)
  end

  describe "#postgres?" do
    it "returns true when postgres" do
      expect(ApplicationRecord.connection).to receive(:adapter_name).and_return("PostgreSQL")
      expect(ApiMaker::DatabaseType.postgres?).to eq true
    end

    it "returns false when sqlite" do
      expect(ApiMaker::DatabaseType.postgres?).to eq false
    end
  end

  describe "#adapter_name" do
    it "returns the name for postgres" do
      expect(ApplicationRecord.connection).to receive(:adapter_name).and_return("PostgreSQL")
      expect(ApiMaker::DatabaseType.adapter_name).to eq :postgresql
    end

    it "returns the name for sqlite" do
      expect(ApiMaker::DatabaseType.adapter_name).to eq :sqlite
    end
  end
end
