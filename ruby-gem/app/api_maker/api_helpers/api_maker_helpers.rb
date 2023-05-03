module ApiHelpers::ApiMakerHelpers
  def self.included(base)
    base.delegate :can?, to: :current_ability
  end

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

  def locals
    @locals ||= ApiMaker::LocalsFromController.execute!(controller: controller)
  end
end
