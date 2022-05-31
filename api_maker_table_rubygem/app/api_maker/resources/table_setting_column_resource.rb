class Resources::TableSettingColumnResource < ApiMaker::BaseResource
  self.model_class_name = "ApiMakerTable::TableSettingColumn"

  attributes :attribute_name, :id, :path, :position, :sort_key, :visible
  relationships :table_setting

  def abilities
    can CRUD, ApiMakerTable::TableSetting, table_setting: {user_id: current_user.id, user_type: current_user.class.name} if current_user
  end
end
