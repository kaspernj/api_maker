class Resources::TableSettingResource < ApiMaker::BaseResource
  self.model_class_name = "ApiMakerTable::TableSetting"

  attributes :id
end
