class ApiMaker::CommandsController < ApiMaker::BaseController
  def create
    if params[:collection_command]
      authorize!(params[:collection_command].to_sym, klass)
    else
      ability_name = params[:member_command].to_sym
      model = klass.accessible_by(current_ability, ability_name).find(params[:id])
      raise CanCan::AccessDefined.new("Not authorized!", ability_name, klass) unless model
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
