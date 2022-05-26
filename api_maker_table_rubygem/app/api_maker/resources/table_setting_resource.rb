class Resources::TableSettingResource < ApiMaker::BaseResource
  self.model_class_name = "ApiMakerTable::TableSetting"

  attributes :id

  def abilities
    can READ, ApiMakerTable::TableSetting, user_id: current_user.id, user_type: current_user.class.name
  end
end
