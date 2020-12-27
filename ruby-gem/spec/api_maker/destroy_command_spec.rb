require "rails_helper"

describe ApiMaker::DestroyCommand do
  let(:ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  let(:collection) { Account.accessible_by(ability).where(id: account.id) }
  let(:controller) { instance_double("ApplicationController", api_maker_args: api_maker_args, current_ability: ability, current_user: user) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection: collection,
      command: ApiMaker::DestroyCommand,
      controller: controller
    )
  end

  let!(:account) { create :account }
  let!(:project) { create :project, account: account }
  let!(:task) { create :task, project: project }
  let!(:user) { create :user }

  describe "#execute!" do
    it "finds all tasks" do
      command = helper.add_command(primary_key: account.id)
      helper.execute!

      expect(command.result.dig!(:errors, 0)).to match(
        /\ACannot delete because of Account\(\d+\) -> Project\(\d+\) has dependent records: tasks with IDs: \d+\Z/
      )
    end
  end
end
