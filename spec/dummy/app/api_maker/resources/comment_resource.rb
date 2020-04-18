class Resources::CommentResource < Resources::ApplicationResource
  attributes :id, :comment
  relationships :author

  def abilities
    can :read, Comment
  end
end
