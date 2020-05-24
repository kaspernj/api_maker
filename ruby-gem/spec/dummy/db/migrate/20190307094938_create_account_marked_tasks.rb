class CreateAccountMarkedTasks < ActiveRecord::Migration[5.2]
  def change
    create_table :account_marked_tasks do |t|
      t.references :account, foreign_key: true, null: false
      t.references :task, foreign_key: true, null: false
      t.timestamps
    end
  end
end
