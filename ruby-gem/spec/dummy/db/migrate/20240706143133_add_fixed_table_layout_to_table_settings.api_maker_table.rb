# This migration comes from api_maker_table (originally 20240706143112)
class AddFixedTableLayoutToTableSettings < ActiveRecord::Migration[7.0]
  def change
    add_column :table_settings, :fixed_table_layout, :boolean, default: false, null: false
  end
end
