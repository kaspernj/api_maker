require "rails_helper"

describe "spec helper" do
  describe "#reset_indexeddb" do
    it "resets the indexed db without failing" do
      visit root_path
      reset_indexeddb
    end
  end
end
