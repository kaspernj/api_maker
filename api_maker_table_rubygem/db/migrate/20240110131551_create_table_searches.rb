class CreateTableSearches < ActiveRecord::Migration[7.0]
  def change
    create_table :table_searches do |t|
      t.string :name, null: false
      t.text :query_params, null: false
      t.references :user, polymorphic: true
      t.timestamps
    end
  end
end
