module WindowHelpers
  def resize_to(width, height)
    if $current_width != width || $current_height != height # rubocop:disable Style/GlobalVars
      Capybara.current_session.driver.browser.manage.window.resize_to(width, height)
      $current_width = width # rubocop:disable Style/GlobalVars
      $current_height = height # rubocop:disable Style/GlobalVars
    end
  end
end
