class ApiMaker::SessionShadowStore
  CACHE_KEY_PREFIX = "api-maker-session-shadow-store".freeze
  EXPIRES_IN = 12 * 60 * 60

  def self.load!(request:)
    session_data = read(request:)
    return if session_data.blank?

    request.session.update(session_data)
  end

  def self.persist!(request:)
    session_id = session_id_for(request:)
    return if session_id.blank?

    Rails.cache.write(cache_key(session_id), request.session.to_hash, expires_in: EXPIRES_IN)
  end

  def self.read(request:)
    session_id = session_id_for(request:)
    return if session_id.blank?

    Rails.cache.read(cache_key(session_id))
  end

  def self.cache_key(session_id)
    "#{CACHE_KEY_PREFIX}:#{session_id}"
  end

  def self.session_id_for(request:)
    request.session.id&.public_id || request.session["session_id"]
  end
end
