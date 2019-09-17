require "rails_helper"

describe "boootstrap - checkbox" do
  let(:task) { create :task, user: user }
  let(:user) { create :user }

  it "renders a boolean based checkbox by default" do
    login_as user

    visit bootstrap_checkbox_boolean_path(task_id: task.id)

    routes = execute_script "return Routes"
    expect(routes.keys).to include "bootstrapCheckboxBooleanPath"

    wait_for_selector ".content-container"
  end
end
