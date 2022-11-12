require "rails_helper"

describe "session statuses - auto renew" do
  let(:admin) { create :user, :admin }
  let(:task) { create :task, name: "Test task" }

  it "auto renews authenticity token" do
    call_count = 0
    allow_any_instance_of(ApiMaker::CommandsController).to receive(:create).and_wrap_original do |method, *args|
      call_count += 1

      if call_count == 1
        raise ActionController::InvalidAuthenticityToken
      elsif call_count >= 2
        method.call(*args)
      else
        raise "Unexpect call #{call_count}"
      end
    end

    login_as admin
    visit edit_task_path(task)
    wait_for_selector "label[for='task_state']", exact_text: "State"
    wait_for_and_find("#task_name").set("Test update task")
    select "Closed", from: "task_state"
    select 6, from: "task_priority"
    wait_for_and_find("input[type=submit]").click
    wait_for_flash_message "The task was saved"

    expect(task.reload).to have_attributes(
      name: "Test update task",
      priority: 6,
      state: "closed"
    )
    expect(call_count).to eq 3
  end
end
