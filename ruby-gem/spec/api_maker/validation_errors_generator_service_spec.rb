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
        attribute_type: :monetized_attribute,
        id: project.id,
        input_name: "project[price_per_hour]",
        model_name: "project",
        error_messages: ["is not a number"],
        error_types: [:not_a_number]
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
        attribute_type: :attribute,
        id: nil,
        input_name: "project[project_detail_attributes][project_detail_files_attributes][0][filename]",
        model_name: "project_detail_file",
        error_messages: ["can't be blank"],
        error_types: [:blank]
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
        attribute_type: :attribute,
        id: nil,
        input_name: "project[project_detail_attributes][project_detail_files_attributes][0][filename]",
        model_name: "project_detail_file",
        error_messages: ["can't be blank"],
        error_types: [:blank]
      }
    ]
  end

  it "handles errors that are added to base" do
    params = {
      name: "Hans"
    }

    project.assign_attributes(params)

    expect(project).to be_invalid

    result = ApiMaker::ValidationErrorsGeneratorService.execute!(
      model: project,
      params: params
    )

    expect(result).to eq [
      {
        attribute_name: :base,
        attribute_type: :base,
        id: project.id,
        model_name: "project",
        error_messages: ["Navn kan ikke være Hans"],
        error_types: [:custom_error]
      }
    ]
  end

  it "handles validations that are added multiple times" do
    params = {
      name: nil
    }

    project.assign_attributes(params)

    expect(project).to be_invalid

    result = ApiMaker::ValidationErrorsGeneratorService.execute!(
      model: project,
      params: params
    )

    expect(result).to eq [{
      attribute_name: :name,
      attribute_type: :attribute,
      id: project.id,
      model_name: "project",
      error_messages: ["can't be blank"],
      error_types: [:blank, :blank],
      input_name: "project[name]"
    }]
  end
end
