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
end
