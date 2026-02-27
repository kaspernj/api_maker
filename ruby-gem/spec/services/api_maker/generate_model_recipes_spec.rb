require "rails_helper"
require "tmpdir"

describe ApiMaker::GenerateModelRecipes do
  describe "#perform" do
    it "generates frontend models to a custom path and keeps legacy recipe outputs" do
      Dir.mktmpdir do |tmp_dir|
        ApiMaker::GenerateModelRecipes.execute!(path: tmp_dir)

        expect(File).to exist(File.join(tmp_dir, "task.js"))
        expect(File).to exist(File.join(tmp_dir, "../models.js"))
        expect(File).to exist(Rails.root.join("app/javascript/model-recipes.json"))
        expect(File).to exist(Rails.root.join("app/javascript/translated-collections-data.json"))
      end
    end
  end
end
