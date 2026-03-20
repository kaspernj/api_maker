class ApiMaker::SessionShadowStore
  CACHE_KEY_PREFIX = "api-maker-session-shadow-store".freeze
  EXPIRES_IN = 12 * 60 * 60
  LOADED_SESSION_ID_ENV_KEY = "api_maker.session_shadow_store.loaded_session_id".freeze

  def self.load!(request:)
    session_data = read(request:)
    return if session_data.nil?

    request.session.clear
    request.session.update(session_data)
  end

  def self.persist!(request:)
    session_ids_for_write(request:).each do |session_id|
      Rails.cache.write(cache_key(session_id), request.session.to_hash, expires_in: EXPIRES_IN)
    end
  end

  def self.read(request:)
    session_id = session_id_for(request:)
    return if session_id.blank?

    request.env[LOADED_SESSION_ID_ENV_KEY] = session_id
    Rails.cache.read(cache_key(session_id))
  end

  def self.cache_key(session_id)
    "#{CACHE_KEY_PREFIX}:#{session_id}"
  end

  def self.session_id_for(request:)
    request.session.id&.public_id || request.session["session_id"]
  end

  def self.session_ids_for_write(request:)
    [
      request.env[LOADED_SESSION_ID_ENV_KEY],
      session_id_for(request:)
    ].compact_blank.uniq
  end
end
