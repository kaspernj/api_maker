class CreateWorkplaces < ActiveRecord::Migration[7.0]
  def change
    create_table :worker_plugins_workplaces do |t|
      t.string :name, null: false
      t.boolean :active, default: false, index: true, null: false
      t.belongs_to :user, index: true
      t.timestamps
    end
  end
end
