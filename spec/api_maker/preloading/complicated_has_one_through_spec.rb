require "rails_helper"

describe "preloading - complicated has one through" do
  let!(:account) { create :account, customer: customer }
  let!(:customer) { create :customer }
  let!(:customer_relationship) { create :customer_relationship, child: customer, parent: commune, relationship_type: "commune" }
  let!(:commune) { create :customer }

  it "works correctly in ActiveRecord" do
    customer_relationship

    expect(account.commune).to eq commune
    expect(customer.commune).to eq commune
    expect(commune.commune_for).to eq [customer]
  end

  it "preloads correctly" do
    collection = Account.where(id: [account.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection: collection, include_param: ["commune"]).to_json)

    expect(result.dig!("included", "accounts", account.id.to_s, "r", "commune")).to eq commune.id
  end
end
