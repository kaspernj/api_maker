require "rails_helper"

describe "model find" do
  it "finds the model", :js do
    visit models_find_path

    puts page.html

    expect(current_path).to eq models_find_path
  end
end
