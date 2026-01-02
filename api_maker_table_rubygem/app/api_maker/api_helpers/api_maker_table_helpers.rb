module ApiHelpers
  module ApiMakerTableHelpers
    def current_workplace
      @current_workplace ||= begin
        workplace = nil
        lock_key = "API-MAKER-CURRENT-WORKPLACE-#{current_user.id}"
        attempts = 0
        max_attempts = 3

        while workplace.nil? && attempts < max_attempts
          attempts += 1

          current_user.with_advisory_lock(lock_key) do
            current_user.reload

            unless current_user.current_workplace
              current_user.create_current_workplace!(name: "Current workplace", user: current_user)
              current_user.save!
            end

            workplace = current_user.current_workplace
          end

          break if workplace

          current_user.reload
          workplace = current_user.current_workplace

          sleep(0.01) if workplace.nil? && attempts < max_attempts
        end

        workplace
      end
    end
  end
end
