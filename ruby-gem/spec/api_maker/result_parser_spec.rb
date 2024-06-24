require "rails_helper"

describe ApiMaker::ResultParser do
  let(:fake_controller) { double(api_maker_args: {current_user: user}, current_ability: user_ability) }
  let(:project) { create :project }
  let(:user) { create :user }
  let(:user_ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }

  it "serializers ActiveRecord objects" do
    result = ApiMaker::ResultParser.parse({test: {user:}}, controller: fake_controller)

    expect(result.fetch(:test).fetch(:user).fetch(:api_maker_type)).to eq :model
    expect(result.fetch(:test).fetch(:user).fetch(:model_name)).to eq "users"
    expect(result.fetch(:test).fetch(:user).fetch(:serialized).fetch(:a).fetch(:id)).to eq user.id
  end

  it "supports nested money types" do
    result = ApiMaker::ResultParser.parse({test: {project:}}, controller: fake_controller)
    price = result.fetch(:test).fetch(:project).fetch(:serialized).fetch(:a).fetch(:price_per_hour)

    expect(price).to eq(api_maker_type: :money, amount: 10_000, currency: "USD")
  end
end
