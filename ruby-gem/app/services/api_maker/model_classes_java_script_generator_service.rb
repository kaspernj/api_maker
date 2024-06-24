class ApiMaker::ModelClassesJavaScriptGeneratorService < ApiMaker::ApplicationService
  def perform
    result = {
      models: {}
    }

    resources.each do |resource|
      result[:models][resource.short_name] = ApiMaker::ModelContentGeneratorService.execute!(resource:)
    end

    succeed! result
  end

  def resources
    @resources ||= ApiMaker::ModelsFinderService.execute!
  end
end
