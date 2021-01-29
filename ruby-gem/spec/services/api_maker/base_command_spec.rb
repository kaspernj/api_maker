require "rails_helper"

describe ApiMaker::BaseCommand do
  let(:task) { create :task }

  describe "#save_models_or_fail" do
    it "saves the given model" do
      result = ApiMaker::SpecHelpers::ExecuteMemberCommand.execute!(command: Commands::Tasks::TouchWithSaveModelsOrFail, model: task)

      expect(result).to eq(success: true)
      expect(task.reload.created_at).to eq Time.zone.parse("1985-06-17 10:30")
    end
  end
end
