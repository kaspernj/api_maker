require "rails_helper"

describe "model validate" do
  it "validates a model" do
    visit models_validate_path

    wait_for_path models_validate_path, ignore_query: true

    wait_for_chrome { find("[data-controller='models--validate']", visible: false)["data-validate-response"].present? }

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
