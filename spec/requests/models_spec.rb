require "rails_helper"

describe "models" do
  let!(:user) { create :user }
  let!(:task) { create :task, user: user }
  let!(:another_task) { create :task }

  describe "#index" do
    it "finds all tasks" do
      login_as user

      get "/api_maker/tasks"

      parsed = JSON.parse(response.body)

      expect(parsed.fetch("collection").length).to eq 2
    end

    it "handels has many through relationships" do
      login_as user

      get "/api_maker/tasks/?through[model]=User&through[id]=#{user.id}&through[reflection]=tasks"

      parsed = JSON.parse(response.body)

      expect(parsed.fetch("collection").length).to eq 1
      expect(parsed.dig("collection", 0, "user_id")).to eq user.id
    end
  end
end
