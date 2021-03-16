class Resources::TaskDetailResource < Resources::ApplicationResource
  def abilities
    can_access_through ability: :test_accessible_by, relationship: :task
    can_access_through ability: :read, relationship: :task
  end
end
