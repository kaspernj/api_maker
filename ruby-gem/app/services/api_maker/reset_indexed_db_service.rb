class ApiMaker::ResetIndexedDbService < ApiMaker::ApplicationService
  attr_reader :context

  delegate :browser_firefox?, :browser_logs, :execute_script, to: :context

  def initialize(context:)
    @context = context
  end

  def perform
    # Firefox doesnt support 'indexedDB.databases()'
    reset_indexed_db unless browser_firefox?

    succeed!
  end

  def reset_indexed_db
    execute_script "
      indexedDB.databases().then(function(databases) {
        var promises = []
        for(var database of databases) {
          promises.push(indexedDB.deleteDatabase(database.name))
        }

        Promise.all(promises).then(function() {
          console.error('All databases was deleted')
        })
      })
    "

    WaitUtil.wait_for_condition("databases to be deleted", delay_sec: 0.2, timeout_sec: 6) do
      logs_text = browser_logs.map(&:message).join("\n")
      logs_text.include?("\"All databases was deleted\"")
    end
  end
end
