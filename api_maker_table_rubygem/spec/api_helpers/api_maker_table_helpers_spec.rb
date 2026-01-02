# frozen_string_literal: true

require "minitest/autorun"
require_relative "../../app/api_maker/api_helpers/api_maker_table_helpers"

class ApiMakerTableHelpersSpec < Minitest::Test
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

  def test_current_workplace_does_not_create_when_lock_never_acquired
    user = FakeUser.new(current_workplace: nil, lock_results: [false, false, false])
    helper = HelperHost.new(user)

    workplace = helper.current_workplace

    assert_nil workplace
    refute user.created?
  end

  def test_current_workplace_returns_existing_when_lock_not_acquired
    existing = FakeWorkplace.new("Existing workplace")
    user = FakeUser.new(current_workplace: existing, lock_results: [false])
    helper = HelperHost.new(user)

    workplace = helper.current_workplace

    assert_equal existing, workplace
    assert_equal "Existing workplace", workplace.name
    refute user.created?
  end

  def test_current_workplace_creates_after_retry_when_lock_acquired
    user = FakeUser.new(current_workplace: nil, lock_results: [false, true])
    helper = HelperHost.new(user)

    workplace = helper.current_workplace

    assert_instance_of FakeWorkplace, workplace
    assert_equal "Current workplace", workplace.name
    assert user.created?
  end
end
