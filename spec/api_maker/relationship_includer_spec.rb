require "rails_helper"

describe ApiMaker::RelationshipIncluder do
  it "parses strings" do
    result = ApiMaker::RelationshipIncluder.parse(["listing.address", "listing.commodity", "listing.user"])
    expect(result).to eq("listing" => ["address", "commodity", "user"])
  end
end
