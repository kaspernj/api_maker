class ApplicationCable::Channel < ActionCable::Channel::Base
private

  delegate :authorize!, :can?, to: :current_ability

  def current_ability
    @current_ability ||= ApiMakerAbility.new(args: {current_user: current_user})
  end

  def current_user
    @current_user ||= env["warden"].user
  end
end
