class ApiMakerAbility
  include CanCan::Ability

  CRUD = [:create, :read, :update, :destroy].freeze

  def initialize(controller:) # rubocop:disable Lint/UnusedMethodArgument
    current_user = controller.current_user

    can CRUD, Project
    can CRUD + [:test_collection, :test_member, :validate], Task, user_id: current_user&.id
    can CRUD, User
  end
end
