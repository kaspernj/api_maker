require "rails_helper"

describe ApiMaker::ModelContentGeneratorService do
  let(:content) { service.__send__(:model_content) }
  let(:service) { ApiMaker::ModelContentGeneratorService.new(model: Task) }

  describe "#model_content" do
    it "generates the right class for the model" do
      expect(content).to include "export default class extends BaseModel"
    end

    it "includes attributes included in the serializer" do
      expect(content).to include "createdAt() {"
    end

    it "doesnt include attributes not included in the serializer" do
      expect(content).to_not include "updatedAt() {"
    end
  end
end
