require "rails_helper"

describe ApiMaker::ModelContentGeneratorService do
  let(:content_project) { service_project.execute! }
  let(:content_task) { service_task.execute! }
  let(:service_project) { ApiMaker::ModelContentGeneratorService.new(resource: Resources::ProjectResource) }
  let(:service_task) { ApiMaker::ModelContentGeneratorService.new(resource: Resources::TaskResource) }

  describe "#model_content" do
    it "includes attributes defined in the serializer" do
      expect(content_task.fetch(:attributes).keys).to include :created_at
    end

    it "doesnt include attributes not defined in the serializer" do
      expect(content_task.fetch(:attributes).keys).not_to include :updated_at
    end

    it "includes relationships defined in the serializer" do
      expect(content_project.fetch(:relationships).keys).to include :tasks
    end

    it "doesnt include relationships not defined in the serializer" do
      expect(content_project.fetch(:relationships).keys).not_to include :project_secrets
    end
  end
end
