require "rails_helper"

describe ApiMaker::ModelsFinderService do
  describe "#execute!" do
    it "finds all the registered models" do
      models = ApiMaker::ModelsFinderService.execute!

      expect(models).to include Project
      expect(models).to include Task
    end
  end
end
