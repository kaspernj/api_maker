require "rails_helper"

describe ApiMaker::DeepMergeParams do
  it "merges hashes in arrays" do
    hash1 = {
      products: [
        {id: 1},
        {id: 2}
      ]
    }

    hash2 = {
      products: [
        {name: "Product 1"},
        {name: "Product 2"}
      ]
    }

    expect(ApiMaker::DeepMergeParams.execute!(hash1, hash2)).to eq(
      {
        products: [
          {id: 1, name: "Product 1"},
          {id: 2, name: "Product 2"}
        ]
      }
    )
  end

  it "returns the last array if they differ in length" do
    hash1 = {
      products: [
        {id: 2}
      ]
    }

    hash2 = {
      products: [
        {name: "Product 1"},
        {name: "Product 2"}
      ]
    }

    expect(ApiMaker::DeepMergeParams.execute!(hash1, hash2)).to eq(
      {
        products: [
          {name: "Product 1"},
          {name: "Product 2"}
        ]
      }
    )
  end
end
