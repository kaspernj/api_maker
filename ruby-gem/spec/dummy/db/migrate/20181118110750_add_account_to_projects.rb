class AddAccountToProjects < ActiveRecord::Migration[5.2]
  def change
    add_reference :projects, :account, foreign_key: true
  end
end
