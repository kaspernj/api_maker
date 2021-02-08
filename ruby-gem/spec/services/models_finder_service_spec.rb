require "rails_helper"

describe ApiMaker::ModelsFinderService do
  describe "#execute!" do
    it "finds all the registered models" do
      models = ApiMaker::ModelsFinderService.execute!

      expect(models).to include Project
      expect(models).to include Task
    end
  end

  describe "#files" do
    it "excludes non resource files" do
      service = ApiMaker::ModelsFinderService.new

      expect(Dir.glob(Rails.root.join("app/api_maker/resources/**/*.rb"))).to include end_with "bogus.rb"
      expect(service.__send__(:files)).not_to include end_with "bogus.rb"
    end
  end
end
