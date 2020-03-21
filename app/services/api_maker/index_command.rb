class ApiMaker::IndexCommand < ApiMaker::BaseCommand
  def execute!
    ApiMaker::Configuration.profile("IndexCommand execute") do
      each_command do |command|
        result = ApiMaker::CollectionLoader.execute!(
          ability: current_ability,
          args: api_maker_args,
          collection: collection,
          params: command.args || {}
        )
        command.result(result)
      end
    end
  end
end
