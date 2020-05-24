require "rails_helper"

describe ApiMaker::MemoryStorage do
  let(:memory_storage) { ApiMaker::MemoryStorage.current }

  describe "#resource_for_model" do
    it "works for a model using a custom model class" do
      expect(memory_storage).to receive(:resource_name_for_model).and_return("Resources::PublicActivityActivityResource")
      expect(memory_storage).to receive(:resource_name_for_model).and_return("Resources::ActivityResource")
      expect(memory_storage).to receive(:resources_loaded?).and_return(false)
      expect(memory_storage.resource_for_model(PublicActivity::Activity).name).to eq "Resources::ActivityResource"
    end
  end
end
