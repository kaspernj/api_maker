require "rails_helper"

describe "bootstrap - live table - per page" do
  let(:user_admin) { create :user, admin: true }

  it "changes the amount of records shown per page" do
    tasks = []
    characters = %w[0 1 2 3 4 5 6 7 8 9]

    9.downto(0) do |number1|
      9.downto(0) do |number2|
        tasks << create(:task, name: "#{characters[number1]}#{characters[number2]}-task")
      end
    end

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_expect { expect(all("[data-class='task-row']").length).to eq 30 }
    wait_for_and_find(".per-page-select").select(60)
    wait_for_expect { expect(all("[data-class='task-row']").length).to eq 60 }
    wait_for_and_find(".per-page-select").select("All")
    wait_for_expect { expect(all("[data-class='task-row']").length).to eq 100 }
  end

  it "warns before loading a dangerous number of rows and lets the user proceed or cancel" do
    project = create(:project)
    now = Time.current
    rows = Array.new(1001) do |index|
      {name: "bulk-task-#{index}", project_id: project.id, state: "open", finished: false, created_at: now, updated_at: now}
    end
    Task.insert_all(rows) # rubocop:disable Rails/SkipsModelValidations

    login_as user_admin
    visit bootstrap_live_table_path
    wait_for_expect { expect(all("[data-class='task-row']").length).to eq 30 }

    # Selecting "All" above the threshold (default 1000) warns instead of loading everything.
    wait_for_and_find(".per-page-select").select("All")
    wait_for_selector "[data-testid='large-per-page-warning-modal']"
    expect(all("[data-class='task-row']").length).to eq 30

    # Cancelling keeps the current per-page.
    wait_for_and_find("[data-testid='large-per-page-cancel-button']").click
    wait_for_no_selector "[data-testid='large-per-page-warning-modal']"
    expect(all("[data-class='task-row']").length).to eq 30

    # Proceeding loads all the rows.
    wait_for_and_find(".per-page-select").select("All")
    wait_for_selector "[data-testid='large-per-page-warning-modal']"
    wait_for_and_find("[data-testid='large-per-page-proceed-button']").click
    wait_for_no_selector "[data-testid='large-per-page-warning-modal']"
    wait_for_expect { expect(all("[data-class='task-row']").length).to eq 1001 }
  end
end
