require "rails_helper"

describe "api maker paginate" do
  let(:user) { create :user }

  before do
    create_list(:task, 80, user: user)
  end

  it "changes page successfully" do
    login_as user, scope: :user

    visit models_paginate_path

    wait_for_selector ".component-models-paginate .content-container"

    expect(page).to have_selector "a[href='/models/paginate?tasks_page=1']"
    expect(page).to have_selector "a[href='/models/paginate?tasks_page=2']"
    expect(page).to have_selector "a[href='/models/paginate?tasks_page=3']"
    expect(page).not_to have_selector "a[href='/models/paginate?tasks_page=4']"

    find("a[href='/models/paginate?tasks_page=2']", match: :first).click

    wait_for_selector ".task-row[data-task-id='45']"

    expect(current_url).to end_with "/models/paginate?tasks_page=2"
  end
end
