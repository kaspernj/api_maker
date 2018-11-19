require "rails_helper"

describe "models" do
  let!(:another_task) { create :task, user: user }
  let!(:project) { create :project }
  let!(:task) { create :task, project: project, user: user }
  let!(:user) { create :user }

  describe "#index" do
    it "finds all tasks" do
      login_as user

      get "/api_maker/tasks"

      parsed = JSON.parse(response.body)

      expect(parsed.fetch("data").length).to eq 2
    end

    it "includes pagination data" do
      login_as user

      get "/api_maker/tasks?page=1"

      parsed = JSON.parse(response.body)

      expect(parsed.dig("meta", "currentPage")).to eq 1
      expect(parsed.dig("meta", "totalPages")).to eq 1
      expect(parsed.dig("meta", "totalCount")).to eq 2
    end

    it "handels has many through relationships" do
      login_as user

      get "/api_maker/tasks/?through[model]=Project&through[id]=#{project.id}&through[reflection]=tasks"

      parsed = JSON.parse(response.body)

      expect(parsed.fetch("data").length).to eq 1
      expect(parsed.dig("data", 0, "attributes", "user_id")).to eq user.id
    end
  end
end
