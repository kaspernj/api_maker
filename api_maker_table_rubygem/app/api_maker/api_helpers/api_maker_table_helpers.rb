# frozen_string_literal: true

module ApiHelpers
  # Shared helpers for ApiMaker table workplace lookups.
  module ApiMakerTableHelpers
    CURRENT_WORKPLACE_NAME = "Current workplace"
    MAX_CURRENT_WORKPLACE_ATTEMPTS = 3

    def current_workplace
      return nil if current_user.nil? && current_session_id.blank?
      return @current_workplace if defined?(@current_workplace)

      @current_workplace = current_user.present? ? current_user_workplace : current_session_workplace
    end

    def current_session_id
      api_maker_args&.dig(:current_session_id)
    end

    private

    def current_user_workplace
      find_workplace_with_retries(
        fallback: -> { reload_current_user_workplace },
        lock_key: "API-MAKER-CURRENT-WORKPLACE-USER-#{current_user.id}"
      ) do |lock_key|
        current_user.with_advisory_lock!(lock_key, timeout_seconds: 10) do
          current_user.reload
          ensure_current_user_workplace!
          current_user.current_workplace
        end
      end
    end

    def current_session_workplace
      find_workplace_with_retries(
        fallback: -> { WorkerPlugins::Workplace.find_by(session_id: current_session_id) },
        lock_key: "API-MAKER-CURRENT-WORKPLACE-SESSION-#{current_session_id}"
      ) do |lock_key|
        WorkerPlugins::Workplace.with_advisory_lock!(lock_key, timeout_seconds: 10) do
          WorkerPlugins::Workplace.find_or_create_by!(session_id: current_session_id) do |new_workplace|
            new_workplace.name = CURRENT_WORKPLACE_NAME
          end
        end
      end
    end

    def ensure_current_user_workplace!
      return if current_user.current_workplace

      current_user.create_current_workplace!(name: CURRENT_WORKPLACE_NAME, user: current_user)
      current_user.save!
    end

    def find_workplace_with_retries(fallback:, lock_key:)
      attempts = 0
      workplace = nil

      while workplace.nil? && attempts < MAX_CURRENT_WORKPLACE_ATTEMPTS
        attempts += 1
        workplace = yield(lock_key)
        workplace ||= fallback.call
        sleep(0.01) if workplace.nil? && attempts < MAX_CURRENT_WORKPLACE_ATTEMPTS
      end

      workplace || fallback.call
    end

    def reload_current_user_workplace
      current_user.reload
      current_user.current_workplace
    end
  end
end
