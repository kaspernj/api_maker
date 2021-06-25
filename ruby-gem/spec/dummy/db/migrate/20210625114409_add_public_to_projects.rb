class AddPublicToProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :public, :boolean, default: false, null: false
  end
end
