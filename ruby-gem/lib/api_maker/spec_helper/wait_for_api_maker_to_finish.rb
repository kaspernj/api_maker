module ApiMaker::SpecHelper::WaitForApiMakerToFinish
  def self.included(base)
    base.after do
      wait_for_api_maker_to_finish
    end
  end

  def wait_for_api_maker_to_finish
    wait_for_browser do
      raise "The page was reset so couldn't wait" if page.html.include?("<html><head></head><body></body></html>")

      result = execute_script "
        const commandsPool = window.currentApiMakerCommandsPool

        if (!commandsPool) {
          return {
            commands_pool_status: 'not_running',
            reason: 'no_current_commands_pool'
          }
        }

        if (commandsPool.isActive()) {
          return {
            commands_pool_status: 'running',
            reason: 'reports_active'
          }
        }

        return {
          commands_pool_status: 'not_running',
          reason: 'reports_inactive'
        }
      "

      result.fetch("commands_pool_status") == "not_running"
    end
  end
end
