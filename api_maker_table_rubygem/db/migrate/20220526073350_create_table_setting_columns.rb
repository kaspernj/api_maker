class CreateTableSettingColumns < ActiveRecord::Migration[7.0]
  def change
    create_table :table_setting_columns do |t|
      t.references :table_setting, foreign_key: true, null: false
      t.string :identifier, index: true, null: false
      t.string :attribute
      t.text :path
      t.string :sort_key
      t.boolean :visible, default: true, null: false
      t.timestamps
    end

    add_index :table_setting_columns, [:table_setting_id, :identifier], unique: true
  end
end
