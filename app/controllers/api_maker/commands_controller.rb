class ApiMaker::CommandsController < ApiMaker::BaseController
  def create
    namespace = params[:plural_name].camelize
    klass = params[:plural_name].singularize.camelize.constantize

    if params[:collection_method]
      authorize!(params[:collection_method].to_sym, klass)
      command = params[:collection_method].camelize
    else
      model = klass.find(params[:id])
      authorize!(params[:member_method], model)
      command = params[:member_method].camelize
    end

    constant = "Commands::#{namespace}::#{command}"
    instance = constant.constantize.new(
      args: params[:args],
      controller: self
    )
    instance.execute!
  end
end
