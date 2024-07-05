require "rails_helper"

describe "models - load has one through" do
  let(:account) { create :account, id: 22 }
  let(:project) { create :project, account:, id: 23 }
  let(:task) { create :task, id: 24, project:, user: }
  let(:user) { create :user }

  before do
    # Create some data to expose ID issues
    10.times do
      account = create(:account)
      project = create(:project, account:)
      create(:task, project:, user:)
    end
  end

  it "loads the account through the project" do
    login_as user
    visit models_load_has_one_through_path(task_id: task.id)
    wait_for_selector ".component-models-load-has-one-through .content-container"

    content_container = wait_for_and_find(".content-container")

    expect(content_container["data-account-id"]).to eq "22"
    expect(content_container["data-task-id"]).to eq "24"
  end
end
