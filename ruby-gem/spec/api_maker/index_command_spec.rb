require "rails_helper"

describe ApiMaker::IndexCommand do
  let(:ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  let!(:another_task) { create :task, user: }
  let(:collection) { Task.accessible_by(ability) }
  let(:controller) { double(api_maker_args:, current_ability: ability, current_user: user) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection:,
      command: ApiMaker::IndexCommand,
      controller:
    )
  end

  let!(:account) { create :account }
  let!(:project) { create :project, account: }
  let!(:task) { create :task, project:, user: }
  let!(:user) { create :user }

  describe "#execute!" do
    it "finds all tasks" do
      command = helper.add_command
      helper.execute!

      expect(command.result.dig!(:collection, "data", "tasks").length).to eq 2
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

      expect(parsed.dig(:collection, "data", "tasks")).to eq [task.id]
      expect(parsed.dig(:collection, "preloaded", "tasks", task.id.to_s, :a, :user_id)).to eq user.id
    end

    it "handels the distinct argument" do
      create(:account_marked_task, account:, task:)
      create(:account_marked_task, account:, task:)

      command = helper.add_command(args: {distinct: true, q: {account_marked_tasks_account_id_eq: account.id}})
      helper.execute!
      parsed = command.result

      tasks = parsed.dig!(:collection, "data", "tasks")

      # This would cause two times the same task ID without the distinct
      expect(tasks).to eq [task.id]
    end
  end
end
