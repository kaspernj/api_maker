class AddCustomerToAccounts < ActiveRecord::Migration[5.2]
  def change
    add_reference :accounts, :customer, foreign_key: true
  end
end
