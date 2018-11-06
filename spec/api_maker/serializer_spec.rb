require "rails_helper"

describe ApiMaker::Serializer do
  let!(:project) { create :project }
  let!(:task) { create :task, project: project, user: user }
  let!(:user) { create :user }

  it "preloads relationships" do
    serializer = ApiMaker::Serializer.new(model: user, include_param: "tasks.project")
    result = serializer.result

    puts "Result: #{result}"

    expect(result.fetch(:tasks).first.fetch(:project).fetch(:id)).to eq project.id
  end

  it "serializes custom attributes" do
    serializer = ApiMaker::Serializer.new(model: task)
    result = serializer.result

    expect(result.fetch(:custom_id)).to eq "custom-#{task.id}"
  end
end
