class Resources::TableSearchResource < ApiMaker::BaseResource
  USER_TYPE_COLUMN = ApiMakerTable::TableSearch.column_names.include?("user_type") rescue true

  self.model_class_name = "ApiMakerTable::TableSearch"

  attributes :created_at, :id, :name, :public, :query_params, :updated_at, :user_id
  attributes :user_type if USER_TYPE_COLUMN

  def abilities
    can READ, ApiMakerTable::TableSearch, public: true

    if current_user
      if USER_TYPE_COLUMN
        can CRUD, ApiMakerTable::TableSearch, user_id: current_user.id, user_type: current_user.model_name.name
      else
        can CRUD, ApiMakerTable::TableSearch, user_id: current_user.id
      end
    else
      if USER_TYPE_COLUMN
        can CRUD, ApiMakerTable::TableSearch, user_id: nil, user_type: [nil, ""]
      else
        can CRUD, ApiMakerTable::TableSearch, user_id: nil
      end
    end
  end

  def permitted_params(arg)
    permitted = [:name, :public, :query_params, :user_id]
    permitted << :user_type if USER_TYPE_COLUMN

    arg.params.require(:table_search).permit(*permitted)
  end
end
