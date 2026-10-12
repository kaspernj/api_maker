require "rails_helper"

describe "spec helper" do
  describe "#reset_indexeddb" do
    it "resets the indexed db without failing" do
      visit root_path
      reset_indexeddb
    end
  end

  describe "#wait_for_field" do
    before do
      visit devise_specs_sign_in_path
    end

    it "returns the field once its value has settled" do
      field = wait_for_field("email", with: "")

      expect(field).to be_a(Capybara::Node::Element)
      expect(field[:id]).to eq "email"
      expect(field.value).to eq ""
    end

    it "passes forwarded options to the field lookup" do
      field = wait_for_field("email", with: "", visible: :all)

      expect(field).to be_a(Capybara::Node::Element)
      expect(field[:id]).to eq "email"
    end

    it "raises SelectorNotFoundError when the value never settles" do
      expect do
        wait_for_field("email", with: "a value the field never has")
      end.to raise_error(ApiMaker::SpecHelper::SelectorNotFoundError)
    end
  end

  describe "#wait_for_field_value" do
    before do
      visit devise_specs_sign_in_path
    end

    it "replaces the field value and returns the field" do
      field = wait_for_field_value("email", "spec-test@example.com")

      expect(field).to be_a(Capybara::Node::Element)
      expect(field[:id]).to eq "email"
      expect(field.value).to eq "spec-test@example.com"
    end

    it "waits for the current value to settle to the given value before replacing it" do
      field = wait_for_field_value("email", "second@example.com", with: "")

      expect(field.value).to eq "second@example.com"
    end

    it "raises SelectorNotFoundError when the current value never settles" do
      expect do
        wait_for_field_value("email", "x", with: "a value the field never has")
      end.to raise_error(ApiMaker::SpecHelper::SelectorNotFoundError)
    end
  end

  describe "#raise_browser_errors" do
    it "does nothing when there are no errors" do
      expect { raise_browser_errors([]) }.not_to raise_error
    end

    it "raises the single error directly" do
      error = ApiMaker::SpecHelper::JavaScriptError.new("only error")

      expect { raise_browser_errors([error]) }.to raise_error(ApiMaker::SpecHelper::JavaScriptError, "only error")
    end

    it "aggregates multiple errors into a MultipleExceptionError" do
      errors = [
        ApiMaker::SpecHelper::JavaScriptError.new("first error"),
        ApiMaker::SpecHelper::JavaScriptError.new("second error")
      ]

      expect { raise_browser_errors(errors) }.to raise_error(RSpec::Core::MultipleExceptionError) do |raised|
        expect(raised.all_exceptions.map(&:message)).to eq ["first error", "second error"]
      end
    end
  end

  describe "#expect_no_browser_errors" do
    it "does not raise when there are no browser errors" do
      allow(self).to receive_messages(
        browser_window_error_exceptions: [],
        browser_console_error_exceptions: []
      )

      expect { expect_no_browser_errors }.not_to raise_error
    end

    it "reports a single window error directly" do
      window_error = ApiMaker::SpecHelper::JavaScriptError.new("only error")

      allow(self).to receive_messages(
        browser_window_error_exceptions: [window_error],
        browser_console_error_exceptions: []
      )

      expect { expect_no_browser_errors }.to raise_error(ApiMaker::SpecHelper::JavaScriptError, "only error")
    end

    it "aggregates the window errors and the console errors" do
      window_error = ApiMaker::SpecHelper::JavaScriptError.new("window error")
      console_error = ApiMaker::SpecHelper::JavaScriptError.new("console error")

      allow(self).to receive_messages(
        browser_window_error_exceptions: [window_error],
        browser_console_error_exceptions: [console_error]
      )

      expect { expect_no_browser_errors }.to raise_error(RSpec::Core::MultipleExceptionError) do |raised|
        expect(raised.all_exceptions).to eq [window_error, console_error]
      end
    end

    it "reports an actual JS error recorded by window.errorLogger" do
      visit root_path
      execute_script("setTimeout(() => { throw new Error('api-maker spec test error') })")

      expect { expect_no_browser_errors }.to raise_error(/api-maker spec test error/)
    end
  end
end
