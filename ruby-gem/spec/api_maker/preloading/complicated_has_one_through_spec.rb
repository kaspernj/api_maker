require "rails_helper"

describe "preloading - complicated has one through" do
  let!(:account) { create :account, customer: }
  let!(:customer) { create :customer }
  let!(:customer_relationship) { create :customer_relationship, child: customer, parent: commune, relationship_type: "commune" }
  let!(:commune) { create :customer }

  it "works correctly in ActiveRecord" do
    customer_relationship

    expect(account.commune).to eq commune
    expect(customer.commune).to eq commune
    expect(commune.commune_for).to eq [customer]
  end

  it "preloads correctly on the model itself" do
    collection = Customer.where(id: [customer.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection:, query_params: {preload: ["commune"]}).to_json)

    expect(result.dig!("preloaded", "customers", account.id.to_s, "r", "commune")).to eq commune.id
  end

  it "preloads correctly on a parent model with through" do
    collection = Account.where(id: [account.id])
    result = JSON.parse(ApiMaker::CollectionSerializer.new(collection:, query_params: {preload: ["commune"]}).to_json)

    expect(result.dig!("preloaded", "accounts", account.id.to_s, "r", "commune")).to eq commune.id
  end
end
