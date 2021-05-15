require "rails_helper"

describe ApiMaker::SelectParser do
  it "parses sub models" do
    result = ApiMaker::SelectParser.execute!(select: {"UserRole" => ["id", "role"]})

    expect(result.keys).to eq [User::Role]
    expect(result.fetch(User::Role).keys).to eq [:id, :role]
  end

  it "raises an error when selecting an invalid attribute" do
    expect { ApiMaker::SelectParser.execute!(select: {"UserRole" => ["id", "invalid_attribute", "role"]}) }
      .to raise_error("Attribute not found on the UserRole resource: invalid_attribute")
  end
end
