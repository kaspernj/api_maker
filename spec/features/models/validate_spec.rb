require "rails_helper"

describe "model validate" do
  it "validates a model", :js do
    visit models_validate_path

    expect(current_path).to eq models_validate_path

    WaitUtil.wait_for_condition("project to be validated") { find("[data-controller='models--validate']", visible: false)["data-validate-response"].present? }

    response = JSON.parse(find("[data-controller='models--validate']", visible: false)["data-validate-response"])

    expect(response).to eq(
      "errors" => [
        "Project must exist",
        "Name can't be blank"
      ],
      "valid" => false
    )
  end
end
