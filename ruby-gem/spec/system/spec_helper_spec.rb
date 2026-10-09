require "rails_helper"

describe "spec helper" do
  describe "#reset_indexeddb" do
    it "resets the indexed db without failing" do
      visit root_path
      reset_indexeddb
    end
  end

  describe "#wait_for_field" do
    before do
      visit devise_specs_sign_in_path
    end

    it "returns the field once its value has settled" do
      field = wait_for_field("email", with: "")

      expect(field).to be_a(Capybara::Node::Element)
      expect(field[:id]).to eq "email"
      expect(field.value).to eq ""
    end

    it "passes forwarded options to the field lookup" do
      field = wait_for_field("email", with: "", visible: :all)

      expect(field).to be_a(Capybara::Node::Element)
      expect(field[:id]).to eq "email"
    end

    it "raises SelectorNotFoundError when the value never settles" do
      expect do
        wait_for_field("email", with: "a value the field never has")
      end.to raise_error(ApiMaker::SpecHelper::SelectorNotFoundError)
    end
  end
end
