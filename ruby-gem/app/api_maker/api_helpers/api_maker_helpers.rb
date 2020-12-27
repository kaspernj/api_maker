module ApiHelpers::ApiMakerHelpers
  def locals
    @locals ||= ApiMaker::LocalsFromController.execute!(controller: controller)
  end
end
