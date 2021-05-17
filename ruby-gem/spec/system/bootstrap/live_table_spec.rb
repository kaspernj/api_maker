require "rails_helper"

describe "bootstrap - live table" do
  let(:task1) { create :task, name: "Task 1" }
  let(:task2) { create :task, name: "Task 2" }
  let(:user_admin) { create :user, admin: true }

  it "renders a table with rows" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
  end

  it "destroys a row" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_action_cable_to_connect

    destroy_action = proc do
      wait_for_and_find("#{model_row_selector(task2)} .destroy-button").click
      confirm_accept
      wait_for_no_selector model_row_selector(task2)
    end

    expect { destroy_action.call }.to change(Task, :count).by(-1)
    expect { task2.reload }.to raise_error(ActiveRecord::RecordNotFound)
    wait_for_selector model_row_selector(task1)
  end
end
