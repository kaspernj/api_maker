require "rails_helper"

describe ApiMaker::CollectionCommandService do
  let(:ability) { ApiMaker::Ability.new }
  let(:command_response) { ApiMaker::CommandResponse.new(controller: fake_controller) }
  let(:fake_controller) { double }
  let(:service) do
    ApiMaker::CollectionCommandService.new(
      ability:,
      api_maker_args: {},
      command_name: "asd",
      commands: [],
      command_response:,
      controller: fake_controller,
      resource_name: "activities"
    )
  end
  let(:account_marked_task_service) do
    ApiMaker::CollectionCommandService.new(
      ability:,
      api_maker_args: {},
      command_name: "asd",
      commands: [],
      command_response:,
      controller: fake_controller,
      resource_name: "account-marked-tasks"
    )
  end

  describe "#model_class" do
    it "returns the correct model class" do
      expect(service.model_class.name).to eq "PublicActivity::Activity"
      expect(account_marked_task_service.model_class.name).to eq "AccountMarkedTask"
    end
  end

  describe "#namespace" do
    it "returns the expected namespace for resources with a custom model class" do
      expect(service.namespace).to eq "Activities"
      expect(account_marked_task_service.namespace).to eq "AccountMarkedTasks"
    end
  end

  describe "#resource" do
    it "returns the correct resource" do
      expect(service.resource.name).to eq "Resources::ActivityResource"
    end
  end
end
