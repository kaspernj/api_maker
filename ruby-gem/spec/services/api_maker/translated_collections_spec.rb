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

  it "adds a 'translated_states_inverted' class method" do
    I18n.with_locale(:da) do
      expect(Task.translated_states_inverted).to eq(
        "open" => "Åben",
        "closed" => "Lukket"
      )
    end

    I18n.with_locale(:en) do
      expect(Task.translated_states_inverted).to eq(
        "open" => "Open",
        "closed" => "Closed"
      )
    end
  end

  it "doesnt allow changing translated collection keys" do
    expect { Task.translated_states["test"] = "test" }.to raise_error(FrozenError)
  end

  it "validates state" do
    task.state = "invalid"

    expect(task).not_to be_valid
    expect(task.errors.full_messages).to eq ["State is not included in the list"]
  end

  it "adds a class method for the possible values" do
    expect(Task.states).to eq ["open", "closed"]
  end

  it "doesnt allow changing the possible values" do
    expect { Task.states << "test" }.to raise_error(FrozenError)
  end

  it "adds a scope that checks for wrong values" do
    task
    open_tasks = Task.with_states(:open)
    closed_tasks = Task.with_states(:closed)

    expect(open_tasks).to eq [task]
    expect(closed_tasks).to eq []
  end

  it "raises an error when given invalid scope values" do
    expect { Task.with_states(:invalid_value) }
      .to raise_error(ApiMaker::TranslatedCollections::InvalidCollectionValueError, "Invalid option for state: invalid_value")
  end
end
