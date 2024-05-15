class CreateWorkplaceLinks < ActiveRecord::Migration[7.0]
  def change
    create_table :worker_plugins_workplace_links do |t|
      t.references :workplace, index: {name: "index_on_workplace_id"}, null: false
      t.belongs_to :resource, index: {name: "index_on_resource"}, null: false, polymorphic: true
      t.json :custom_data
      t.timestamps
    end

    add_index :worker_plugins_workplace_links, [:workplace_id, :resource_type, :resource_id], unique: true, name: "unique_resource_on_workspace"
    add_foreign_key :worker_plugins_workplace_links, :worker_plugins_workplaces, column: "workplace_id"
  end
end
