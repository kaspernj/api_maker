require "rails_helper"

describe "session status - timeout" do
  let(:user) { create :user }

  it "automatically signs the user out" do
    login_as user

    travel_to = Devise.timeout_in + 1.hour

    Timecop.travel(travel_to) do
      asd
    end
  end
end
