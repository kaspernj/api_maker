class Resources::CustomerResource < Resources::ApplicationResource
  attributes :id, :name

  def abilities
    can :read, Customer
  end
end
