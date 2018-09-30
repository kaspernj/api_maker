class ApiMakerAbility
  include CanCan::Ability

  CRUD = [:create, :read, :update, :destroy].freeze

  def initialize(controller:) # rubocop:disable Lint/UnusedMethodArgument
    can CRUD, Project
    can CRUD + [:test_collection, :test_member, :validate], Task
    can CRUD, User
  end
end
