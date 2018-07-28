require "rails_helper"

describe ApiMaker::ControllerContentGeneratorService do
  let(:service) { ApiMaker::ControllerContentGeneratorService.new(model: Task) }

  describe "#content" do
    it "generates the right content" do
      content = service.__send__(:content)

      expect(content).to include "class ApiMaker::TasksController < ApiMaker::ModelController"
    end
  end
end
