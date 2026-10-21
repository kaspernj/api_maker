require "rails_helper"

describe ApiMaker::SelectParser do
  it "parses sub models" do
    result = ApiMaker::SelectParser.execute!(select: {"UserRole" => ["id", "role"]})

    expect(result.keys).to eq [User::Role]
    expect(result.fetch(User::Role).keys).to eq [:id, :role]
  end

  it "raises a client-contract error naming the resource and the attribute when selecting an invalid attribute" do
    expect { ApiMaker::SelectParser.execute!(select: {"UserRole" => ["id", "invalid_attribute", "role"]}) }
      .to raise_error(ApiMaker::UnknownSelectAttributeError, "Attribute not found on the UserRole resource: invalid_attribute")
  end

  it "counts each unknown-attribute rejection so repeated occurrences stay observable" do
    before_count = ApiMaker::SelectParser.unknown_select_attribute_count

    expect { ApiMaker::SelectParser.execute!(select: {"UserRole" => ["invalid_attribute"]}) }
      .to raise_error(ApiMaker::UnknownSelectAttributeError)

    expect(ApiMaker::SelectParser.unknown_select_attribute_count).to eq(before_count + 1)

    ApiMaker::SelectParser.execute!(select: {"UserRole" => ["id"]})
    expect(ApiMaker::SelectParser.unknown_select_attribute_count).to eq(before_count + 1)
  end
end
