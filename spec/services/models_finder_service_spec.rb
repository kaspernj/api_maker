require "rails_helper"

describe ApiMaker::ModelsFinderService do
  let(:service) { ApiMaker::ModelsFinderService.new }

  describe "#execute!" do
    it "finds all the registered models" do
      models = service.execute!.result

      expect(models).to include Project
      expect(models).to include Task
    end
  end
end
