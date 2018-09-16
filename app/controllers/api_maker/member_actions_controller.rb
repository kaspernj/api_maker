class ApiMaker::MemberActionsController < ApiMaker::BaseController
  def create
    namespace = params[:plural_name].camelize
    command = params[:member_method].camelize
    constant = "Commands::#{namespace}::#{command}"
    instance = constant.constantize.new(
      args: params[:args],
      controller: self
    )
    instance.execute!
  end
end
