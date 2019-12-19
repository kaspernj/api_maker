require "rails_helper"

describe ApiMaker::UpdateCommand do
  let(:project) { create :project }
  let(:user) { create :user }

  let(:ability) { ApiMaker::Ability.new(args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  let(:collection) { User.accessible_by(ability).where(id: user.id) }
  let(:controller) { instance_double("ApplicationController", api_maker_args: api_maker_args, current_ability: ability, current_user: user) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection: collection,
      command: ApiMaker::UpdateCommand,
      controller: controller
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

    command = helper.add_command(primary_key: user.id, args: {user: user_params})
    helper.execute!

    expect(command.result.fetch(:validation_errors)).to eq(
      "user[tasks_attributes][124][name]" => {
        attribute: :name,
        errors: [{type: :blank, message: "can't be blank"}],
        id: nil,
        model: "tasks"
      }
    )
  end
end
