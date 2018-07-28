require "rails_helper"

describe ApiMaker::ModelContentGeneratorService do
  let(:service) { ApiMaker::ModelContentGeneratorService.new(model: Task) }

  describe "#model_content" do
    it "generates the right content for the model" do
      content = service.__send__(:model_content)
      expect(content).to include "export default class extends BaseModel"
    end
  end
end
