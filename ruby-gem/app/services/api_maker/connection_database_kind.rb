class ApiMaker::ConnectionDatabaseKind
  KINDS = [:postgres, :mysql, :mariadb, :other].freeze
  MYSQL_LIKE_ADAPTERS = [:mysql2, :trilogy].freeze

  @cache = {}
  @mutex = Mutex.new

  # Returns the database kind for the given ActiveRecord connection.
  # Result is cached per connection pool since a pool always has one adapter
  # + server version for its lifetime. Multi-DB apps get correct per-pool
  # detection this way.
  def self.for(connection)
    pool_id = connection.pool&.object_id || connection.object_id
    cached = @mutex.synchronize { @cache[pool_id] }
    return cached if cached

    detected = detect(connection)
    @mutex.synchronize { @cache[pool_id] = detected }
    detected
  end

  def self.detect(connection)
    adapter = connection.adapter_name.to_s.downcase.to_sym
    return :postgres if adapter == :postgresql
    return mariadb_connection?(connection) ? :mariadb : :mysql if MYSQL_LIKE_ADAPTERS.include?(adapter)

    :other
  end

  def self.mariadb_connection?(connection)
    return connection.mariadb? if connection.respond_to?(:mariadb?)

    version = connection.select_value("SELECT VERSION()").to_s
    version.include?("MariaDB")
  rescue StandardError
    false
  end

  # For tests.
  def self.reset_cache!
    @mutex.synchronize { @cache.clear }
  end
end
