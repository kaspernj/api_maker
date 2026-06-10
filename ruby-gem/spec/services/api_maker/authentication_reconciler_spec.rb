require "rails_helper"

describe ApiMaker::AuthenticationReconciler do
  def diverged?(believed_user_ids:, actual: {})
    described_class.diverged?(
      believed_user_ids:,
      actual_user_id_for: ->(scope) { actual[scope] }
    )
  end

  it "is not diverged when the believed user matches the actual user" do
    expect(diverged?(believed_user_ids: {"user" => 5}, actual: {"user" => 5})).to be(false)
  end

  it "is diverged when the actual user is signed out" do
    expect(diverged?(believed_user_ids: {"user" => 5}, actual: {"user" => nil})).to be(true)
  end

  it "is diverged when the actual user is a different id" do
    expect(diverged?(believed_user_ids: {"user" => 5}, actual: {"user" => 9})).to be(true)
  end

  it "is not diverged when there is no belief" do
    expect(diverged?(believed_user_ids: nil)).to be(false)
    expect(diverged?(believed_user_ids: {})).to be(false)
  end

  it "is not diverged for a non-hash believed payload" do
    expect(diverged?(believed_user_ids: "garbage")).to be(false)
  end

  it "ignores blank believed ids" do
    expect(diverged?(believed_user_ids: {"user" => ""}, actual: {"user" => nil})).to be(false)
  end

  it "compares ids as strings so string and integer ids match" do
    expect(diverged?(believed_user_ids: {"user" => "5"}, actual: {"user" => 5})).to be(false)
  end
end
