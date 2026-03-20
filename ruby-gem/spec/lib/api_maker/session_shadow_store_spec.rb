require "rails_helper"

SessionShadowStoreSpecSessionId = Struct.new(:public_id)

class SessionShadowStoreSpecSession < Hash
  attr_accessor :id
end

describe ApiMaker::SessionShadowStore do
  let(:session_id) { "old-session-id" }
  let(:session_object_id) { SessionShadowStoreSpecSessionId.new(session_id) }
  let(:request_env) { {} }
  let(:session) do
    SessionShadowStoreSpecSession.new.tap do |session_hash|
      session_hash.id = session_object_id
      session_hash["locale"] = "en"
    end
  end
  let(:request) { instance_double(ActionDispatch::Request, env: request_env, session:) }

  before do
    Rails.cache.clear
  end

  it "persists the current session data in the cache" do
    described_class.persist!(request:)

    expect(
      Rails.cache.read(described_class.cache_key(session_id))
    ).to eq({"locale" => "en"})
  end

  it "loads cached session data back into the request session" do
    Rails.cache.write(
      described_class.cache_key(session_id),
      {"locale" => "da"},
      expires_in: described_class::EXPIRES_IN
    )

    expect(session).to receive(:clear)
    expect(session).to receive(:update).with({"locale" => "da"})

    described_class.load!(request:)
  end

  it "clears keys that were removed from the cached session data" do
    session["warden.user.user.key"] = "stale-auth-data"

    Rails.cache.write(
      described_class.cache_key(session_id),
      {},
      expires_in: described_class::EXPIRES_IN
    )

    described_class.load!(request:)

    expect(session).not_to have_key("warden.user.user.key")
  end

  it "persists under both the loaded session id and the current session id when the session rotates" do
    Rails.cache.write(
      described_class.cache_key("old-session-id"),
      {"locale" => "en"},
      expires_in: described_class::EXPIRES_IN
    )

    described_class.load!(request:)

    session.id = SessionShadowStoreSpecSessionId.new("new-session-id")
    session["warden.user.user.key"] = ["User", "123"]

    described_class.persist!(request:)

    expect(
      Rails.cache.read(described_class.cache_key("old-session-id"))
    ).to include("warden.user.user.key" => ["User", "123"])
    expect(
      Rails.cache.read(described_class.cache_key("new-session-id"))
    ).to include("warden.user.user.key" => ["User", "123"])
  end
end
