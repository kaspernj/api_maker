require "rails_helper"

describe ApiMaker::SpecHelper do
  describe "#reset_indexeddb" do
    it "resets the indexed db without failing" do
      visit root_path
      reset_indexeddb
    end
  end
end
