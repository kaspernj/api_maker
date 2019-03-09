require "rails_helper"

describe ApiMaker::UpdateCommandService do
  let(:ability) { ApiMakerAbility.new(args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  let!(:another_task) { create :task, user: user }
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
        command_name: nil,
        controller: controller,
        model_name: "Task",
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
