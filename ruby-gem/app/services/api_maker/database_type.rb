class ApiMaker::DatabaseType
  def self.postgres?
    adapter_name == :postgresql
  end

  def self.adapter_name
    @adapter_name ||= ApplicationRecord.connection.adapter_name.downcase.to_sym
  end
end
