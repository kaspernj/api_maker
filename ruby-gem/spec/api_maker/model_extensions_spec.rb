require "rails_helper"

describe ApiMaker::ModelExtensions do
  let(:activity) { create :activity }
  let(:task) { create :task }

  describe "#api_maker_event" do
    it "broadcasts an event" do
      expect(ActionCable.server).to receive(:broadcast).with(
        "api_maker_events_Task_#{task.id}_test-event",
        args: {name: "Kasper"},
        event_name: "test-event",
        model_id: task.id,
        model_type: "tasks",
        type: :event
      )

      task.api_maker_event("test-event", name: "Kasper")
    end
  end

  describe "#api_maker_broadcast_create_channel_name" do
    it "returns the expected channel name" do
      expect(activity.class.api_maker_broadcast_create_channel_name).to eq "api_maker_creates_Activity"
    end
  end

  describe "#api_maker_broadcast_destroy_channel_name" do
    it "returns the expected channel name" do
      expect(activity.api_maker_broadcast_destroy_channel_name).to eq "api_maker_destroys_Activity_#{activity.id}"
    end
  end

  describe "#api_maker_event_channel_name" do
    it "returns the expected channel name" do
      expect(activity.api_maker_event_channel_name("test")).to eq "api_maker_events_Activity_#{activity.id}_test"
    end
  end

  describe "#api_maker_broadcast_update_channel_name" do
    it "returns the expected channel name" do
      expect(activity.api_maker_broadcast_update_channel_name).to eq "api_maker_updates_Activity_#{activity.id}"
    end
  end
end
