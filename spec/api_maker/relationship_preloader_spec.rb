require "rails_helper"

describe ApiMaker::RelationshipPreloader do
  it "parses strings" do
    result = ApiMaker::RelationshipPreloader.parse(["listing.address", "listing.commodity", "listing.user"])
    expect(result).to eq("listing" => %w[address commodity user])
  end
end
