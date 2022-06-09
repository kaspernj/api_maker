class CreateTableSettings < ActiveRecord::Migration[6.1]
  def change
    create_table :table_settings do |t|
      t.references :user, null: false, polymorphic: true
      t.string :identifier, index: true, null: false
      t.timestamps
    end

    add_index :table_settings, [:user_id, :user_type, :identifier], unique: true
  end
end
