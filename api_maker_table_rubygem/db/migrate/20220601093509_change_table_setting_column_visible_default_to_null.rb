class ChangeTableSettingColumnVisibleDefaultToNull < ActiveRecord::Migration[7.0]
  def change
    change_column_default :table_setting_columns, :visible, from: true, to: nil
    change_column_null :table_setting_columns, :visible, true
  end
end
