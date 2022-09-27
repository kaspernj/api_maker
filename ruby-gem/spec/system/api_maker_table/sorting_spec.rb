require "rails_helper"

describe "bootstrap - live table - sorting" do
  let(:user_admin) { create :user, admin: true }

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
