require "rails_helper"

describe ApiMaker::SelectParser do
  it "parses sub models" do
    result = ApiMaker::SelectParser.execute!(select: {"UserRole" => %w[id role]})

    expect(result.keys).to include User::Role
    expect(result.fetch(User::Role).keys).to eq [:id, :role]
  end
end
