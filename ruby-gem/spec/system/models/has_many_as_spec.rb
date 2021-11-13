require "rails_helper"

describe "models - has many as" do
  let(:admin) { create :user, :admin }
  let(:task) { create :task }
  let(:comment1) { create :comment, resource: task }
  let(:comment2) { create :comment, resource: task }

  it "reads the models from the relationship" do
    comment1
    comment2

    login_as admin
    visit models_has_many_as_path(task_id: task.id)
    wait_for_selector ".comment-container[data-comment-id='#{comment1.id}']"
    wait_for_selector ".comment-container[data-comment-id='#{comment2.id}']"
  end
end
