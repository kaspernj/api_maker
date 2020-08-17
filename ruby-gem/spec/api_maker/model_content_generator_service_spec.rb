require "rails_helper"

describe ApiMaker::ModelContentGeneratorService do
  describe "#reflection_has_many_parameters_query" do
    it "returns a query on the type for polymorphic reflections" do
      reflection = Task.reflections.fetch("comments")
      service = ApiMaker::ModelContentGeneratorService.new(export_default: true, import_classes: true, model: Task)
      parameters = service.__send__(:reflection_has_many_parameters_query, reflection)

      expect(parameters).to eq(
        ransack: {
          "resource_id_eq" => "{{id}}",
          "resource_type_eq" => "Task"
        }
      )
    end
  end
end
