require "rails_helper"

describe ApiMaker::TranslatedCollections do
  let(:task) { create :task }

  it "adds a 'translated_state' instance method" do
    I18n.with_locale(:da) do
      expect(task.translated_state).to eq "Åben"
    end

    I18n.with_locale(:en) do
      expect(task.translated_state).to eq "Open"
    end

    task.state = "closed"

    I18n.with_locale(:da) do
      expect(task.translated_state).to eq "Lukket"
    end

    I18n.with_locale(:en) do
      expect(task.translated_state).to eq "Closed"
    end
  end

  it "adds a 'translated_states' class method" do
    I18n.with_locale(:da) do
      expect(Task.translated_states).to eq(
        "Åben" => "open",
        "Lukket" => "closed"
      )
    end

    I18n.with_locale(:en) do
      expect(Task.translated_states).to eq(
        "Open" => "open",
        "Closed" => "closed"
      )
    end
  end
end
