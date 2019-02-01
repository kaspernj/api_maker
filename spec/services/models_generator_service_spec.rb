require "rails_helper"

describe ApiMaker::ModelsGeneratorService do
  describe "#execute!" do
    it "creates various dirs" do
      path_to_create = Rails.root.join("app", "javascript", "api-maker")
      FileUtils.rm_rf(path_to_create) if path_to_create.exist?

      expect(File.exist?(path_to_create)).to eq false

      ApiMaker::ModelsGeneratorService.execute!

      expect(File.exist?(path_to_create)).to eq true
    end
  end
end
