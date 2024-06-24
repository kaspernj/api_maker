require "rails_helper"

describe ApiMaker::UpdateCommand do
  let(:project) { create :project }
  let(:user) { create :user }

  let(:ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  let(:collection) { User.accessible_by(ability).where(id: user.id) }
  let(:controller) { instance_double(ApplicationController, api_maker_args:, current_ability: ability, current_user: user) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection:,
      command: ApiMaker::UpdateCommand,
      controller:
    )
  end

  it "returns validation errors" do
    user_params = {
      email: "user@example.com",
      tasks_attributes: {
        "123" => {
          name: "Test task",
          project_id: project.id
        },
        "124" => {
          name: "",
          project_id: project.id
        },
        "125" => {
          name: "Another task",
          project_id: project.id
        }
      }
    }

    command = helper.add_command(primary_key: user.id, args: {save: {user: user_params}})
    helper.execute!

    expect(command.result.fetch(:validation_errors)).to eq [
      {
        attribute_name: :name,
        attribute_type: :attribute,
        error_messages: ["can't be blank"],
        error_types: [:blank],
        input_name: "user[tasks_attributes][124][name]",
        id: nil,
        model_name: "task"
      }
    ]
  end
end
