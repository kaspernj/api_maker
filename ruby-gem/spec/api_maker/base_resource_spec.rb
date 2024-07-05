require "rails_helper"

describe ApiMaker::BaseResource do
  let(:task2) { create :task, id: 2 }
  let(:task2_account_marked_task) { create :account_marked_task, id: 2, task: task2 }
  let(:task2_detail) { create :task_detail, id: 2, task: task2 }
  let(:comment2) { create :comment, author: comment2_author, id: 2, resource: task2 }
  let(:comment2_author) { create :user, id: 2 }

  let(:task3) { create :task, id: 3 }
  let(:task3_account_marked_task) { create :account_marked_task, id: 3, task: task3 }
  let(:task3_detail) { create :task_detail, id: 3, task: task3 }
  let(:comment3) { create :comment, author: comment3_author, id: 3, resource: task3 }
  let(:comment3_author) { create :user, id: 3 }

  let(:user) { create :user }
  let(:user_ability) { ApiMaker::Ability.new(api_maker_args:) }
  let(:api_maker_args) { {current_user: user} }

  describe "#attributes" do
    it "supports if as a block" do
      # It doesnt include the attribute if not signed in
      serializer = ApiMaker::Serializer.new(model: task2)
      attributes = serializer.attributes

      expect(attributes.keys).not_to include :created_at

      # It includes the attribute if signed in
      serializer = ApiMaker::Serializer.new(api_maker_args:, model: task2)
      attributes = serializer.attributes

      expect(attributes.keys).to include :created_at
    end
  end

  describe "#can_access_through" do
    it "adds access to resource through relationships" do
      expect_to_be_able_to user_ability, task3_detail, [:test_accessible_by]
      expect_not_to_be_able_to user_ability, task2_detail, [:test_accessible_by]
    end
  end

  describe "#can_access_through_accessible_model" do
    it "grants access through polymorphic belongs_to relationships" do
      expect_any_instance_of(Resources::TaskResource).to receive(:abilities) do |task_resource|
        task_resource.can ApiMaker::BaseResource::READ, Task, id: 2
      end

      expect_any_instance_of(Resources::CommentResource).to receive(:abilities) do |comment_resource|
        comment_resource.can_access_through_accessible_model ApiMaker::BaseResource::READ, :resource, Task
      end

      expect_to_be_able_to user_ability, comment2, ApiMaker::BaseResource::READ
      expect_not_to_be_able_to user_ability, comment3, ApiMaker::BaseResource::CRUD
    end

    it "grants access through polymorphic belongs_to relationships on new models" do
      comment2 = build :comment, author: comment2_author, id: 2, resource: task2
      comment3 = build :comment, author: comment3_author, id: 3, resource: task3

      expect_any_instance_of(Resources::TaskResource).to receive(:abilities) do |task_resource|
        task_resource.can ApiMaker::BaseResource::READ, Task, id: 2
      end

      expect_any_instance_of(Resources::CommentResource).to receive(:abilities) do |comment_resource|
        comment_resource.can_access_through_accessible_model ApiMaker::BaseResource::READ, :resource, Task
      end

      expect_to_be_able_to user_ability, comment2, ApiMaker::BaseResource::READ
      expect_not_to_be_able_to user_ability, comment3, ApiMaker::BaseResource::CRUD
    end

    it "grants access through belongs_to relationships" do
      expect_any_instance_of(Resources::TaskResource).to receive(:abilities) do |task_resource|
        task_resource.can ApiMaker::BaseResource::READ, Task, id: 2
      end

      expect_any_instance_of(Resources::TaskDetailResource).to receive(:abilities) do |task_detail_resource|
        task_detail_resource.can_access_through_accessible_model ApiMaker::BaseResource::READ, :task
      end

      expect_to_be_able_to user_ability, task2_detail, ApiMaker::BaseResource::READ
      expect_not_to_be_able_to user_ability, task3_detail, ApiMaker::BaseResource::CRUD
    end

    it "grants access through has_many relationships" do
      expect_any_instance_of(Resources::UserResource).to receive(:abilities) do |user_resource|
        user_resource.can_access_through_accessible_model ApiMaker::BaseResource::READ, :comments
      end

      expect_any_instance_of(Resources::CommentResource).to receive(:abilities) do |comment_resource|
        comment_resource.can ApiMaker::BaseResource::READ, Comment, id: 2
      end

      comment2
      comment3

      expect_to_be_able_to user_ability, comment2_author, ApiMaker::BaseResource::READ
      expect_not_to_be_able_to user_ability, comment3_author, ApiMaker::BaseResource::CRUD
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
