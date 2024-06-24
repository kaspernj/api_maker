require "rails_helper"

describe Task do
  it "adds a validation model when given a blank translated collection value" do
    task = build(:task, state: "")

    expect(task).not_to be_valid
    expect(task.errors.full_messages).to eq ["State is not included in the list"]
    expect(task.translated_state).to be_nil
  end

  it "translates the state" do
    task = build(:task)

    expect(task.translated_state).to eq "Open"
  end
end
