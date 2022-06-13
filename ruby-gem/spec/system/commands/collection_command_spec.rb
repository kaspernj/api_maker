require "rails_helper"

describe "collection command" do
  let(:user) { create :user }

  it "calls the correct command and responds" do
    login_as user

    visit commands_collection_command_path

    wait_for_path commands_collection_command_path

    wait_for_browser do
      find("[data-controller='commands--collection']", visible: false)["data-test-collection-response"].present?
    end

    response = JSON.parse(find("[data-controller='commands--collection']", visible: false)["data-test-collection-response"])

    expect(response.fetch("test_collection_command_called")).to be true
  end
end
