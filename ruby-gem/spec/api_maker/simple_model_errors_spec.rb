require "rails_helper"

describe ApiMaker::SimpleModelErrors do
  it "generates errors for sub models" do
    task = build :task
    task.project.name = ""

    expect(task).to be_invalid

    errors = ApiMaker::SimpleModelErrors.execute!(model: task)

    expect(errors).to eq ["Name can't be blank"]
  end
end
