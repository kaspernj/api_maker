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

  it "filters" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_and_find("input[name='name_cont']").set("Task 2")
    wait_for_no_selector model_row_selector(task1)
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

  it "sorts by default given through params when switching pages" do
    tasks = []
    characters = %w[0 1 2 3 4 5 6 7 8 9]

    9.downto(0) do |number1|
      9.downto(0) do |number2|
        tasks << create(:task, name: "#{characters[number1]}#{characters[number2]}-task")
      end
    end

    login_as user_admin
    visit bootstrap_live_table_path

    tasks.slice(70, 30).reverse_each do |task|
      wait_for_selector model_row_selector(task)
    end

    wait_for_and_find(".page-link", text: 2).click

    tasks.slice(40, 30).reverse_each do |task|
      wait_for_selector model_row_selector(task)
    end

    wait_for_and_find(".page-link", text: 3).click

    tasks.slice(10, 30).reverse_each do |task|
      wait_for_selector model_row_selector(task)
    end
  end
end
