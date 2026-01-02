module ApiHelpers::ApiMakerTableHelpers
  def current_workplace
    @current_workplace ||= begin
      workplace = nil

      current_user.with_advisory_lock("API-MAKER-CURRENT-WORKPLACE-#{current_user.id}") do
        current_user.reload

        unless current_user.current_workplace
          current_user.create_current_workplace!(name: "Current workplace", user: current_user)
          current_user.save!
        end

        workplace = current_user.current_workplace
      end

      unless workplace
        current_user.reload
        workplace = current_user.current_workplace

        unless workplace
          workplace = current_user.create_current_workplace!(name: "Current workplace", user: current_user)
          current_user.save!
        end
      end

      workplace
    end
  end
end
