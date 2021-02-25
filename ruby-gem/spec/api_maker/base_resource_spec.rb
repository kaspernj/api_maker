require "rails_helper"

describe ApiMaker::BaseResource do
  let(:task2) { create :task, id: 2 }
  let(:task2_detail) { create :task_detail, task: task2 }

  let(:task3) { create :task, id: 3 }
  let(:task3_detail) { create :task_detail, task: task3 }

  let(:user) { create :user }
  let(:user_ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }

  describe "#can_access_through" do
    it "adds access to resource through relationships" do
      expect_to_be_able_to user_ability, task3_detail, [:test_accessible_by]
      expect_not_to_be_able_to user_ability, task2_detail, [:test_accessible_by]
    end
  end

  describe "#collection_name" do
    it "returns the expected name" do
      expect(Resources::ActivityResource.collection_name).to eq "activities"
    end
  end

  describe "#default_select" do
    it "returns a list of attributes to select by default" do
      attribute_keys = Resources::AccountResource.default_select.keys
      expect(attribute_keys).to eq [:id, :name]
    end
  end

  describe "#model_class" do
    it "returns the model class for the resource" do
      expect(Resources::ActivityResource.model_class).to eq PublicActivity::Activity
    end
  end

  describe "#model_class_name" do
    it "returns the model class name" do
      expect(Resources::ActivityResource.model_class_name).to eq "PublicActivity::Activity"
    end
  end

  describe "#plural_name" do
    it "returns the plural name for classes with a custom model class" do
      expect(Resources::ActivityResource.plural_name).to eq "Activities"
    end
  end

  describe "#short_name" do
    it "returns the short name" do
      expect(Resources::ActivityResource.short_name).to eq "Activity"
    end
  end
end
