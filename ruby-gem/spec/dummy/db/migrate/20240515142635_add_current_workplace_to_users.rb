class AddCurrentWorkplaceToUsers < ActiveRecord::Migration[7.0]
  def change
    add_reference :users, :current_workplace, foreign_key: {to_table: :worker_plugins_workplaces}
  end
end
