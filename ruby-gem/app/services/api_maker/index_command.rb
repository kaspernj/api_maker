class ApiMaker::IndexCommand < ApiMaker::BaseCommand
  def execute!
    ApiMaker::Configuration.profile("IndexCommand execute") do
      Rails.logger.debug "API maker: Running index for #{collection.klass.name} with Ransack: #{command.args&.dig(:q)&.permit!&.to_h}"

      result = ApiMaker::CollectionLoader.execute!(
        ability: current_ability,
        args: api_maker_args,
        collection: collection,
        locals: locals,
        params: command.args || {}
      )
      succeed!(result)
    end
  end
end
