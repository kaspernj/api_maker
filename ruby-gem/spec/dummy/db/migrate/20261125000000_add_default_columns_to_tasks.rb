class AddDefaultColumnsToTasks < ActiveRecord::Migration[6.1]
  def change
    add_column :tasks, :scheduled_at, :datetime, default: "2000-01-01 12:34:56"
    add_column :tasks, :weight, :float, default: 0.0
  end
end
