class Commands::Workplaces::SwitchQueryOnWorkplace < Commands::ApplicationCommand
  def execute!
    model_class = args.fetch(:model_class).safe_constantize
    query = model_class
      .accessible_by(current_ability)
      .where(tenant: current_tenant)
      .ransack(args&.dig(:ransack_query))
      .result
      .fix

    response = ::Workplaces::SwitchQueryOnWorkplace.execute(query: query, workplace: current_workplace)

    if response.success?
      succeed!(mode: response.result.fetch(:mode))
    else
      fail_command_from_service_error_response(response)
    end
  end
end
