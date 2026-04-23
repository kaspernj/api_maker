require "rails_helper"

describe "bootstrap - live table - worker_plugins workplace" do
  let(:task1) { create :task, name: "Task 1" }
  let(:task2) { create :task, name: "Task 2" }
  let(:user_admin) { create :user, admin: true }

  let(:check_all_selector) { ".api-maker--table--worker-plugins-check-all-checkbox" }

  def checkbox_selector(model)
    ".api-maker--table--worker-plugins-checkbox[data-model-id='#{model.id}']"
  end

  def current_workplace
    user_admin.reload.current_workplace
  end

  def workplace_link_for(resource)
    workplace = current_workplace
    return nil unless workplace

    WorkerPlugins::WorkplaceLink.find_by(
      resource_type: resource.class.name,
      resource_id: resource.id.to_s,
      workplace:
    )
  end

  it "creates a workplace link when a per-row checkbox is checked and removes it when unchecked" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path(workplace: true)

    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_action_cable_to_connect

    # Each checkbox renders with its initial unchecked state.
    wait_for_selector "#{checkbox_selector(task1)}[data-checked='false']"
    wait_for_selector "#{checkbox_selector(task2)}[data-checked='false']"

    # Check task1 — the row checkbox must end up visibly checked AND the
    # matching workplace_link must exist in the DB.
    expect { worker_plugins_check(task1) }
      .to change { workplace_link_for(task1) }.from(nil)

    # task2 must stay unaffected by task1's click.
    wait_for_selector "#{checkbox_selector(task2)}[data-checked='false']"
    expect(workplace_link_for(task2)).to be_nil

    # Click task1 again — link must be deleted and checkbox uncheck visibly.
    expect { worker_plugins_check(task1) }
      .to change { workplace_link_for(task1) }.to(nil)

    wait_for_selector "#{checkbox_selector(task1)}[data-checked='false']"
  end

  it "checks all found rows when the header check-all is toggled on and removes them when toggled off" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path(workplace: true)

    wait_for_selector model_row_selector(task1)
    wait_for_selector model_row_selector(task2)
    wait_for_action_cable_to_connect

    # Initial state — no links, check-all unchecked.
    expect(workplace_link_for(task1)).to be_nil
    expect(workplace_link_for(task2)).to be_nil

    # Toggle check-all on — both rows become checked and both links appear.
    wait_for_and_find(check_all_selector).click
    wait_for_selector "#{checkbox_selector(task1)}[data-checked='true']"
    wait_for_selector "#{checkbox_selector(task2)}[data-checked='true']"

    expect(workplace_link_for(task1)).not_to be_nil
    expect(workplace_link_for(task2)).not_to be_nil

    # Toggle check-all off — both rows become unchecked and both links are gone.
    wait_for_and_find(check_all_selector).click
    wait_for_selector "#{checkbox_selector(task1)}[data-checked='false']"
    wait_for_selector "#{checkbox_selector(task2)}[data-checked='false']"

    expect(workplace_link_for(task1)).to be_nil
    expect(workplace_link_for(task2)).to be_nil
  end
end
