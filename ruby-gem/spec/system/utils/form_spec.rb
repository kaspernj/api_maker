require "rails_helper"

describe "utils - form" do
  let(:user) { create :user }

  it "uses provided form input objects and only forwards htmlFormProps to the web form" do
    login_as user
    visit utils_form_path

    wait_for_selector "[data-testid='utils-form-web-form']#utils-form-html-props[data-html-prop='true'].utils-form-html-class"

    form = wait_for_and_find("[data-testid='utils-form-web-form']")

    expect(form[:class]).not_to include("utils-form-should-not-forward")

    wait_for_and_find("[data-testid='utils-form-input']").set("Saved through provided form")
    wait_for_and_find("[data-testid='utils-form-submit']").click
    wait_for_selector "[data-testid='utils-form-submitted-value']", exact_text: "Saved through provided form"
  end
end
