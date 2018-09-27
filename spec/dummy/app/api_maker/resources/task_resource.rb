class Resources::TaskResource < Resources::ApplicationResource
  collection_commands [:test_collection]
  member_commands [:test_member]
end
