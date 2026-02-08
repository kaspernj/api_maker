# frozen_string_literal: true

require "rails_helper"

describe "utils - global request data" do
  it "sends CommandsPool globalRequestData for instant requests" do
    visit "/utils/global-request-data"

    wait_for_selector("[data-testid='global-request-data-layout']", text: "admin")
    wait_for_selector("[data-testid='global-request-data-test-key']", text: "expected")
  end
end
