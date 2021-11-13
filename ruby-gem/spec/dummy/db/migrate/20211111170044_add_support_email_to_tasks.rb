class AddSupportEmailToTasks < ActiveRecord::Migration[6.1]
  def change
    add_column :tasks, :support_email, :string
  end
end
