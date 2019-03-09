require "rails_helper"

describe ApiMaker::IndexCommand do
  let(:ability) { ApiMakerAbility.new(args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  let!(:another_task) { create :task, user: user }
  let(:controller) { double(api_maker_args: api_maker_args, current_ability: ability, current_user: user) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection: Task.accessible_by(ability),
      command: ApiMaker::IndexCommand,
      controller: controller
    )
  end
  let!(:project) { create :project }
  let!(:task) { create :task, project: project, user: user }
  let!(:user) { create :user }

  describe "#execute!" do
    it "finds all tasks" do
      command = helper.add_command
      helper.execute!

      expect(command.result.fetch("data").length).to eq 2
    end

    it "includes pagination data" do
      command = helper.add_command(args: {page: 1})
      helper.execute!
      parsed = command.result

      expect(parsed.dig(:meta, :currentPage)).to eq 1
      expect(parsed.dig(:meta, :totalPages)).to eq 1
      expect(parsed.dig(:meta, :totalCount)).to eq 2
    end

    it "handels has many through relationships" do
      command = helper.add_command(args: {through: {model: "Project", id: project.id, reflection: "tasks"}})
      helper.execute!
      parsed = command.result

      expect(parsed.fetch("data").length).to eq 1
      expect(parsed.dig("data", 0, :attributes, :user_id)).to eq user.id
    end
  end
end
