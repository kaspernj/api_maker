require "rails_helper"

describe ApiMaker::UpdateCommandService do
  let(:ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  let!(:another_task) { create :task, user: }
  let(:command_response) { ApiMaker::CommandResponse.new(controller:) }
  let(:controller) { double(api_maker_args:, current_ability: ability, current_user: user) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection: Task.accessible_by(ability),
      command: ApiMaker::UpdateCommand,
      controller:
    )
  end
  let!(:project) { create :project }
  let!(:task) { create :task, project:, user: }
  let!(:user) { create :user }

  describe "#collection" do
    it "selects the models for the given ids" do
      service = ApiMaker::UpdateCommandService.new(
        ability:,
        api_maker_args:,
        command_name: nil,
        command_response:,
        controller:,
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
