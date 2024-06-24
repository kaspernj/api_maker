class Commands::Users::FailureSaveResponse < Commands::ApplicationCommand
  alias user model

  def execute!
    user.update(params)

    raise "Model is valid" unless user.invalid?

    failure_save_response(
      additional_attributes: args.fetch(:additional_attributes),
      model: user,
      params:,
      simple_model_errors: args.fetch(:simple_model_errors)
    )
  end

  def params
    args.require(:user).permit(:password)
  end
end
