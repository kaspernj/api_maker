class ApplicationCable::Channel < ActionCable::Channel::Base
private

  delegate :authorize!, :can?, to: :current_ability

  def current_ability
    @current_ability ||= ApiMaker::Ability.new(api_maker_args: {current_user:})
  end

  def current_user
    @current_user ||= env["warden"].user
  end
end
