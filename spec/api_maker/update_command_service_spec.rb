require "rails_helper"

describe ApiMaker::UpdateCommandService do
  let(:ability) { ApiMaker::Ability.new(args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  let!(:another_task) { create :task, user: user }
  let(:command_response) { ApiMaker::CommandResponse.new(controller: controller) }
  let(:controller) { double(api_maker_args: api_maker_args, current_ability: ability, current_user: user) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection: Task.accessible_by(ability),
      command: ApiMaker::UpdateCommand,
      controller: controller
    )
  end
  let!(:project) { create :project }
  let!(:task) { create :task, project: project, user: user }
  let!(:user) { create :user }

  describe "#collection" do
    it "selects the models for the given ids" do
      service = ApiMaker::UpdateCommandService.new(
        ability: ability,
        args: api_maker_args,
        command_name: nil,
        command_response: command_response,
        controller: controller,
        resource_name: "Task",
        commands: {
          0 => {
            "primary_key" => task.id
          }
        }
      )

      expect(service.collection.count).to eq 1
    end
  end
end
