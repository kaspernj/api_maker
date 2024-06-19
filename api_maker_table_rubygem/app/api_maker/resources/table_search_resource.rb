class Resources::TableSearchResource < ApiMaker::BaseResource
  self.model_class_name = "ApiMakerTable::TableSearch"

  attributes :created_at, :id, :name, :public, :query_params, :updated_at, :user_id, :user_type

  def abilities
    can READ, ApiMakerTable::TableSearch, public: true

    if current_user
      can CRUD, ApiMakerTable::TableSearch, user_id: current_user.id, user_type: current_user.model_name.name
    else
      can CRUD, ApiMakerTable::TableSearch, user_type: [nil, ""]
    end
  end

  def permitted_params(arg)
    arg.params.require(:table_search).permit(:name, :public, :query_params, :user_id, :user_type)
  end
end
