require "rails_helper"

describe "bootstrap - sort link" do
  let(:user) { create :user }

  it "sorts the tasks" do
    create_list(:task, 5, user:)

    login_as user
    visit bootstrap_sort_link_path
    wait_for_selector ".component-bootstrap-sort-link .content-container"

    asc_params = "{\"s\":\"id+asc\"}"
    desc_params = "{\"s\":\"id+desc\"}"

    wait_for_selector "[data-component='api-maker--bootstrap--sort-link'][href='/bootstrap/sort-link?q=#{asc_params}']"
    wait_for_and_find("[data-component='api-maker--bootstrap--sort-link']").click
    wait_for_path "/bootstrap/sort-link?q=#{asc_params}", ignore_query: false
    wait_for_order_of_elements ".task-row", ->(element) { element["data-task-id"] }, %w[1 2 3 4 5]

    wait_for_selector "[data-component='api-maker--bootstrap--sort-link'][href='/bootstrap/sort-link?q=#{desc_params}']"
    wait_for_and_find("[data-component='api-maker--bootstrap--sort-link']").click
    wait_for_path "/bootstrap/sort-link?q=#{desc_params}", ignore_query: false
    wait_for_order_of_elements ".task-row", ->(element) { element["data-task-id"] }, %w[5 4 3 2 1]
  end
end
