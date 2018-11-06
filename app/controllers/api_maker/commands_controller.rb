class ApiMaker::CommandsController < ApiMaker::BaseController
  def create
    if params[:collection_command]
      authorize!(params[:collection_command].to_sym, klass)
    else
      model = klass.find(params[:id])
      authorize!(params[:member_command].to_sym, model)
    end

    instance = constant.new(args: params[:args], controller: self, model: model)
    instance.execute!
  end

private

  def constant
    @constant ||= proc do
      command = params[:collection_command]&.camelize || params[:member_command].camelize
      "Commands::#{namespace}::#{command}".constantize
    end.call
  end

  def klass
    @klass ||= params[:plural_name].singularize.camelize.constantize
  end

  def namespace
    @namespace ||= params[:plural_name].camelize
  end
end
