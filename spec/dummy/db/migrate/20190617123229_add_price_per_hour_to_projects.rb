class AddPricePerHourToProjects < ActiveRecord::Migration[5.2]
  def change
    add_column :projects, :price_per_hour_cents, :integer
    add_column :projects, :price_per_hour_currency, :string
  end
end
