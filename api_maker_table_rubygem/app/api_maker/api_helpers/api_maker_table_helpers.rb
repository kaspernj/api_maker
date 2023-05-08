module ApiHelpers::ApiMakerTableHelpers
  def current_workplace
    @current_workplace ||= current_user.with_advisory_lock("API-MAKER-CURRENT-WORKPLACE-#{current_user.id}") do
      current_user.reload

      unless current_user.current_workplace
        current_user.create_current_workplace!(name: "Current workplace", user: current_user)
        current_user.save!
      end

      current_user.current_workplace
    end
  end
end
