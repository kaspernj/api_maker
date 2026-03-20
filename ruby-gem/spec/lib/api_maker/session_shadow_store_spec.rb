require "rails_helper"

SessionShadowStoreSpecSessionId = Struct.new(:public_id)

class SessionShadowStoreSpecSession < Hash
  attr_accessor :id
end

describe ApiMaker::SessionShadowStore do
  let(:session_id) { "session-id-1" }
  let(:session_object_id) { SessionShadowStoreSpecSessionId.new(session_id) }
  let(:session) do
    SessionShadowStoreSpecSession.new.tap do |session_hash|
      session_hash.id = session_object_id
      session_hash["locale"] = "en"
    end
  end
  let(:request) { instance_double(ActionDispatch::Request, session:) }

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
end
