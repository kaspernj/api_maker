class ApiMaker::IndexCommand < ApiMaker::BaseCommand
  def execute!
    ApiMaker::Configuration.profile(-> { "IndexCommand: #{model_class.name}" }) do
      Rails.logger.debug { "API maker: IndexCommand execute: #{model_class.name} with Ransack: #{ransack_args}" }

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

private

  def ransack_args
    q_args = command.args&.dig(:q)
    return unless q_args

    if q_args.respond_to?(:permit!)
      q_args.permit!.to_h
    else
      q_args.to_h
    end
  end
end
