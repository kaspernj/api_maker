class CreateProjectDetails < ActiveRecord::Migration[5.2]
  def change
    create_table :project_details do |t|
      t.integer :project_id, null: false
      t.string :details
      t.timestamps
    end

    add_index :project_details, :project_id, unique: true
    add_foreign_key :project_details, :projects
  end
end
