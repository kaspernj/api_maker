require "rails_helper"

describe ApiMaker::CollectionCommandService do
  let(:ability) { ApiMaker::Ability.new }
  let(:command_response) { ApiMaker::CommandResponse.new(controller: fake_controller) }
  let(:fake_controller) { double }
  let(:service) do
    ApiMaker::CollectionCommandService.new(
      ability: ability,
      args: {},
      command_name: "asd",
      commands: [],
      command_response: command_response,
      controller: fake_controller,
      model_name: "public_activity/activity"
    )
  end

  describe "#klass" do
    it "returns the correct model class" do
      expect(service.klass.name).to eq "PublicActivity::Activity"
    end
  end

  describe "#namespace" do
    it "returns the expected namespace for resources with a custom model class" do
      expect(service.namespace).to eq "Activities"
    end
  end

  describe "#resource" do
    it "returns the correct resource" do
      expect(service.resource.name).to eq "Resources::ActivityResource"
    end
  end
end
