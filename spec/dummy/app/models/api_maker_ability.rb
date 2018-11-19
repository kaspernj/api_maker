class ApiMakerAbility
  include CanCan::Ability

  CRUD = [:create, :read, :update, :destroy].freeze

  def initialize(args:)
    current_user = args.fetch(:current_user)

    can CRUD, Project
    can CRUD, ProjectDetail
    can CRUD + [:test_collection, :test_member, :validate], Task, user_id: current_user&.id
    can CRUD, User
  end
end
