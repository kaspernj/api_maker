require "rails_helper"

describe "bootstrap - live table - worker_plugins workplace" do
  let(:task1) { create :task, name: "Task 1" }
  let(:task2) { create :task, name: "Task 2" }
  let(:user_admin) { create :user, admin: true }

  let(:check_all_selector) { ".api-maker--table--worker-plugins-check-all-checkbox" }
  let(:overlay_selector) { "[data-class='api-maker--table--blocking-overlay']" }

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

  it "shows the blocking overlay while the check-all probe loads and while toggling all" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path(workplace: true, delay_query_ms: 400)

    # Overlay element is always mounted; `data-overlay-state` reflects the
    # current state so we can assert the overlay is actually covering the
    # table rather than just sitting in the DOM. `visible: :all` because the
    # overlay sits at opacity 0 when not blocking and Capybara treats that as
    # invisible.
    expect(page).to have_css(overlay_selector, visible: :all)
    overlay_in_state = lambda do |state|
      expect(page).to have_css("#{overlay_selector}[data-overlay-state='#{state}']", visible: :all)
    end

    # The initial updateAllChecked probe should trigger the overlay; after the
    # probe resolves, the overlay should drop back to idle.
    overlay_in_state.call("blocking")
    overlay_in_state.call("idle")

    # Toggling the header select-all kicks off addQuery — overlay should come
    # back on, then drop off when the action and the follow-up probe complete.
    wait_for_and_find(check_all_selector).click
    overlay_in_state.call("blocking")
    overlay_in_state.call("idle")
    wait_for_selector "#{checkbox_selector(task1)}[data-checked='true']"
    wait_for_selector "#{checkbox_selector(task2)}[data-checked='true']"
  end

  it "visibly covers the table during a heavy action — opacity fades in and pointer-events intercept clicks" do
    task1
    task2

    login_as user_admin
    visit bootstrap_live_table_path(workplace: true, delay_query_ms: 800)

    wait_for_selector model_row_selector(task1)
    wait_for_action_cable_to_connect

    # Kick off a heavy action that holds the overlay blocking for ~800 ms
    # (delayed query plus the auto-refresh probe that follows).
    wait_for_and_find(check_all_selector).click

    wait_for_selector "#{overlay_selector}[data-overlay-state='blocking']", visible: :all
    overlay = find(overlay_selector, visible: :all)

    # Opacity animates 0 → 1 over 150 ms; `match_style` reads the live
    # computed-style via Capybara's driver API and retries until it settles
    # so we don't read mid-transition.
    expect(overlay).to match_style({"opacity" => "1"}, wait: 2)
    expect(overlay).to match_style("pointer-events" => "auto")

    # The overlay must physically cover the table — at minimum not collapse
    # to a zero-sized node.
    rect = overlay.rect
    expect(rect.width).to be > 50
    expect(rect.height).to be > 50

    # When the action resolves the overlay must actually go away, not just
    # drop its state flag. Opacity animates back to 0 and pointer-events to
    # "none" so clicks reach the table again.
    expect(page).to have_css("#{overlay_selector}[data-overlay-state='idle']", visible: :all)
    expect(overlay).to match_style({"opacity" => "0"}, wait: 2)
    expect(overlay).to match_style("pointer-events" => "none")
  end
end
