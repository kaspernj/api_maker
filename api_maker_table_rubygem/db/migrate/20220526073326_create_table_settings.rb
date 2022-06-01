class CreateTableSettings < ActiveRecord::Migration[7.0]
  def change
    create_table :table_settings do |t|
      t.references :user, limit: 36, null: false, polymorphic: true, type: :string
      t.string :identifier, index: true, null: false
      t.timestamps
    end

    add_index :table_settings, [:user_id, :user_type, :identifier], unique: true
  end
end
