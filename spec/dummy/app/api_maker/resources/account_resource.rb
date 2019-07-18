class Resources::AccountResource < Resources::ApplicationResource
  attributes :id, :name
  relationships :projects

  def abilities
    can :read, Account
  end
end
