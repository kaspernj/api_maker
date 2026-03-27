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

  def self.read_signed(request: nil, token:) # rubocop:disable Lint/UnusedMethodArgument
    session_id = session_id_from_signed_token(token:)

    return if session_id.blank?

    # The token is cryptographically signed by Rails.application.message_verifier,
    # so the session_id it carries is trustworthy without cross-checking against
    # the current request's session. This allows persistSession HTTP calls to
    # resolve the user after a WebSocket sign-in where the HTTP session ID differs.
    Rails.cache.read(cache_key(session_id))
  end

  def self.signed_token_for(request:)
    session_id = session_id_for_signed_token(request:)
    return if session_id.blank?

    verifier.generate({session_id:}, purpose: CACHE_KEY_PREFIX)
  end

  def self.cache_key(session_id)
    "#{CACHE_KEY_PREFIX}:#{session_id}"
  end

  def self.session_id_for(request:)
    session = request.session

    if session.respond_to?(:id) && session.id
      session.id.public_id
    else
      session["session_id"]
    end
  end

  def self.session_ids_for_write(request:)
    [
      request.env[LOADED_SESSION_ID_ENV_KEY],
      session_id_for(request:)
    ].compact_blank.uniq
  end

  def self.verifier
    Rails.application.message_verifier(CACHE_KEY_PREFIX)
  end

  def self.session_id_for_signed_token(request:)
    request.env[LOADED_SESSION_ID_ENV_KEY].presence || session_id_for(request:)
  end

  def self.session_id_from_signed_token(token:)
    payload = verifier.verified(token, purpose: CACHE_KEY_PREFIX)
    return if payload.blank?

    if payload.is_a?(Hash)
      payload["session_id"] || payload[:session_id]
    else
      payload
    end
  end
end
