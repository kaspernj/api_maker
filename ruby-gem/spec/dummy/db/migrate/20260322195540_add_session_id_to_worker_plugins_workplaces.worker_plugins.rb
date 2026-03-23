# This migration comes from worker_plugins (originally 20260322194625)
class AddSessionIdToWorkerPluginsWorkplaces < ActiveRecord::Migration[7.2]
  def change
    change_table :worker_plugins_workplaces, bulk: true do |t|
      t.string :session_id
    end

    add_index :worker_plugins_workplaces, :session_id, unique: true
  end
end
