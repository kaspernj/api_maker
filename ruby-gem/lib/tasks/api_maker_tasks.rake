namespace :api_maker do
  task "generate_models" => :environment do
    ApiMaker::ModelsGeneratorService.execute!
  end
end
