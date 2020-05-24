class AddDeletedAtToProjectDetails < ActiveRecord::Migration[6.0]
  def change
    add_column :project_details, :deleted_at, :datetime
    add_index :project_details, :deleted_at
  end
end
