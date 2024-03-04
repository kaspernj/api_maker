class Resources::TableSettingColumnResource < ApiMaker::BaseResource
  self.model_class_name = "ApiMakerTable::TableSettingColumn"

  attributes :attribute_name, :id, :identifier, :path, :position, :sort_key, :visible
  relationships :table_setting

  def abilities
    if current_user
      can CRUD, ApiMakerTable::TableSettingColumn, table_setting: {user_id: current_user.id, user_type: current_user.model_name.name}
    else
      can CRUD, ApiMakerTable::TableSettingColumn, table_setting: {user_type: [nil, ""]}
    end
  end

  def permitted_params(arg)
    arg.params.require(:table_setting_column).permit(:visible)
  end
end
