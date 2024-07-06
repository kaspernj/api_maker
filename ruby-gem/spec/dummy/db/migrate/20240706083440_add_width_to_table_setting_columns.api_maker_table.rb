# This migration comes from api_maker_table (originally 20240705100455)
class AddWidthToTableSettingColumns < ActiveRecord::Migration[7.0]
  def change
    add_column :table_setting_columns, :width, :integer
  end
end
