class Resources::TableSearchResource < ApiMaker::BaseResource
  self.model_class_name = "ApiMakerTable::TableSearch"

  def abilities
    if current_user
      can CRUD, ApiMakerTable::TableSearch, user_id: current_user.id, user_type: current_user.class.name
    else
      can CRUD, ApiMakerTable::TableSearch, user_type: [nil, ""]
    end
  end

  def permitted_params(arg)
    arg.params.require(:table_search).permit(:name, :query_params)
  end
end
