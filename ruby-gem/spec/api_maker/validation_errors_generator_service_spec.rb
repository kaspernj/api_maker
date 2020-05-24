require "rails_helper"

describe ApiMaker::ValidationErrorsGeneratorService do
  let(:project) { create :project }

  it "handles monetized attributes" do
    project.price_per_hour = "asd"

    expect(project.valid?).to eq false

    result = ApiMaker::ValidationErrorsGeneratorService.execute!(
      model: project,
      params: {
        price_per_hour: "asd"
      }
    )

    expect(result).to eq [
      {
        attribute_name: :price_per_hour,
        id: project.id,
        input_name: "project[price_per_hour]",
        model_name: "project",
        error_message: "is not a number",
        error_type: :not_a_number
      }
    ]
  end
end
