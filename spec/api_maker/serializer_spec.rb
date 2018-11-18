require "rails_helper"

describe ApiMaker::Serializer do
  let!(:project) { create :project }
  let!(:task) { create :task, project: project, user: user }
  let!(:user) { create :user }

  it "serializes custom attributes" do
    result = ApiMaker::Serializer.new(model: task).result
    expect(result.fetch(:custom_id)).to eq "custom-#{task.id}"
  end

  it "includes given arguments" do
    result = ApiMaker::Serializer.new(args: {test_arg: "Test"}, model: user).result
    expect(result.fetch(:custom_attribute)).to eq "CustomAttribute - Test arg: Test"
  end

  it "supports conditions for attributes" do
    result = ApiMaker::Serializer.new(args: {test_arg: "Test"}, model: user).result
    expect(result).to_not include :updated_at

    user.email = "kasper@example.com"

    result = ApiMaker::Serializer.new(args: {test_arg: "Test"}, model: user).result
    expect(result).to include :updated_at
  end
end
