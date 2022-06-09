require "rails_helper"

describe "bootstrap - sort link" do
  let(:user) { create :user }

  it "sorts the tasks" do
    create_list :task, 5, user: user

    login_as user
    visit bootstrap_sort_link_path
    wait_for_selector ".component-bootstrap-sort-link .content-container"

    wait_for_selector ".component-api-maker-bootstrap-sort-link[href='/bootstrap/sort-link?q%5Bs%5D=id%20asc']"
    wait_for_and_find(".component-api-maker-bootstrap-sort-link").click
    wait_for_path "/bootstrap/sort-link?q%5Bs%5D=id%20asc", ignore_query: false
    wait_for_order_of_elements ".task-row", ->(element) { element["data-task-id"] }, %w[1 2 3 4 5]

    wait_for_selector ".component-api-maker-bootstrap-sort-link[href='/bootstrap/sort-link?q%5Bs%5D=id%20desc']"
    wait_for_and_find(".component-api-maker-bootstrap-sort-link").click
    wait_for_path "/bootstrap/sort-link?q%5Bs%5D=id%20desc", ignore_query: false
    wait_for_order_of_elements ".task-row", ->(element) { element["data-task-id"] }, %w[5 4 3 2 1]
  end
end
