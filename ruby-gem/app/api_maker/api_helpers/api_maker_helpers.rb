module ApiHelpers::ApiMakerHelpers
  def self.included(base)
    base.delegate :can?, to: :current_ability
  end

  def locals
    @locals ||= ApiMaker::LocalsFromController.execute!(controller: controller)
  end
end
