require "rails_helper"

describe ApiMaker::BaseResource do
  describe "#default_select" do
    it "returns a list of attributes to select by default" do
      attribute_keys = Resources::AccountResource.default_select.keys
      expect(attribute_keys).to eq [:id, :name]
    end
  end
end
