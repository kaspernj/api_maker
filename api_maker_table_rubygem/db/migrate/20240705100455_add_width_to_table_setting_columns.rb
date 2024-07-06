class AddWidthToTableSettingColumns < ActiveRecord::Migration[7.0]
  def change
    add_column :table_setting_columns, :width, :integer
  end
end
