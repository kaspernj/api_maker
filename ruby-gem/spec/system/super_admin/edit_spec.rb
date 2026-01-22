require "rails_helper"

describe "super admin - edit" do
  let(:project) { create :project }
  let(:task) { create :task }
  let(:user_admin) { create :user, admin: true }

  it "navigates to the edit-model-page, enters the form, submits and edits an existing record" do
    project
    task

    login_as user_admin
    super_admin_test_edit(
      task,
      inputs: {
        name: "Edit task name",
        project_id: project.id,
        user_id: user_admin.id
      }
    )
  end

  it "renders default values for custom edit content inputs" do
    task = create :task, state: "closed"

    login_as user_admin

    resource = ApiMaker::MemoryStorage.current.resource_for_model(task.class)
    visit super_admin_path(model: resource.short_name)
    wait_for_and_find(model_row_edit_button_selector(task)).click
    wait_for_selector "[data-testid='super-admin--edit-page']"

    state_input = wait_for_and_find("input[data-id='task_state'], textarea[data-id='task_state']")
    expect(state_input.value).to eq "closed"
  end
end
