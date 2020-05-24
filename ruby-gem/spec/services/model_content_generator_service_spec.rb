require "rails_helper"

describe ApiMaker::ModelContentGeneratorService do
  let(:content_project) { service_project.__send__(:model_content) }
  let(:content_task) { service_task.__send__(:model_content) }
  let(:service_project) { ApiMaker::ModelContentGeneratorService.new(model: Project) }
  let(:service_task) { ApiMaker::ModelContentGeneratorService.new(model: Task) }

  describe "#model_content" do
    it "generates the right class for the model" do
      expect(content_task).to include "export default class Task extends BaseModel"
    end

    it "includes attributes defined in the serializer" do
      expect(content_task).to include "createdAt() {"
    end

    it "doesnt include attributes not defined in the serializer" do
      expect(content_task).not_to include "updatedAt() {"
    end

    it "includes relationships defined in the serializer" do
      expect(content_project).to include "tasks() {"
    end

    it "doesnt include relationships not defined in the serializer" do
      expect(content_project).not_to include "projectSecrets() {"
    end
  end
end
