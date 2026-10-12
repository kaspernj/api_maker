module ApiMaker::SpecHelper::WaitForSelector
  def wait_for_selector(selector, *, **)
    expect(page).to have_selector(selector, *, **)
    expect_no_browser_errors
  rescue ::RSpec::Expectations::ExpectationNotMetError => e
    expect_no_browser_errors
    raise ::ApiMaker::SpecHelper::SelectorNotFoundError, e.message
  end

  # Waits for a form field's value to settle to +with+, then returns the field.
  #
  # +field+ is a Capybara field locator — name, id, label, or placeholder (the
  # same locators find_field accepts), not a CSS selector. For a field that can
  # only be located by CSS, locate it with find and use wait_for_expect on its
  # value instead.
  #
  # Guards against editing a field before its rendered value has settled (e.g. a
  # controlled input that fills in asynchronously): calling fill_in / .set too
  # early appends to the stale value instead of replacing it.
  #
  # Error reporting mirrors wait_for_selector: expect_no_browser_errors is called
  # on success, and — importantly — it is called FIRST on timeout, so a JS error
  # that prevented the value from settling is surfaced with its stack trace
  # rather than a bare SelectorNotFoundError.
  def wait_for_field(field, with:, **)
    expect(page).to have_field(field, with:, **)
    expect_no_browser_errors
    find_field(field, **)
  rescue ::RSpec::Expectations::ExpectationNotMetError => e
    expect_no_browser_errors
    raise ::ApiMaker::SpecHelper::SelectorNotFoundError, e.message
  end

  # Waits for +field+ (a Capybara field locator) to settle to +with+ when given,
  # then replaces the field's value with +value+, self-healing against a
  # re-render that re-applies the field's stale value and concatenates it onto
  # the new one.
  #
  # The api_maker inputs are uncontrolled React inputs, so Capybara's #set
  # (clear then type) can lose that race and leave e.g. "AdminDonald" instead of
  # "Donald". Like the other wait helpers, browser JS errors are surfaced: they
  # are checked on success and throughout the retries, so a JS error that
  # prevented the value from taking is raised with its stack trace instead of a
  # bare mismatch.
  def wait_for_field_value(field, value, with: nil, max_attempts: 5)
    wait_for_field(field, with:) if with

    value = value.to_s

    max_attempts.times do |attempt|
      type_into_field(field, value)

      return find_field(field) if field_value_settled?(field, value)
      raise if attempt == max_attempts - 1
    end
  end

  def wait_for_selectors(*selectors)
    selectors.each do |selector|
      wait_for_selector(selector)
    end
  end

  def wait_for_no_selector(selector, *, **)
    expect(page).to have_no_selector(selector, *, **)
    expect_no_browser_errors
  rescue ::RSpec::Expectations::ExpectationNotMetError => e
    expect_no_browser_errors
    raise ::ApiMaker::SpecHelper::SelectorFoundError, e.message
  end

  def wait_for_order_of_elements(selector, callback, expected_order)
    wait_for_expect do
      order = all(selector).map { |element| callback.call(element) }
      expect(order).to eq expected_order
    end
  end

private

  # Focuses +field+, selects and deletes its current content, then types +value+
  # with raw Selenium actions (Capybara's #set clear can be undone by a re-render
  # that re-applies the stale value).
  def type_into_field(field, value)
    element = find_field(field)
    # The raw move_to below does not auto-scroll, so bring the field into view
    # first (it can be below the fold in a narrow CI browser).
    page.execute_script("arguments[0].scrollIntoView({ block: 'center' })", element)

    action = page.driver.browser.action
      .move_to(element.native, 5, 5)
      .click
      .key_down(:left_control)
      .send_keys("a")
      .key_up(:left_control)
      .send_keys(:backspace)

    value.each_char { |char| action = action.send_keys(char) }
    action.perform

    element
  end

  # True once +field+'s value has settled to +value+.
  def field_value_settled?(field, value)
    wait_for_expect(timeout_sec: 3) { expect(find_field(field).value).to eq value }
    true
  rescue ::RSpec::Expectations::ExpectationNotMetError
    false
  end
end
