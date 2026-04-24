class ApiMaker::SessionShadowStore
  CACHE_KEY_PREFIX = "api-maker-session-shadow-store".freeze
  EXPIRES_IN = 12 * 60 * 60
  LOADED_SESSION_ID_ENV_KEY = "api_maker.session_shadow_store.loaded_session_id".freeze
  # Cache stores that are either per-process or no-op, neither of which can
  # carry the shadow session between the HTTP sign-in worker and the cable
  # worker. We fail loud rather than appear to work and silently drop sign-ins.
  UNSUPPORTED_CACHE_STORE_NAMES = %w[
    ActiveSupport::Cache::MemoryStore
    ActiveSupport::Cache::NullStore
  ].freeze

  def self.load!(request:)
    ensure_shared_cache_store!
    session_data = read(request:)
    return if session_data.nil?

    request.session.clear
    request.session.update(session_data)
  end

  def self.persist!(request:)
    ensure_shared_cache_store!
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

  # Raises if Rails.cache is a per-process / no-op store that can't carry
  # shadow-session data between Puma workers. ApiMaker's Devise sign-in path
  # writes the warden session through Rails.cache on an HTTP request and then
  # reads it back from a cable request; with `:memory_store` the HTTP write
  # lands in one worker's memory and the cable read lands in another worker
  # that has never seen it, so sign-in silently fails and every subsequent
  # ability check runs as anonymous.
  #
  # Called on every load!/persist! but short-circuits after the first check
  # passes so it is cheap on the hot path.
  def self.ensure_shared_cache_store!
    return if @shared_cache_store_verified

    cache_class_name = Rails.cache.class.name
    if UNSUPPORTED_CACHE_STORE_NAMES.include?(cache_class_name)
      raise ApiMaker::SessionShadowStore::UnsupportedCacheStoreError, <<~MSG
        ApiMaker::SessionShadowStore requires a Rails.cache that is shared
        across processes, but Rails.cache is #{cache_class_name}.

        Under clustered Puma, HTTP sign-in writes the warden session to one
        worker's cache while the ActionCable Devise::PersistSession command
        reads from another worker's cache and finds nothing — the websocket
        stays signed out and ability checks fall back to the anonymous ruleset,
        so signed-in users appear to be missing permissions at random.

        Use a shared store, e.g. `:file_store` for single-host development or
        `:mem_cache_store` / `:redis_cache_store` / `:solid_cache_store` for
        multi-process / multi-host deployments.
      MSG
    end

    @shared_cache_store_verified = true
  end

  # Test-only helper for resetting the memoized check.
  def self.reset_shared_cache_store_check!
    @shared_cache_store_verified = nil
  end

  class UnsupportedCacheStoreError < StandardError; end

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
