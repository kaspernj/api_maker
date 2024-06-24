require "rails_helper"

describe ApiMaker::Serializer do
  let(:account) { create :account }
  let!(:project) { create :project, account: }
  let!(:task) { create :task, project:, user: }
  let!(:user) { create :user }

  it "serializes custom attributes" do
    result = JSON.parse(ApiMaker::Serializer.new(model: task).to_json)
    expect(result.dig("a", "custom_id")).to eq "custom-#{task.id}"
  end

  it "includes given arguments" do
    result = JSON.parse(ApiMaker::Serializer.new(api_maker_args: {test_arg: "Test"}, model: user).to_json)
    expect(result.dig("a", "custom_attribute")).to eq "CustomAttribute - Test arg: Test"
  end

  it "supports conditions for attributes" do
    result = JSON.parse(ApiMaker::Serializer.new(api_maker_args: {test_arg: "Test"}, model: user).to_json)
    expect(result.fetch("a").keys).not_to include "updated_at"

    user.email = "kasper@example.com"

    result = JSON.parse(ApiMaker::Serializer.new(api_maker_args: {test_arg: "Test"}, model: user).to_json)
    expect(result.fetch("a").keys).to include "updated_at"
  end

  it "supports date types" do
    result = JSON.parse(ApiMaker::Serializer.new(model: user).to_json)
    expect(result.fetch("a").fetch("birthday_at")).to eq "1985-06-17"
  end

  describe "#attributes_to_read" do
    it "returns the default select if none are given" do
      serializer = ApiMaker::Serializer.new(model: account)

      expect(serializer.attributes_to_read).to eq(
        id: {args: {requires_columns: [:id]}, data: :id},
        name: {args: {requires_columns: [:name]}, data: :name}
      )
      expect(serializer.as_json).to eq(
        a: {
          id: account.id,
          name: account.name
        }
      )
    end

    it "returns given select if given" do
      serializer = ApiMaker::Serializer.new(
        model: account,
        select: {
          id: {args: {}, data: :id},
          name: {args: {}, data: :name},
          users_count: {args: {}, data: :users_count}
        }
      )

      expect(serializer.attributes_to_read).to eq(
        id: {args: {}, data: :id},
        name: {args: {}, data: :name},
        users_count: {args: {}, data: :users_count}
      )
      expect(serializer.as_json).to eq(
        a: {
          id: account.id,
          name: account.name,
          users_count: 0
        }
      )
    end
  end
end
