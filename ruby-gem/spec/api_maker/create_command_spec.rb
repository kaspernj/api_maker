require "rails_helper"

describe ApiMaker::CreateCommand do
  let(:project) { create :project }
  let(:user) { create :user }

  let(:ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  let(:collection) { Task.accessible_by(ability) }
  let(:controller) { instance_double(ApplicationController, api_maker_args:, current_ability: ability, current_user: user) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection:,
      command: ApiMaker::CreateCommand,
      controller:
    )
  end

  it "returns validation errors" do
    task_params = {
      name: "Test task",
      user_id: user.id
    }

    command = helper.add_command(args: {save: {task: task_params}})
    helper.execute!

    json_result = command.result.to_json

    expect(JSON.parse(json_result)).to eq(
      "error_type" => "validation_error",
      "errors" => [{"message" => "Project must exist", "type" => "validation_error"}],
      "model" => {
        "api_maker_type" => "collection",
        "data" => {"tasks" => ["new-0"]},
        "preloaded" => {
          "tasks" => {
            "new-0" => {
              "a" => {
                "created_at" => nil,
                "custom_id" => "custom-",
                "finished" => false,
                "id" => nil,
                "name" => "Test task",
                "priority" => nil,
                "project_id" => nil,
                "state" => "open",
                "translated_state" => "Open",
                "user_id" => user.id
              }
            }
          }
        }
      },
      "success" => false,
      "validation_errors" => [
        {
          "attribute_name" => "project",
          "attribute_type" => "reflection",
          "error_messages" => ["must exist"],
          "error_types" => ["blank"],
          "id" => nil,
          "input_name" => "task[project]",
          "model_name" => "task"
        }
      ]
    )
  end
end
