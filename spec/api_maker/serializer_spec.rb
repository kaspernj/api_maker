require "rails_helper"

describe ApiMaker::Serializer do
  let!(:project) { create :project }
  let!(:task) { create :task, project: project, user: user }
  let!(:user) { create :user }

  it "serializes custom attributes" do
    result = JSON.parse(ApiMaker::Serializer.new(model: task).to_json)
    expect(result.dig("a", "custom_id")).to eq "custom-#{task.id}"
  end

  it "includes given arguments" do
    result = JSON.parse(ApiMaker::Serializer.new(args: {test_arg: "Test"}, model: user).to_json)
    expect(result.dig("a", "custom_attribute")).to eq "CustomAttribute - Test arg: Test"
  end

  it "supports conditions for attributes" do
    result = JSON.parse(ApiMaker::Serializer.new(args: {test_arg: "Test"}, model: user).to_json)
    expect(result.fetch("a").keys).to_not include "updated_at"

    user.email = "kasper@example.com"

    result = JSON.parse(ApiMaker::Serializer.new(args: {test_arg: "Test"}, model: user).to_json)
    expect(result.fetch("a").keys).to include "updated_at"
  end

  it "supports date types" do
    result = JSON.parse(ApiMaker::Serializer.new(model: user).to_json)
    expect(result.fetch("a").fetch("birthday_at")).to eq "1985-06-17"
  end
end
