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
  def wait_for_field(field, with:, **options)
    expect(page).to have_field(field, with:, **options)
    expect_no_browser_errors
    find_field(field, **options)
  rescue ::RSpec::Expectations::ExpectationNotMetError => e
    expect_no_browser_errors
    raise ::ApiMaker::SpecHelper::SelectorNotFoundError, e.message
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
end
