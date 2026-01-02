require "rails_helper"

describe "api_maker_table helpers" do
  let(:fake_workplace_class) do
    Class.new do
      attr_reader :name

      def initialize(name)
        @name = name
      end
    end
  end

  let(:fake_user_class) do
    workplace_class = fake_workplace_class

    Class.new do
      attr_reader :id
      attr_accessor :current_workplace

      define_method(:initialize) do |id: 1, current_workplace: nil, lock_results: [false]|
        @id = id
        @current_workplace = current_workplace
        @created = false
        @lock_results = lock_results
        @lock_calls = 0
        @workplace_class = workplace_class
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

      def create_current_workplace!(name:, _user: nil)
        @created = true
        self.current_workplace = @workplace_class.new(name)
        current_workplace
      end

      def save!
        true
      end

      def created?
        @created
      end
    end
  end

  let(:helper_host_class) do
    Class.new do
      include ApiHelpers::ApiMakerTableHelpers

      attr_reader :current_user

      def initialize(user)
        @current_user = user
      end
    end
  end

  describe "#current_workplace" do
    it "returns nil when the lock is never acquired" do
      user = fake_user_class.new(current_workplace: nil, lock_results: [false, false, false])
      helper = helper_host_class.new(user)

      workplace = helper.current_workplace

      expect(workplace).to be_nil
      expect(user).not_to be_created
    end

    it "returns existing when the lock is not acquired" do
      existing = fake_workplace_class.new("Existing workplace")
      user = fake_user_class.new(current_workplace: existing, lock_results: [false])
      helper = helper_host_class.new(user)

      workplace = helper.current_workplace

      expect(workplace).to eq(existing)
      expect(workplace.name).to eq("Existing workplace")
      expect(user).not_to be_created
    end

    it "creates after retry when the lock is acquired" do
      user = fake_user_class.new(current_workplace: nil, lock_results: [false, true])
      helper = helper_host_class.new(user)

      workplace = helper.current_workplace

      expect(workplace).to be_a(fake_workplace_class)
      expect(workplace.name).to eq("Current workplace")
      expect(user).to be_created
    end
  end
end
