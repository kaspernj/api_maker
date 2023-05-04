module ApiMaker::SpecHelper::WorkerPluginsHelpers
  def worker_plugins_check(model)
    checkbox_selector = ".api-maker--table--worker-plugins-checkbox[data-model-id='#{model.id}']"
    is_checked = wait_for_and_find(checkbox_selector)[:checked]
    wait_for_and_find(checkbox_selector).click

    # Wait for change to occur
    if is_checked
      wait_for_selector "#{checkbox_selector}[data-checked='false']"
    else
      wait_for_selector "#{checkbox_selector}[data-checked='true']"
    end
  end
end
