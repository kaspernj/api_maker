require "rails_helper"

describe ApiMaker::CreateCommand do
  let(:project) { create :project }
  let(:user) { create :user }

  let(:ability) { ApiMaker::Ability.new(args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  let(:collection) { Task.accessible_by(ability) }
  let(:controller) { instance_double("ApplicationController", api_maker_args: api_maker_args, current_ability: ability, current_user: user) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection: collection,
      command: ApiMaker::CreateCommand,
      controller: controller
    )
  end

  it "returns validation errors" do
    task_params = {
      name: "Test task",
      user_id: user.id
    }

    command = helper.add_command(args: {save: {task: task_params}})
    helper.execute!

    expect(command.result).to eq(
      errors: ["Project must exist"],
      model: {
        data: {"tasks" => ["new-0"]},
        preloaded: {
          "tasks" => {
            "new-0" => {
              "created_at" => nil,
              "custom_id" => nil,
              "finished" => nil,
              "id" => nil,
              "name" => "Test task",
              "project_id" => nil,
              "user_id" => user.id
            }
          }
        }
      },
      success: false,
      validation_errors: [
        {
          attribute_name: :project,
          error_message: "must exist",
          error_type: :blank,
          id: nil,
          input_name: "task[project]",
          model_name: "task"
        }
      ]
    )
  end
end
