require "rails_helper"

describe ApiMaker::DestroyCommand do
  let(:ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  let(:collection) { Account.accessible_by(ability).where(id: account.id) }
  let(:controller) { instance_double(ApplicationController, api_maker_args:, current_ability: ability, current_user: user) }
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection:,
      command: ApiMaker::DestroyCommand,
      controller:
    )
  end

  let!(:account) { create :account }
  let!(:project) { create :project, account: }
  let!(:task) { create :task, project: }
  let!(:user) { create :user }

  describe "#errors_for_model" do
    it "generates error messages" do
      expect_any_instance_of(ApiMaker::DestroyCommand).to receive(:errors_for_model).and_call_original

      project = create :project
      create(:project_secret, id: 4849, project:)

      result = ApiMaker::SpecHelper::ExecuteMemberCommand.execute!(command: ApiMaker::DestroyCommand, model: project)

      expect(result.fetch(:errors)).to eq ["Cannot delete because of child errors in project_secrets with IDs: 4849: cannot destroy project secret 4849"]
    end
  end

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
