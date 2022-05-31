require "rails_helper"

describe ApiMaker::MemoryStorage do
  let(:memory_storage) { ApiMaker::MemoryStorage.current }

  describe "#resource_for_model" do
    it "works for a model using a custom model class" do
      memory_storage.reset

      expect(memory_storage.resources_loaded?).to eq false
      expect(memory_storage.resource_for_model(PublicActivity::Activity).name).to eq "Resources::ActivityResource"
    end
  end
end
