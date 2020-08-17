require "rails_helper"

describe "bootstrap - sort link" do
  let(:user) { create :user }

  it "sorts the tasks" do
    create_list(:task, 5, user: user)

    login_as user

    visit bootstrap_sort_link_path
    wait_for_selector ".component-bootstrap-sort-link .content-container"

    find(".component-api-maker-bootstrap-sort-link").click

    wait_for_browser do
      task_row_ids = all(".task-row").map { |element| element["data-task-id"] }
      expect(task_row_ids).to eq %w[1 2 3 4 5]
    end

    find(".component-api-maker-bootstrap-sort-link").click

    wait_for_browser do
      task_row_ids = all(".task-row").map { |element| element["data-task-id"] }
      task_row_ids == %w[5 4 3 2 1]
    end
  end
end
