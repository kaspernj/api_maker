class ApiMaker::IndexCommand < ApiMaker::BaseCommand
  def execute!
    ApiMaker::Configuration.profile(-> { "IndexCommand: #{model_class.name}" }) do
      Rails.logger.debug { "API maker: IndexCommand execute: #{model_class.name} with Ransack: #{command.args&.dig(:q)&.permit!&.to_h}" }

      result = ApiMaker::CollectionLoader.execute!(
        ability: current_ability,
        api_maker_args:,
        collection:,
        locals:,
        params: command.args || {}
      )
      succeed!(result)
    end
  end
end
