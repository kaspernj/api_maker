class ApiMakerAbility
  include CanCan::Ability

  CRUD = [:create, :read, :update, :destroy].freeze

  def initialize(controller:) # rubocop:disable Lint/UnusedMethodArgument
    can CRUD, Project
    can CRUD, Task
    can CRUD, User
  end
end
