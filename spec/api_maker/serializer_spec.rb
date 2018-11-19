require "rails_helper"

describe ApiMaker::Serializer do
  let!(:project) { create :project }
  let!(:task) { create :task, project: project, user: user }
  let!(:user) { create :user }

  it "serializes custom attributes" do
    result = JSON.parse(ApiMaker::Serializer.new(model: task).to_json)
    expect(result.dig("attributes", "custom_id")).to eq "custom-#{task.id}"
  end

  it "includes given arguments" do
    result = JSON.parse(ApiMaker::Serializer.new(args: {test_arg: "Test"}, model: user).to_json)
    expect(result.dig("attributes", "custom_attribute")).to eq "CustomAttribute - Test arg: Test"
  end

  it "supports conditions for attributes" do
    result = JSON.parse(ApiMaker::Serializer.new(args: {test_arg: "Test"}, model: user).to_json)
    expect(result.fetch("attributes").keys).to_not include "updated_at"

    user.email = "kasper@example.com"

    result = JSON.parse(ApiMaker::Serializer.new(args: {test_arg: "Test"}, model: user).to_json)
    expect(result.fetch("attributes").keys).to include "updated_at"
  end
end
