require "rails_helper"

describe ApiMaker::ResultParser do
  let(:user) { create :user }
  let(:user_ability) { ApiMakerAbility.for_user(user) }

  it "serializers ActiveRecord objects" do
    fake_controller = double(api_maker_args: {current_user: user}, current_ability: user_ability)

    result = ApiMaker::ResultParser.parse({test: {user: user}}, controller: fake_controller)

    expect(result.fetch(:test).fetch(:user).fetch(:api_maker_type)).to eq :model
    expect(result.fetch(:test).fetch(:user).fetch(:model_name)).to eq "users"
    expect(result.fetch(:test).fetch(:user).fetch(:serialized).fetch(:a).fetch(:id)).to eq user.id
  end
end
