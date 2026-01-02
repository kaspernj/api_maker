require "rails_helper"

describe "api_maker_table helpers" do
  before do
    stub_const("FakeWorkplace", Struct.new(:name))

    stub_const(
      "FakeUser",
      Struct.new(:id, :current_workplace, :lock_results, :lock_calls, :created, keyword_init: true) do
        def initialize(id: 1, current_workplace: nil, lock_results: [false])
          super(
            id:,
            current_workplace:,
            lock_results:,
            lock_calls: 0,
            created: false
          )
        end

        def with_advisory_lock(_key)
          result = lock_results[lock_calls]
          self.lock_calls = lock_calls + 1
          result = lock_results.last if result.nil?
          return false unless result

          yield
        end

        def reload
          self
        end

        def create_current_workplace!(name:, user:)
          _user = user
          self.created = true
          self.current_workplace = FakeWorkplace.new(name)
          current_workplace
        end

        def save!
          true
        end

        def created?
          created
        end
      end
    )

    stub_const(
      "HelperHost",
      Struct.new(:current_user) do
        include ApiHelpers::ApiMakerTableHelpers
      end
    )
  end

  describe "#current_workplace" do
    it "returns nil when the lock is never acquired" do
      user = FakeUser.new(current_workplace: nil, lock_results: [false, false, false])
      helper = HelperHost.new(user)

      workplace = helper.current_workplace

      expect(workplace).to be_nil
      expect(user).not_to be_created
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
