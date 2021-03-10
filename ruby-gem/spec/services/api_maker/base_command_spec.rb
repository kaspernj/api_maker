require "rails_helper"

describe ApiMaker::BaseCommand do
  let(:task) { create :task }

  describe "#save_models_or_fail" do
    it "saves the given model" do
      result = ApiMaker::SpecHelper::ExecuteMemberCommand.execute!(command: Commands::Tasks::TouchWithSaveModelsOrFail, model: task)

      expect(result).to eq(success: true)
      expect(task.reload.created_at).to eq Time.zone.parse("1985-06-17 10:30")
    end
  end

  it "executes a collection command" do
    result = ::ApiMaker::SpecHelper::ExecuteCollectionCommand.execute!(
      api_maker_args: {passed: true},
      command: Commands::Tasks::TestCollection,
      model_class: Task
    )

    expect(result.fetch(:test_collection_command_called)).to eq true
    expect(result.dig!(:api_maker_args, :passed)).to eq true
  end
end
