require "rails_helper"

describe ApiMaker::CollectionLoader do
  let(:user) { create :user }
  let(:user_ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }
  let(:user_task1) { create :task, user: }
  let(:user_task2) { create :task, user: }

  describe "#manage_through_relationship" do
    it "handels if no access to the parent model" do
      collection_loader = ApiMaker::CollectionLoader.new(
        ability: user_ability,
        api_maker_args: {},
        collection: Task.all,
        locals: {},
        params: {
          through: {
            model: "User",
            id: 25
          }
        }
      )

      result = collection_loader.manage_through_relationship

      expect(result).to be_nil
    end
  end
end
