require "rails_helper"

describe ApiMaker::RelationshipPreloader do
  it "parses strings" do
    result = ApiMaker::RelationshipPreloader.parse(["listing.address", "listing.commodity", "listing.user"])
    expect(result).to eq("listing" => %w[address commodity user])
  end

  it "parses hashes" do
    result = ApiMaker::RelationshipPreloader.parse({project: "account"})
    expect(result).to eq("project" => {"account" => ""})
  end

  it "parses nested hashes and arrays" do
    result = ApiMaker::RelationshipPreloader.parse({project: {account: ["projects", "tasks"]}})
    expect(result).to eq("project" => {"account" => {"projects" => "", "tasks" => ""}})
  end

  it "merges repeated nested hash preloads in arrays" do
    result = ApiMaker::RelationshipPreloader.parse([{project: {account: "projects"}}, {project: {account: "tasks"}}])
    expect(result).to eq("project" => {"account" => {"projects" => "", "tasks" => ""}})
  end
end
