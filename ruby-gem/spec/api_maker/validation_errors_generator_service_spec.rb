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

  it "handles deeply nested errors through has one relationships" do
    params = {
      name: "Test project",
      project_detail_attributes: {
        project_detail_files_attributes: {
          0 => {
            filename: " "
          }
        }
      }
    }

    project.assign_attributes(params)

    expect(project).to be_invalid

    result = ApiMaker::ValidationErrorsGeneratorService.execute!(
      model: project,
      params: params
    )

    expect(result).to eq [
      {
        attribute_name: :filename,
        id: nil,
        input_name: "project[project_detail_attributes][project_detail_files_attributes][0][filename]",
        model_name: "project_detail_file",
        error_message: "can't be blank",
        error_type: :blank
      }
    ]
  end

  it "handles deeply nested errors through has one relationships with arrays" do
    params = {
      name: "Test project",
      project_detail_attributes: {
        project_detail_files_attributes: [
          {filename: " "}
        ]
      }
    }

    project.assign_attributes(params)

    expect(project).to be_invalid

    result = ApiMaker::ValidationErrorsGeneratorService.execute!(
      model: project,
      params: params
    )

    expect(result).to eq [
      {
        attribute_name: :filename,
        id: nil,
        input_name: "project[project_detail_attributes][project_detail_files_attributes][0][filename]",
        model_name: "project_detail_file",
        error_message: "can't be blank",
        error_type: :blank
      }
    ]
  end
end
