require "rails_helper"

describe ApiMaker::ModelsFinderService do
  describe "#execute!" do
    it "finds all the registered models" do
      resources = ApiMaker::ModelsFinderService.execute!
      models = resources.map(&:model_class)

      expect(models).to include Project
      expect(models).to include Task
    end
  end

  describe "#files" do
    it "excludes non resource files" do
      service = ApiMaker::ModelsFinderService.new

      expect(Rails.root.glob("app/api_maker/resources/**/*.rb").map(&:to_s)).to include end_with "bogus.rb"
      expect(service.__send__(:files)).not_to include end_with "bogus.rb"
    end
  end
end
