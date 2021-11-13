require "rails_helper"

describe "models - has many as" do
  let(:admin) { create :user, :admin, email: "admin@example.com" }
  let(:task1) { create :task, support_email: "admin@example.com" }
  let(:task2) { create :task, support_email: "admin@example.com" }
  let(:task3) { create :task, support_email: "other@example.com" }

  it "reads the models from the relationship" do
    task1
    task2
    task3

    login_as admin
    visit models_has_many_options_primary_key_path(user_id: admin.id)
    wait_for_selector ".supported-task-container[data-task-id='#{task1.id}']"
    wait_for_selector ".supported-task-container[data-task-id='#{task2.id}']"
    wait_for_no_selector ".supported-task-container[data-task-id='#{task3.id}']"
  end
end
