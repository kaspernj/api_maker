require "rails_helper"

describe ApiMaker::BaseCommand do
  let(:account) { create :account }
  let(:task) { create :task }

  describe "#failure_save_response" do
    it "responds with simple model errors" do
      result = ApiMaker::SpecHelper::ExecuteMemberCommand.execute!(
        command: Commands::Tasks::FailureSaveResponse,
        model: task,
        args: {
          task: {
            name: "Task",
            project_attributes: {
              account_id: account.id,
              name: "Hans"
            }
          },
          simple_model_errors: true
        }
      )

      expect(result).to include(
        errors: [
          {
            message: "Navn kan ikke være Hans",
            type: :validation_error
          }
        ]
      )
    end

    it "responds with validation errors" do
      result = ApiMaker::SpecHelper::ExecuteMemberCommand.execute!(
        command: Commands::Tasks::FailureSaveResponse,
        model: task,
        args: {
          task: {
            name: "Task",
            project_attributes: {
              account_id: account.id,
              name: "Hans"
            }
          },
          simple_model_errors: false
        }
      )

      expect(result).to include(
        errors: [
          {
            message: "Project base Navn kan ikke være Hans",
            type: :validation_error
          }
        ]
      )
    end
  end

  describe "#save_models_or_fail" do
    it "saves the given model" do
      result = ApiMaker::SpecHelper::ExecuteMemberCommand.execute!(command: Commands::Tasks::TouchWithSaveModelsOrFail, model: task)

      expect(result).to eq(success: true)
      expect(task.reload.created_at).to eq Time.zone.parse("1985-06-17 10:30")
    end
  end

  it "passes the api maker args for a member command" do
    result = ApiMaker::SpecHelper::ExecuteMemberCommand.execute!(api_maker_args: {passed: true}, command: Commands::Tasks::TestMember, model: task)

    expect(result.dig!(:api_maker_args, :passed)).to eq true
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
