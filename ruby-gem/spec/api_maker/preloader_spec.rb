require "rails_helper"

describe ApiMaker::Preloader do
  let(:admin_user) { create :user, admin: true }
  let(:admin_ability) { ApiMaker::Ability.new(api_maker_args: {current_user: admin_user}) }

  let(:account) { create :account }
  let(:account_marked_task) { create :account_marked_task, account:, task: task_marked_on_account }
  let(:project) { create :project, account: }
  let(:task_marked_on_account) { create :task, project: create(:project) }
  let(:task_user_assigned_to) { create :task, project:, user: }
  let(:user) { create :user }

  describe "#fill_empty_relationships_for_key" do
    it "fills up only the relationship that is being preloaded with empty relationships" do
      account_marked_task
      task_user_assigned_to

      collection = User.where(id: user.id)
      collection_serializer = ApiMaker::CollectionSerializer.new(
        ability: admin_ability,
        collection:,
        query_params: {
          preload: [
            "tasks.account.account_marked_tasks.task",
            "tasks.project" # Its important that the 'tasks.project' is after the other one to replicate the issue
          ]
        }
      )
      result = collection_serializer.as_json
      other_task_preload = result.dig!("preloaded", "tasks", task_marked_on_account.id.to_s)

      # It shouldn't have any relationships loaded just because the other task preload has
      expect(other_task_preload).not_to have_key :r
    end
  end
end
