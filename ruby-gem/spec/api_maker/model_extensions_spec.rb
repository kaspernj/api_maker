require "rails_helper"

describe ApiMaker::ModelExtensions do
  let(:activity1) { create :activity }
  let(:activity2) { create :activity }

  let(:task1) { create :task }
  let(:task2) { create :task }

  describe "#api_maker_event" do
    it "broadcasts an events with the correct data" do
      task1
      task2

      expect(ActionCable.server).to receive(:broadcast).with(
        "api_maker_events_Task_#{task1.id}_test-event",
        {
          a: {name: "Kasper"},
          e: "test-event",
          mi: task1.id,
          mt: "tasks",
          t: :e
        }
      )
      expect(ActionCable.server).to receive(:broadcast).with(
        "api_maker_events_Task_#{task2.id}_test-event",
        {
          a: {name: "Kasper"},
          e: "test-event",
          mi: task2.id,
          mt: "tasks",
          t: :e
        }
      )

      task1.api_maker_event("test-event", name: "Kasper")
      task2.api_maker_event("test-event", name: "Kasper")
    end
  end

  describe "#api_maker_broadcast_create_channel_name" do
    it "returns the expected channel name" do
      expect(activity1.class.api_maker_broadcast_create_channel_name).to eq "api_maker_creates_Activity"
      expect(activity2.class.api_maker_broadcast_create_channel_name).to eq "api_maker_creates_Activity"

      expect(task1.class.api_maker_broadcast_create_channel_name).to eq "api_maker_creates_Task"
      expect(task2.class.api_maker_broadcast_create_channel_name).to eq "api_maker_creates_Task"
    end
  end

  describe "#api_maker_broadcast_destroy_channel_name" do
    it "returns the expected channel name" do
      expect(activity1.api_maker_broadcast_destroy_channel_name).to eq "api_maker_destroys_Activity_#{activity1.id}"
      expect(activity2.api_maker_broadcast_destroy_channel_name).to eq "api_maker_destroys_Activity_#{activity2.id}"

      expect(task1.api_maker_broadcast_destroy_channel_name).to eq "api_maker_destroys_Task_#{task1.id}"
      expect(task2.api_maker_broadcast_destroy_channel_name).to eq "api_maker_destroys_Task_#{task2.id}"
    end
  end

  describe "#api_maker_event_channel_name" do
    it "returns the expected channel name" do
      expect(activity1.api_maker_event_channel_name("test")).to eq "api_maker_events_Activity_#{activity1.id}_test"
      expect(activity2.api_maker_event_channel_name("test")).to eq "api_maker_events_Activity_#{activity2.id}_test"

      expect(task1.api_maker_event_channel_name("test")).to eq "api_maker_events_Task_#{task1.id}_test"
      expect(task2.api_maker_event_channel_name("test")).to eq "api_maker_events_Task_#{task2.id}_test"
    end
  end

  describe "#api_maker_broadcast_update_channel_name" do
    it "returns the expected channel name" do
      expect(activity1.api_maker_broadcast_update_channel_name).to eq "api_maker_updates_Activity_#{activity1.id}"
      expect(activity2.api_maker_broadcast_update_channel_name).to eq "api_maker_updates_Activity_#{activity2.id}"

      expect(task1.api_maker_broadcast_update_channel_name).to eq "api_maker_updates_Task_#{task1.id}"
      expect(task2.api_maker_broadcast_update_channel_name).to eq "api_maker_updates_Task_#{task2.id}"
    end
  end
end
