class AddBirthdayAtToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :birthday_at, :date
  end
end
