require "rails_helper"

describe "super admin - current workplace missing" do
  let(:task) { create :task }
  let(:user_admin) { create :user, :admin }

  it "does not raise JS errors when workplace is missing" do
    allow_any_instance_of(User).to receive(:with_advisory_lock).and_return(false)

    task
    login_as user_admin
    super_admin_test_index_render(task)

    expect_no_browser_errors
  end
end
