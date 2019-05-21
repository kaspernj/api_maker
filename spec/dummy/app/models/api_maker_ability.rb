class ApiMakerAbility
  include CanCan::Ability

  CRUD = [:create, :read, :update, :destroy].freeze

  def initialize(args:)
    current_user = args.fetch(:current_user)

    can :read, Account
    can CRUD, Project
    can CRUD, ProjectDetail
    can CRUD + [:accessible_by, :test_collection, :test_member, :validate, :update_events], Task, user_id: current_user&.id
    can CRUD, User
    can :test_accessible_by, Task, id: 3
  end
end
