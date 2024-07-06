class AddFixedTableLayoutToTableSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :table_settings, :fixed_table_layout, :boolean, default: false, null: false
  end
end
