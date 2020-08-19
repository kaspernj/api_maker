class Resources::ProjectResource < Resources::ApplicationResource
  attributes :account_id, :id, :name, :created_at, :price_per_hour
  relationships :polymorphic_model, :project_detail, :tasks

  def abilities
    can CRUD, Project if signed_in?
  end

  def permitted_params(arg)
    arg.params.require(:project).permit(:account_id, :name, :price_per_hour_cents, :price_per_hour_currency)
  end
end
