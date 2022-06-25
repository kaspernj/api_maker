class Resources::TableSettingResource < ApiMaker::BaseResource
  self.model_class_name = "ApiMakerTable::TableSetting"

  attributes :id, :identifier
  relationships :columns

  def abilities
    can CRUD, ApiMakerTable::TableSetting, user_id: current_user.id, user_type: current_user.class.name if current_user
  end

  def permitted_params(arg)
    arg.params.require(:table_setting).permit(
      :identifier,
      :user_id,
      :user_type,
      columns_attributes: [:attribute_name, :id, :identifier, :position, :sort_key, :visible, :_destroy, path: []]
    )
  end
end
