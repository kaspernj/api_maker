require "rails_helper"

describe ApiMaker::ModelExtensions do
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
end
