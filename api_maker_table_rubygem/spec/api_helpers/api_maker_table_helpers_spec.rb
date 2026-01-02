require "rspec"

module ApiHelpers
end

require_relative "../../app/api_maker/api_helpers/api_maker_table_helpers"

describe "api_maker_table helpers" do
  class FakeWorkplace
    attr_reader :name

    def initialize(name)
      @name = name
    end
  end

  class FakeUser
    attr_reader :id
    attr_accessor :current_workplace

    def initialize(id: 1, current_workplace: nil, lock_results: [false])
      @id = id
      @current_workplace = current_workplace
      @created = false
      @lock_results = lock_results
      @lock_calls = 0
    end

    def with_advisory_lock(_key)
      result = @lock_results[@lock_calls]
      @lock_calls += 1
      result = @lock_results.last if result.nil?
      return false unless result

      yield
    end

    def reload
      self
    end

    def create_current_workplace!(name:, user:)
      @created = true
      self.current_workplace = FakeWorkplace.new(name)
      self.current_workplace
    end

    def save!
      true
    end

    def created?
      @created
    end
  end

  class HelperHost
    include ApiHelpers::ApiMakerTableHelpers

    def initialize(user)
      @current_user = user
    end

    def current_user
      @current_user
    end
  end

  describe "#current_workplace" do
    it "creates when the lock is never acquired" do
      user = FakeUser.new(current_workplace: nil, lock_results: [false, false, false])
      helper = HelperHost.new(user)

      workplace = helper.current_workplace

      expect(workplace).to be_a(FakeWorkplace)
      expect(workplace.name).to eq("Current workplace")
      expect(user).to be_created
    end

    it "returns existing when the lock is not acquired" do
      existing = FakeWorkplace.new("Existing workplace")
      user = FakeUser.new(current_workplace: existing, lock_results: [false])
      helper = HelperHost.new(user)

      workplace = helper.current_workplace

      expect(workplace).to eq(existing)
      expect(workplace.name).to eq("Existing workplace")
      expect(user).not_to be_created
    end

    it "creates after retry when the lock is acquired" do
      user = FakeUser.new(current_workplace: nil, lock_results: [false, true])
      helper = HelperHost.new(user)

      workplace = helper.current_workplace

      expect(workplace).to be_a(FakeWorkplace)
      expect(workplace.name).to eq("Current workplace")
      expect(user).to be_created
    end
  end
end
