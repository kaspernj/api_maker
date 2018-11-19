class Resources::AccountResource < Resources::ApplicationResource
  attributes :id, :name
  relationships :projects
end
