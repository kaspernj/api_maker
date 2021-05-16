class AddIllegalToProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :illegal, :boolean, default: false, null: false
  end
end
