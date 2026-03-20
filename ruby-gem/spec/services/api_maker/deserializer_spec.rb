require "rails_helper"

describe ApiMaker::Deserializer do
  it "deserializes dates" do
    result = ApiMaker::Deserializer.execute!(
      arg: {
        test: {
          "api_maker_type" => "datetime",
          "value" => "1985-6-17 10:30:5+0200"
        }
      }
    )

    expected_date = Time.new(1985, 6, 17, 10, 30, 5, "+02:00")
    result_date = result.dig!(:test)

    expect(result_date).to eq expected_date
  end

  it "deserializes collections from hash-with-indifferent-access payloads" do
    result = ApiMaker::Deserializer.execute!(
      arg: ActiveSupport::HashWithIndifferentAccess.new(
        "api_maker_type" => "collection",
        "value" => {
          "args" => {
            "modelClass" => {
              "api_maker_type" => "resource",
              "name" => "Task"
            }
          },
          "queryArgs" => {}
        }
      )
    )

    expect(result).to be_a(ApiMaker::Collection)
    expect(result.resource_class).to eq(Resources::TaskResource)
    expect(result.query_params).to eq({})
  end
end
