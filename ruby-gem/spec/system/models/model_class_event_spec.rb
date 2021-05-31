require "rails_helper"

describe "models - model class event" do
  let(:user) { create :user }

  it "calls the event" do
    login_as user
    visit models_model_class_event_path
    wait_for_selector ".event-data", visible: false
    wait_for_action_cable_to_connect
    Task.api_maker_event("test_model_class_event", first_name: "Donald", last_name: "Duck")

    wait_for_browser do
      raw_event_data = wait_for_and_find(".event-data", visible: false).text

      if raw_event_data.present?
        event_data = JSON.parse(raw_event_data)
        event_data == {
          "args" => {
            "first_name" => "Donald",
            "last_name" => "Duck"
          },
          "eventName" => "test_model_class_event"
        }
      end
    end
  end
end
